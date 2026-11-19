from __future__ import annotations

import re
from pathlib import Path

from app.audio.validation import FORMAT_MIME_TYPES
from app.jobs.repository import SupabaseJobRepository
from app.schemas.audio import AudioFormat, AudioSourceRef, StorageBackendType
from app.schemas.jobs import JobResponse, JobStatus, JobType
from datetime import datetime, timezone

REPO_ROOT = Path(__file__).resolve().parents[3]
MIGRATION_0001 = REPO_ROOT / "supabase" / "migrations" / "0001_initial_schema.sql"
MIGRATION_0002 = REPO_ROOT / "supabase" / "migrations" / "0002_music_intelligence_storage_and_jobs.sql"


def _read_sql() -> str:
    assert MIGRATION_0002.exists(), f"Missing migration file: {MIGRATION_0002}"
    return MIGRATION_0002.read_text(encoding="utf-8")


def _strip_sql_comments(sql: str) -> str:
    lines = [line for line in sql.splitlines() if not line.lstrip().startswith("--")]
    return "\n".join(lines)


def test_migration_0002_is_additive_transactional_and_balanced():
    sql = _read_sql()
    code = _strip_sql_comments(sql)
    lower = code.lower()

    # Wrapped in an explicit transaction
    assert re.search(r"^\s*begin;\s*$", lower, re.MULTILINE)
    assert re.search(r"^\s*commit;\s*$", lower, re.MULTILINE)

    # Balanced dollar-quote delimiters ($$)
    assert code.count("$$") % 2 == 0
    assert code.count("$$") >= 10

    # Strictly additive: never drops, truncates, or alters pre-existing 0001 tables
    forbidden_destructive = [
        r"\bdrop\s+table\b",
        r"\bdrop\s+schema\b",
        r"\bdrop\s+type\b",
        r"\bdrop\s+policy\b",
        r"\btruncate\s+table\b",
        r"\balter\s+table\s+public\.profiles\b",
        r"\balter\s+table\s+public\.user_roles\b",
        r"\bdelete\s+from\b",
    ]
    for pattern in forbidden_destructive:
        assert not re.search(pattern, lower), f"Forbidden destructive statement matched: {pattern}"

    # Existing migration 0001 remains untouched
    assert MIGRATION_0001.exists()


def test_migration_0002_defines_required_audio_assets_and_processing_jobs_columns():
    lower = _strip_sql_comments(_read_sql()).lower()

    assert "create table if not exists public.audio_assets" in lower
    for col in [
        "id uuid primary key",
        "user_id uuid not null references public.profiles(id) on delete cascade",
        "bucket text not null default 'sonora-audio'",
        "object_path text not null",
        "original_filename text not null",
        "mime_type text not null",
        "size_bytes bigint not null",
        "duration_ms integer",
        "detected_format text",
        "sha256_checksum text",
        "created_at timestamptz not null default now()",
    ]:
        assert col in lower, f"Missing expected audio_assets column definition: {col}"

    assert "create table if not exists public.processing_jobs" in lower
    for col in [
        "id uuid primary key",
        "user_id uuid not null references public.profiles(id) on delete cascade",
        "audio_asset_id uuid references public.audio_assets(id) on delete set null",
        "job_type text not null",
        "status text not null default 'queued'",
        "idempotency_key text",
        "parameters jsonb not null default '{}'::jsonb",
        "audio_metadata jsonb",
        "artifacts jsonb not null default '[]'::jsonb",
        "error jsonb",
        "error_code text generated always as",
        "error_message text generated always as",
        "created_at timestamptz not null default now()",
        "started_at timestamptz",
        "completed_at timestamptz",
        "cancelled_at timestamptz",
    ]:
        assert col in lower, f"Missing expected processing_jobs column definition: {col}"

    # All 7 JobTypes and 5 JobStatuses match Python enums
    for jt in JobType:
        assert f"'{jt.value}'" in lower, f"Missing JobType '{jt.value}' in SQL check constraint"
    for js in JobStatus:
        assert f"'{js.value}'" in lower, f"Missing JobStatus '{js.value}' in SQL check constraint"
    for fmt in AudioFormat:
        assert f"'{fmt.value}'" in lower, f"Missing AudioFormat '{fmt.value}' in SQL check constraint"


def test_migration_0002_matches_supabase_job_repository_serialized_keys():
    lower = _strip_sql_comments(_read_sql()).lower()
    now = datetime.now(timezone.utc)
    sample = JobResponse(
        job_id="44444444-4444-4444-8444-444444444444",
        user_id="11111111-1111-4111-8111-111111111111",
        job_type=JobType.AUDIO_ANALYSIS,
        status=JobStatus.QUEUED,
        progress_percent=0,
        stage="queued",
        source_audio=AudioSourceRef(
            storage_backend=StorageBackendType.SUPABASE,
            bucket="sonora-audio",
            object_path="11111111-1111-4111-8111-111111111111/uploads/take.wav",
            asset_id="33333333-3333-4333-8333-333333333333",
        ),
        created_at=now,
        updated_at=now,
    )
    serialized = SupabaseJobRepository._serialize(sample, idempotency_key="idem-check-01")
    for column_name in serialized.keys():
        assert re.search(rf"\b{re.escape(column_name)}\b", lower), (
            f"SupabaseJobRepository key '{column_name}' not found in processing_jobs migration"
        )


