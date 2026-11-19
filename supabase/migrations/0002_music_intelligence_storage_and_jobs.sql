-- ============================================================================
-- SONORA — Phase 4.1 Additive Supabase Migration: Audio Assets, Processing Jobs
--          & Private Storage Bucket Provisioning
-- File: supabase/migrations/0002_music_intelligence_storage_and_jobs.sql
--
-- Scope (strictly additive — preserves all 0001 tables, auth, roles & policies):
--   1. Reusable authorization & path-safety helper functions:
--        - public.is_active_account()
--        - public.is_valid_user_audio_path(uuid, text)
--   2. Persistent metadata table: public.audio_assets
--        - Stores private recording references, format, duration, size & SHA-256
--          checksums (never binary audio blobs).
--   3. Persistent job table: public.processing_jobs
--        - Tracks asynchronous Music Intelligence Engine jobs, idempotency keys,
--          verified audio metadata, derived artifact references & error details.
--   4. Performance & uniqueness indexes (including partial active-job & idempotency).
--   5. Integrity & immutability triggers:
--        - Reuses public.set_updated_at() from 0001_initial_schema.sql
--        - Guards audio_assets ownership, path immutability & server-verified stamps
--        - Guards processing_jobs ownership, cross-user asset links & state machine
--   6. Least-privilege table/function grants & Row Level Security (RLS) policies:
--        - audio_assets: active authenticated users manage ONLY their own rows
--        - processing_jobs: active authenticated users have SELECT-ONLY on own rows;
--          writes are restricted to backend service_role
--   7. Private Supabase Storage bucket `sonora-audio` (public = false, 100 MiB cap,
--      allowlisted audio & music artifact MIME types) + per-user UUID namespace
--      storage.objects RLS policies.
--
-- IMPORTANT:
--   Review thoroughly before applying to the live SONORA Supabase project.
--   This migration is strictly additive and idempotent for safe application.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Helper Functions (Account Activity & User Namespace Path Validation)
-- ----------------------------------------------------------------------------

-- Verify the authenticated caller has an active profile (blocks suspended/archived users).
create or replace function public.is_active_account()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.account_status = 'active'
    );
$$;

comment on function public.is_active_account() is
  'Returns true only when auth.uid() resolves to a public.profiles row with account_status = ''active''.';

-- Enforce strict `{user_id}/...` namespace partitioning with safe characters and no traversal.
create or replace function public.is_valid_user_audio_path(
  owner_id uuid,
  path_value text
)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, public, pg_temp
as $$
  select char_length(path_value) between 3 and 512
    and path_value ~ ('^' || owner_id::text || '/[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*$')
    and path_value !~ '(^|/)\.\.?(/|$)';
$$;

comment on function public.is_valid_user_audio_path(uuid, text) is
  'Validates that a storage object path stays strictly inside {owner_id}/... without path traversal or disallowed characters.';

revoke all on function public.is_active_account() from public, anon;
grant execute on function public.is_active_account() to authenticated, service_role;

revoke all on function public.is_valid_user_audio_path(uuid, text) from public, anon;
grant execute on function public.is_valid_user_audio_path(uuid, text) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 2. Audio Assets Table (`public.audio_assets`)
-- ----------------------------------------------------------------------------

create table if not exists public.audio_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bucket text not null default 'sonora-audio',
  object_path text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  duration_ms integer,
  detected_format text,
  sha256_checksum text,
  sample_rate_hz integer,
  channels integer,
  codec_name text,
  bit_rate_bps integer,
  bit_depth integer,
  original_preserved boolean not null default true,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Uniqueness & ownership integrity
  constraint audio_assets_bucket_object_path_key unique (bucket, object_path),
  constraint audio_assets_id_user_id_key unique (id, user_id),

  -- Domain & security constraints
  constraint audio_assets_bucket_allowed check (bucket = 'sonora-audio'),
  constraint audio_assets_filename_nonempty check (char_length(trim(original_filename)) between 1 and 255),
  constraint audio_assets_object_path_valid check (
    char_length(object_path) between 3 and 512
    and object_path ~ ('^' || user_id::text || '/[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*$')
    and object_path !~ '(^|/)\.\.?(/|$)'
  ),
  constraint audio_assets_mime_type_valid check (
    lower(trim(mime_type)) in (
      'audio/wav',
      'audio/x-wav',
      'audio/wave',
      'audio/vnd.wave',
      'audio/mpeg',
      'audio/mp3',
      'audio/flac',
      'audio/x-flac',
      'audio/mp4',
      'audio/x-m4a',
      'audio/m4a',
      'audio/aac',
      'audio/aacp',
      'audio/ogg',
      'application/ogg',
      'audio/webm'
    )
  ),
  constraint audio_assets_size_bytes_bounds check (size_bytes > 0 and size_bytes <= 104857600),
  constraint audio_assets_duration_ms_positive check (duration_ms is null or (duration_ms > 0 and duration_ms <= 900000)),
  constraint audio_assets_detected_format_allowed check (
    detected_format is null
    or detected_format in ('wav', 'mp3', 'flac', 'm4a', 'aac', 'ogg', 'webm')
  ),
  constraint audio_assets_sha256_format check (
    sha256_checksum is null
    or sha256_checksum ~ '^[0-9a-f]{64}$'
  ),
  constraint audio_assets_sample_rate_valid check (sample_rate_hz is null or sample_rate_hz >= 8000),
  constraint audio_assets_channels_valid check (channels is null or channels between 1 and 16),
  constraint audio_assets_bit_rate_positive check (bit_rate_bps is null or bit_rate_bps > 0),
  constraint audio_assets_bit_depth_valid check (bit_depth is null or bit_depth between 8 and 64)
);

