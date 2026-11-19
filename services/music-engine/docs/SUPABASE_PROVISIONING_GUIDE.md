# SONORA — Phase 4.1 Supabase Provisioning & Verification Guide

This runbook covers reviewing, applying, and verifying `supabase/migrations/0002_music_intelligence_storage_and_jobs.sql` on the existing SONORA Supabase project.

> **Important:** This migration is strictly additive and idempotent. It does **not** alter, drop, or recreate any existing table, role, auth trigger, or RLS policy from `supabase/migrations/0001_initial_schema.sql`.

---

## 1. Prerequisites

1. Verify `supabase/migrations/0001_initial_schema.sql` has already been applied to the target Supabase project (specifically `public.profiles` and `public.set_updated_at()`).
2. Confirm you have project-owner / database-migration access via either:
   - **Supabase CLI** (`supabase login` + `supabase link`), or
   - **Supabase Dashboard SQL Editor** (for manual review-and-run).
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is configured **only** in the Python Music Intelligence Engine (`services/music-engine/.env` or server secret manager) — **never** in any `VITE_*` frontend environment variable.

---

## 2. Applying the Migration

### Option A — Supabase CLI (Recommended for versioned migration tracking)

```bash
# 1. Authenticate and link to the existing SONORA Supabase project
supabase login
supabase link --project-ref <YOUR_SUPABASE_PROJECT_REF>

# 2. Preview pending migrations before applying
supabase migration list

# 3. Apply the additive migration
supabase db push
```

### Option B — Supabase Dashboard SQL Editor

1. Open the SONORA Supabase project → **SQL Editor** → **New query**.
2. Paste the full contents of `supabase/migrations/0002_music_intelligence_storage_and_jobs.sql`.
3. Click **Run** (executes inside a single `BEGIN ... COMMIT` transaction).
4. Confirm the query completes with zero errors.

---

## 3. Post-Apply Verification Queries (Run in SQL Editor)

Run these read-only queries to confirm live provisioning succeeded:

### 3.1 Verify Tables, Columns & Generated Error Columns
```sql
select table_name, column_name, data_type, is_nullable, is_generated
from information_schema.columns
where table_schema = 'public'
  and table_name in ('audio_assets', 'processing_jobs')
order by table_name, ordinal_position;
```

### 3.2 Verify Foreign Keys & Delete Behaviour
```sql
select
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on tc.constraint_name = ccu.constraint_name
 and tc.table_schema = ccu.table_schema
join information_schema.referential_constraints rc
  on tc.constraint_name = rc.constraint_name
 and tc.constraint_schema = rc.constraint_schema
where tc.table_schema = 'public'
  and tc.table_name in ('audio_assets', 'processing_jobs')
  and tc.constraint_type = 'FOREIGN KEY'
order by tc.table_name, tc.constraint_name;
```

### 3.3 Verify Private Storage Bucket (`sonora-audio`)
```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'sonora-audio';
-- Expected: public = false, file_size_limit = 104857600
```

### 3.4 Verify RLS Enabled & Policies Present
```sql
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where (n.nspname = 'public' and c.relname in ('audio_assets', 'processing_jobs'))
   or (n.nspname = 'storage' and c.relname = 'objects');

select schemaname, tablename, policyname, cmd, roles
from pg_catalog.pg_policies
where (schemaname = 'public' and tablename in ('audio_assets', 'processing_jobs'))
   or (schemaname = 'storage' and tablename = 'objects' and policyname like 'sonora_audio_%')
order by schemaname, tablename, policyname;
```

### 3.5 Verify Least-Privilege Grants (`authenticated` must NOT have write grants on `processing_jobs`)
```sql
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('audio_assets', 'processing_jobs')
  and grantee in ('anon', 'authenticated', 'service_role')
order by table_name, grantee, privilege_type;
-- Expected:
--   anon:            (no rows)
--   authenticated:   audio_assets -> SELECT, INSERT, UPDATE, DELETE
--                    processing_jobs -> SELECT only
--   service_role:    audio_assets, processing_jobs -> full privileges
```

### 3.6 Verify Indexes & Triggers
```sql
select tablename, indexname, indexdef
from pg_catalog.pg_indexes
where schemaname = 'public'
  and tablename in ('audio_assets', 'processing_jobs')
order by tablename, indexname;

select event_object_table as table_name, trigger_name, event_manipulation, action_timing
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in ('audio_assets', 'processing_jobs')
order by event_object_table, trigger_name;
```

---

## 4. Live Cross-User Isolation Smoke Test

Using two separate active test accounts (`User A` and `User B`):

1. **Storage isolation:**
   - Authenticated as `User A`, upload a valid WAV file to `sonora-audio/{user_a_id}/uploads/smoke.wav` → must succeed.
   - Authenticated as `User A`, attempt to upload to `sonora-audio/{user_b_id}/uploads/smoke.wav` or `sonora-audio/smoke.wav` → must fail with `403`.
   - Authenticated as `User B`, attempt to download or sign `sonora-audio/{user_a_id}/uploads/smoke.wav` → must fail with `403`/`404`.
2. **Table RLS isolation:**
   - Authenticated as `User A`, insert an `audio_assets` row with `user_id = user_a_id` → must succeed; `verified_at` must remain `null`.
   - Authenticated as `User B`, query `public.audio_assets` → must return 0 rows belonging to `User A`.
   - Authenticated as `User A`, attempt direct `INSERT` or `UPDATE` on `public.processing_jobs` → must fail with `42501` (permission denied).
3. **Music Intelligence Engine persistence:**
   - Set `MUSIC_ENGINE_STORAGE_BACKEND=supabase` and `MUSIC_ENGINE_JOB_REPOSITORY_BACKEND=supabase` on the Python service (`services/music-engine`).
   - Submit `POST /api/v1/jobs` with `User A`'s Supabase Bearer token → row persists in `public.processing_jobs`.
   - Authenticated as `User A`, query `public.processing_jobs` via Supabase client → returns `User A`'s job only.
   - Authenticated as `User B`, query `public.processing_jobs` via Supabase client → returns 0 rows belonging to `User A`.

---

## 5. Operational Notes & Follow-Up Hardening

- **Storage Object Garbage Collection on Account/Asset Deletion:** PostgreSQL `ON DELETE CASCADE` on `public.audio_assets` removes metadata rows when a `profiles` row is deleted, but Postgres triggers cannot directly delete binary objects in Supabase Storage S3 buckets. Before production studio launch, add a backend/Edge Function cleanup routine (or Storage webhook) that deletes the corresponding `sonora-audio` objects whenever an `audio_assets` row or user account is deleted.
- **Artifact Sub-Path Write Protection (Optional Hardening):** Current storage RLS allows an authenticated user to write anywhere inside `{auth.uid()}/...` so client uploads work flexibly across studios. If derived backend outputs under `{auth.uid()}/artifacts/...` should become strictly read-only for clients, add `and (storage.foldername(name))[2] is distinct from 'artifacts'` to `sonora_audio_objects_insert_own` and `sonora_audio_objects_update_own` in a future migration.