def test_migration_0002_enforces_rls_least_privilege_and_private_storage_bucket():
    lower = _strip_sql_comments(_read_sql()).lower()

    # RLS enabled on both tables
    assert "alter table public.audio_assets enable row level security;" in lower
    assert "alter table public.processing_jobs enable row level security;" in lower

    # Least-privilege table grants: authenticated gets SELECT-ONLY on processing_jobs
    assert "revoke all on table public.audio_assets from public, anon, authenticated;" in lower
    assert "revoke all on table public.processing_jobs from public, anon, authenticated;" in lower
    assert "grant select, insert, update, delete on table public.audio_assets to authenticated;" in lower
    assert "grant select on table public.processing_jobs to authenticated;" in lower
    assert "grant insert" not in lower.split("processing_jobs to authenticated")[0].split("revoke all on table public.processing_jobs")[1]

    # Guarded idempotent policies on audio_assets, processing_jobs, and storage.objects
    for policy_name in [
        "audio_assets_select_own",
        "audio_assets_insert_own",
        "audio_assets_update_own",
        "audio_assets_delete_own",
        "processing_jobs_select_own",
        "sonora_audio_objects_select_own",
        "sonora_audio_objects_insert_own",
        "sonora_audio_objects_update_own",
        "sonora_audio_objects_delete_own",
    ]:
        assert policy_name in lower, f"Missing expected RLS policy: {policy_name}"

    # Storage bucket is explicitly private (public = false) and allowlists all engine audio MIME types
    assert "insert into storage.buckets" in lower
    assert "'sonora-audio'" in lower
    assert "public = false" in lower
    for mime_list in FORMAT_MIME_TYPES.values():
        for mime in mime_list:
            assert f"'{mime}'" in lower, f"Missing audio MIME type '{mime}' in storage bucket allowlist"

    # Namespace isolation via storage.foldername(name)[1] = auth.uid()::text
    assert "(storage.foldername(name))[1] = auth.uid()::text" in lower


def test_migration_0002_defines_required_indexes_and_triggers():
    lower = _strip_sql_comments(_read_sql()).lower()

    for idx in [
        "idx_audio_assets_user_created",
        "idx_audio_assets_user_checksum",
        "idx_audio_assets_user_format",
        "uq_processing_jobs_user_idempotency",
        "idx_processing_jobs_user_created",
        "idx_processing_jobs_user_active",
        "idx_processing_jobs_audio_asset_id",
        "idx_processing_jobs_status_created",
        "idx_processing_jobs_error_code",
    ]:
        assert idx in lower, f"Missing expected index: {idx}"

    for trg in [
        "trg_audio_assets_updated_at",
        "trg_audio_assets_protect_integrity",
        "trg_processing_jobs_updated_at",
        "trg_processing_jobs_protect_integrity",
    ]:
        assert trg in lower, f"Missing expected trigger: {trg}"


def test_no_service_role_or_secrets_in_frontend_source():
    src_dir = REPO_ROOT / "src"
    secret_token_re = re.compile(r"sb_secret_[A-Za-z0-9_-]{8,}")
    for ts_file in src_dir.rglob("*.ts*"):
        if "test" in ts_file.relative_to(src_dir).parts:
            continue
        text = ts_file.read_text(encoding="utf-8", errors="ignore")
        assert "SUPABASE_SERVICE_ROLE_KEY" not in text, f"Secret env reference found in {ts_file}"
        assert not secret_token_re.search(text), f"Secret token literal found in {ts_file}"


def test_migration_0002_audit_correction_1_fk_on_delete_set_null_trigger_exception():
    code = _strip_sql_comments(_read_sql())
    fn_match = re.search(
        r"create or replace function public\.protect_processing_job_integrity\(\).*?\$\$(.*?)\$\$;",
        code,
        flags=re.S | re.I,
    )
    assert fn_match, "protect_processing_job_integrity() function definition not found"
    fn_body = fn_match.group(1).lower()

    # Authenticated direct writes remain blocked except for the internal FK ON DELETE SET NULL cascade
    assert "if auth.uid() is not null then" in fn_body
    assert "tg_op = 'update'" in fn_body
    assert "pg_catalog.pg_trigger_depth() > 1" in fn_body
    assert "old.audio_asset_id is not null" in fn_body
    assert "new.audio_asset_id is null" in fn_body
    assert "raise exception 'processing jobs are managed exclusively by the music intelligence engine service.';" in fn_body

    # Verify balanced IF / END IF inside the trigger function
    total_if = len(re.findall(r"\bif\b", fn_body))
    total_end_if = len(re.findall(r"\bend\s+if\b", fn_body))
    assert total_if - total_end_if == total_end_if, "Unbalanced IF / END IF blocks in protect_processing_job_integrity()"


def test_migration_0002_audit_correction_2_strict_storage_owner_id_checks():
    code = _strip_sql_comments(_read_sql())
    lower = code.lower()
    storage_section = lower[lower.index("insert into storage.buckets") :]

    # Deprecated storage.objects.owner comparisons must be completely absent
    assert "owner is null" not in storage_section
    assert "owner = auth.uid()" not in storage_section
    assert not re.search(r"\bowner\b", storage_section), "Deprecated standalone 'owner' column reference remains in storage policies"

    # Exactly three strict owner_id = auth.uid()::text checks (INSERT, UPDATE USING, UPDATE WITH CHECK)
    strict_checks = re.findall(r"and\s+owner_id\s*=\s*auth\.uid\(\)::text", storage_section)
    assert len(strict_checks) == 3, f"Expected 3 strict owner_id checks, found {len(strict_checks)}"