comment on table public.audio_assets is
  'User-owned audio asset metadata and private Supabase Storage object references. Binary audio files live in the private sonora-audio bucket, never in Postgres.';

comment on column public.audio_assets.object_path is
  'Storage object key inside sonora-audio, strictly prefixed by {user_id}/ to isolate private user recordings.';

comment on column public.audio_assets.verified_at is
  'Timestamp set exclusively by the Music Intelligence Engine (service_role) after FFprobe and checksum verification.';

-- ----------------------------------------------------------------------------
-- 3. Processing Jobs Table (`public.processing_jobs`)
-- ----------------------------------------------------------------------------

create table if not exists public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  audio_asset_id uuid references public.audio_assets(id) on delete set null,
  job_type text not null,
  status text not null default 'queued',
  progress_percent integer not null default 0,
  stage text not null default 'queued',
  idempotency_key text,
  source_audio jsonb not null,
  trim_window jsonb,
  parameters jsonb not null default '{}'::jsonb,
  studio_context text,
  audio_metadata jsonb,
  artifacts jsonb not null default '[]'::jsonb,
  result jsonb,
  error jsonb,
  error_code text generated always as (nullif(trim(error ->> 'code'), '')) stored,
  error_message text generated always as (nullif(trim(error ->> 'message'), '')) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,

  -- Domain & state-integrity constraints
  constraint processing_jobs_job_type_allowed check (
    job_type in (
      'audio_analysis',
      'instrument_detection',
      'source_separation',
      'pitch_extraction',
      'music_transcription',
      'accompaniment_generation',
      'audio_rendering'
    )
  ),
  constraint processing_jobs_status_allowed check (
    status in ('queued', 'processing', 'completed', 'failed', 'cancelled')
  ),
  constraint processing_jobs_progress_bounds check (progress_percent between 0 and 100),
  constraint processing_jobs_stage_nonempty check (char_length(trim(stage)) between 1 and 120),
  constraint processing_jobs_idempotency_key_len check (
    idempotency_key is null
    or char_length(trim(idempotency_key)) between 4 and 128
  ),
  constraint processing_jobs_studio_context_len check (
    studio_context is null
    or char_length(trim(studio_context)) between 1 and 64
  ),
  constraint processing_jobs_source_audio_object check (jsonb_typeof(source_audio) = 'object'),
  constraint processing_jobs_trim_window_object check (
    trim_window is null or jsonb_typeof(trim_window) = 'object'
  ),
  constraint processing_jobs_parameters_object check (jsonb_typeof(parameters) = 'object'),
  constraint processing_jobs_audio_metadata_object check (
    audio_metadata is null or jsonb_typeof(audio_metadata) = 'object'
  ),
  constraint processing_jobs_artifacts_array check (jsonb_typeof(artifacts) = 'array'),
  constraint processing_jobs_result_object check (
    result is null or jsonb_typeof(result) = 'object'
  ),
  constraint processing_jobs_error_object check (
    error is null or jsonb_typeof(error) = 'object'
  ),
  constraint processing_jobs_timestamps_order check (
    (started_at is null or started_at >= created_at)
    and (completed_at is null or completed_at >= created_at)
    and (cancelled_at is null or cancelled_at >= created_at)
  )
);

comment on table public.processing_jobs is
  'Asynchronous Music Intelligence Engine job records. Users can read only their own jobs; writes and state transitions are managed exclusively by the backend service.';

comment on column public.processing_jobs.audio_asset_id is
  'Optional FK to public.audio_assets(id). Set to NULL if the source asset row is later removed, preserving job history.';

comment on column public.processing_jobs.error_code is
  'Generated stored column extracted from error->>''code'' for structured error querying and indexing.';

comment on column public.processing_jobs.error_message is
  'Generated stored column extracted from error->>''message'' for human-readable error reporting.';

-- ----------------------------------------------------------------------------
-- 4. Indexes (Ownership Lookups, Idempotency, Concurrency Quotas & Queueing)
-- ----------------------------------------------------------------------------

create index if not exists idx_audio_assets_user_created
  on public.audio_assets (user_id, created_at desc);

create index if not exists idx_audio_assets_user_checksum
  on public.audio_assets (user_id, sha256_checksum)
  where sha256_checksum is not null;

create index if not exists idx_audio_assets_user_format
  on public.audio_assets (user_id, detected_format)
  where detected_format is not null;

create unique index if not exists uq_processing_jobs_user_idempotency
  on public.processing_jobs (user_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists idx_processing_jobs_user_created
  on public.processing_jobs (user_id, created_at desc);

create index if not exists idx_processing_jobs_user_active
  on public.processing_jobs (user_id, status)
  where status in ('queued', 'processing');

create index if not exists idx_processing_jobs_audio_asset_id
  on public.processing_jobs (audio_asset_id)
  where audio_asset_id is not null;

create index if not exists idx_processing_jobs_status_created
  on public.processing_jobs (status, created_at asc)
  where status in ('queued', 'processing');

create index if not exists idx_processing_jobs_error_code
  on public.processing_jobs (error_code)
  where error_code is not null;

-- ----------------------------------------------------------------------------
-- 5. Integrity, Ownership & Timestamp Triggers
-- ----------------------------------------------------------------------------

-- 5a. Protect audio_assets against cross-user ownership hijacking, path mutation,
--     and client-forged server verification timestamps.
create or replace function public.protect_audio_asset_integrity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
begin
  if not public.is_valid_user_audio_path(new.user_id, new.object_path) then
    raise exception 'Audio asset object_path must remain strictly within the owner UUID namespace.';
  end if;

  if tg_op = 'INSERT' then
    if auth.uid() is not null then
      if new.user_id <> auth.uid() then
        raise exception 'Cannot register an audio asset for another user.';
      end if;
      -- Only the backend Music Intelligence Engine (service_role) may stamp server verification.
      new.verified_at := null;
      new.original_preserved := true;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;

    if new.id <> old.id
       or new.user_id <> old.user_id
       or new.bucket <> old.bucket
       or new.object_path <> old.object_path then
      raise exception 'Audio asset identity, ownership, bucket, and storage object_path are immutable.';
    end if;

    if auth.uid() is not null then
      if new.verified_at is distinct from old.verified_at then
        raise exception 'Server verification timestamps cannot be modified by clients.';
      end if;
      if new.original_preserved is distinct from old.original_preserved then
        raise exception 'Original preservation flag cannot be modified by clients.';
      end if;
    end if;
    return new;
  end if;

  return new;
end;
$$;

-- 5b. Protect processing_jobs against direct client writes, cross-user asset linking,
--     ownership/type/idempotency mutation, and invalid terminal state transitions.
create or replace function public.protect_processing_job_integrity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
declare
  src_path text;
begin
  -- Defense-in-depth: even if write grants were ever altered, authenticated clients cannot write jobs directly.
  -- Permit only PostgreSQL's internal FK ON DELETE SET NULL cascade when an owner deletes their own audio_asset.
  if auth.uid() is not null then
    if not (
      tg_op = 'UPDATE'
      and pg_catalog.pg_trigger_depth() > 1
      and old.audio_asset_id is not null
      and new.audio_asset_id is null
      and new.id = old.id
      and new.user_id = old.user_id
      and new.job_type = old.job_type
      and new.status = old.status
      and new.progress_percent = old.progress_percent
      and new.stage = old.stage
      and new.idempotency_key is not distinct from old.idempotency_key
      and new.source_audio is not distinct from old.source_audio
      and new.trim_window is not distinct from old.trim_window
      and new.parameters is not distinct from old.parameters
      and new.studio_context is not distinct from old.studio_context
      and new.audio_metadata is not distinct from old.audio_metadata
      and new.artifacts is not distinct from old.artifacts
      and new.result is not distinct from old.result
      and new.error is not distinct from old.error
      and new.started_at is not distinct from old.started_at
      and new.completed_at is not distinct from old.completed_at
      and new.cancelled_at is not distinct from old.cancelled_at
    ) then
      raise exception 'Processing jobs are managed exclusively by the Music Intelligence Engine service.';
    end if;
  end if;

  -- Enforce that any referenced audio_asset belongs to the exact same user_id.
  if new.audio_asset_id is not null then
    if not exists (
      select 1
      from public.audio_assets aa
      where aa.id = new.audio_asset_id
        and aa.user_id = new.user_id
    ) then
      raise exception 'Referenced audio_asset_id does not exist or does not belong to job user_id.';
    end if;
  end if;

  -- Enforce that source_audio.object_path (when present) stays within the owner UUID namespace.
  src_path := new.source_audio ->> 'object_path';
  if src_path is null or not public.is_valid_user_audio_path(new.user_id, src_path) then
    raise exception 'Job source_audio.object_path must reside inside the owner UUID namespace.';
  end if;

  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;

    if new.id <> old.id
       or new.user_id <> old.user_id
       or new.job_type <> old.job_type then
      raise exception 'Job identifier, owner user_id, and job_type are immutable.';
    end if;

    if old.idempotency_key is not null
       and new.idempotency_key is distinct from old.idempotency_key then
      raise exception 'Job idempotency_key cannot be modified after creation.';
    end if;

    -- Enforce monotonic state transitions: terminal states cannot revert or switch.
    if new.status is distinct from old.status then
      if old.status in ('completed', 'failed', 'cancelled') then
        raise exception 'Terminal processing jobs (%) cannot transition to %.', old.status, new.status;
      end if;
      if old.status = 'processing' and new.status = 'queued' then
        raise exception 'A processing job cannot revert back to queued.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.protect_audio_asset_integrity() from public, anon, authenticated;
grant execute on function public.protect_audio_asset_integrity() to service_role;

revoke all on function public.protect_processing_job_integrity() from public, anon, authenticated;
grant execute on function public.protect_processing_job_integrity() to service_role;

-- Attach triggers idempotently
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_trigger
    where tgname = 'trg_audio_assets_updated_at'
      and tgrelid = 'public.audio_assets'::regclass
  ) then
    create trigger trg_audio_assets_updated_at
      before update on public.audio_assets
      for each row
      execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_catalog.pg_trigger
    where tgname = 'trg_audio_assets_protect_integrity'
      and tgrelid = 'public.audio_assets'::regclass
  ) then
    create trigger trg_audio_assets_protect_integrity
      before insert or update on public.audio_assets
      for each row
      execute function public.protect_audio_asset_integrity();
  end if;

  if not exists (
    select 1 from pg_catalog.pg_trigger
    where tgname = 'trg_processing_jobs_updated_at'
      and tgrelid = 'public.processing_jobs'::regclass
  ) then
    create trigger trg_processing_jobs_updated_at
      before update on public.processing_jobs
      for each row
      execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_catalog.pg_trigger
    where tgname = 'trg_processing_jobs_protect_integrity'
      and tgrelid = 'public.processing_jobs'::regclass
  ) then
    create trigger trg_processing_jobs_protect_integrity
      before insert or update on public.processing_jobs
      for each row
      execute function public.protect_processing_job_integrity();
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. Table Privileges & Row Level Security (RLS)
-- ----------------------------------------------------------------------------

alter table public.audio_assets enable row level security;
alter table public.processing_jobs enable row level security;

-- Lock down default grants on the new tables
revoke all on table public.audio_assets from public, anon, authenticated;
revoke all on table public.processing_jobs from public, anon, authenticated;

-- Authenticated users may read and manage ONLY their own audio_assets (enforced by RLS + trigger)
grant select, insert, update, delete on table public.audio_assets to authenticated;

-- Authenticated users may ONLY read their own processing_jobs; no direct client writes or deletes
grant select on table public.processing_jobs to authenticated;

-- Backend Music Intelligence Engine (service_role) retains full table management access
grant all on table public.audio_assets to service_role;
grant all on table public.processing_jobs to service_role;

-- 6a. RLS Policies for public.audio_assets
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'audio_assets'
      and policyname = 'audio_assets_select_own'
  ) then
    create policy audio_assets_select_own
      on public.audio_assets
      for select
      to authenticated
      using (
        public.is_active_account()
        and user_id = auth.uid()
      );
  end if;

  if not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'audio_assets'
      and policyname = 'audio_assets_insert_own'
  ) then
    create policy audio_assets_insert_own
      on public.audio_assets
      for insert
      to authenticated
      with check (
        public.is_active_account()
        and user_id = auth.uid()
        and bucket = 'sonora-audio'
        and public.is_valid_user_audio_path(auth.uid(), object_path)
      );
  end if;

  if not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'audio_assets'
      and policyname = 'audio_assets_update_own'
  ) then
    create policy audio_assets_update_own
      on public.audio_assets
      for update
      to authenticated
      using (
        public.is_active_account()
        and user_id = auth.uid()
      )
      with check (
        public.is_active_account()
        and user_id = auth.uid()
        and bucket = 'sonora-audio'
        and public.is_valid_user_audio_path(auth.uid(), object_path)
      );
  end if;

  if not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'audio_assets'
      and policyname = 'audio_assets_delete_own'
  ) then
    create policy audio_assets_delete_own
      on public.audio_assets
      for delete
      to authenticated
      using (
        public.is_active_account()
        and user_id = auth.uid()
      );
  end if;
end;
$$;

-- 6b. RLS Policies for public.processing_jobs (SELECT-only for owning authenticated users)
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'processing_jobs'
      and policyname = 'processing_jobs_select_own'
  ) then
    create policy processing_jobs_select_own
      on public.processing_jobs
      for select
      to authenticated
      using (
        public.is_active_account()
        and user_id = auth.uid()
      );
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 7. Private Supabase Storage Bucket (`sonora-audio`) & Storage RLS Policies
-- ----------------------------------------------------------------------------

-- Provision the private bucket idempotently; enforces public = false, 100 MiB size cap,
-- and an explicit allowlist of audio & music notation artifact MIME types.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'sonora-audio',
  'sonora-audio',
  false,
  104857600,
  array[
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/vnd.wave',
    'audio/mpeg',
    'audio/mp3',
    'audio/flac',
    'audio/x-flac',
    'audio/mp4',
    'audio/x-m4a',
    'audio/m4a',
    'audio/aac',
    'audio/aacp',
    'audio/ogg',
    'application/ogg',
    'audio/webm',
    'audio/midi',
    'audio/x-midi',
    'application/vnd.recordare.musicxml+xml',
    'application/vnd.recordare.musicxml',
    'application/xml'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Ensure RLS is enabled on storage.objects only if not already enabled (avoids owner errors on hosted Supabase).
do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'storage'
      and c.relname = 'objects'
      and c.relrowsecurity = false
  ) then
    execute 'alter table storage.objects enable row level security';
  end if;
end;
$$;

-- Storage RLS policies restricting all operations in `sonora-audio` strictly to `{auth.uid()}/...`
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'sonora_audio_objects_select_own'
  ) then
    create policy sonora_audio_objects_select_own
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'sonora-audio'
        and public.is_active_account()
        and (storage.foldername(name))[1] = auth.uid()::text
        and public.is_valid_user_audio_path(auth.uid(), name)
      );
  end if;

  if not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'sonora_audio_objects_insert_own'
  ) then
    create policy sonora_audio_objects_insert_own
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'sonora-audio'
        and public.is_active_account()
        and (storage.foldername(name))[1] = auth.uid()::text
        and public.is_valid_user_audio_path(auth.uid(), name)
        and owner_id = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'sonora_audio_objects_update_own'
  ) then
    create policy sonora_audio_objects_update_own
      on storage.objects
      for update
      to authenticated
      using (
        bucket_id = 'sonora-audio'
        and public.is_active_account()
        and (storage.foldername(name))[1] = auth.uid()::text
        and public.is_valid_user_audio_path(auth.uid(), name)
        and owner_id = auth.uid()::text
      )
      with check (
        bucket_id = 'sonora-audio'
        and public.is_active_account()
        and (storage.foldername(name))[1] = auth.uid()::text
        and public.is_valid_user_audio_path(auth.uid(), name)
        and owner_id = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'sonora_audio_objects_delete_own'
  ) then
    create policy sonora_audio_objects_delete_own
      on storage.objects
      for delete
      to authenticated
      using (
        bucket_id = 'sonora-audio'
        and public.is_active_account()
        and (storage.foldername(name))[1] = auth.uid()::text
        and public.is_valid_user_audio_path(auth.uid(), name)
      );
  end if;
end;
$$;

commit;
