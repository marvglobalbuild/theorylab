# Supabase Schema & Storage Integration Reference

## Existing Database Inspection (`supabase/migrations/0001_initial_schema.sql`)

The existing Supabase schema contains:
- **Identity & RBAC:** `public.profiles` (with `account_status`), `public.user_roles` (`independent_learner`, `student`, `lecturer`, `administrator`), and `SECURITY DEFINER` role helpers (`is_admin()`, `is_lecturer()`, etc.).
- **Curriculum, Classes, Practice, Assessments & Progress:** `learning_paths`, `courses`, `course_modules`, `lessons`, `classes`, `class_memberships`, `course_enrolments`, `exercises`, `questions`, `question_options`, `question_answer_keys`, `assessments`, `assessment_questions`, `assessment_attempts`, `assessment_responses`, `assessment_attempt_snapshots`, `class_assignments`, `lesson_progress`, `notifications`.

No audio asset, processing job, or storage bucket policies existed in `0001_initial_schema.sql`.

## Auth, Storage & Isolation Design

1. **Authentication Reuse:** The FastAPI service verifies the user's Supabase JWT Bearer token (via `SUPABASE_JWT_SECRET` or `GET /auth/v1/user`) and checks `public.profiles.account_status` when `SUPABASE_SERVICE_ROLE_KEY` is configured.
2. **Private Storage Partitioning:** Audio uploads live in the private `sonora-audio` bucket (`public = false`) partitioned strictly by `{user_id}/...`. Both `UserStoragePathGuard` (Python service) and `storage.objects` RLS + `public.is_valid_user_audio_path()` (PostgreSQL) reject path traversal, disallowed buckets, or cross-user object paths.
3. **Metadata vs. Large Media:** Database records store `source_audio` references, `audio_asset_id` foreign keys, verified `audio_metadata` (format, SHA-256, duration, sample rate, channels), and `artifacts` references—never binary audio blobs.

## Phase 4.1 Additive Migration (`supabase/migrations/0002_music_intelligence_storage_and_jobs.sql`)

Prepared for review and application before enabling `MUSIC_ENGINE_JOB_REPOSITORY_BACKEND=supabase` and `MUSIC_ENGINE_STORAGE_BACKEND=supabase`:

- **Helper Functions:**
  - `public.is_active_account()` (`SECURITY DEFINER`): verifies `auth.uid()` resolves to an `active` `public.profiles` row.
  - `public.is_valid_user_audio_path(owner_id uuid, path_value text)` (`IMMUTABLE`): enforces `{owner_id}/...` with safe segment characters and no `.` / `..` traversal.
- **Private Storage Bucket:** `sonora-audio` (`public = false`, `file_size_limit = 104857600`, allowlisted audio & music notation MIME types) with `storage.objects` RLS policies (`sonora_audio_objects_{select,insert,update,delete}_own`) restricting access to active authenticated users inside their own `{auth.uid()}/...` namespace.
- **Tables:**
  - `public.audio_assets`: `id`, `user_id` (`REFERENCES public.profiles(id) ON DELETE CASCADE`), `bucket`, `object_path`, `original_filename`, `mime_type`, `size_bytes`, `duration_ms`, `detected_format`, `sha256_checksum`, `sample_rate_hz`, `channels`, `codec_name`, `bit_rate_bps`, `bit_depth`, `original_preserved`, `verified_at`, `created_at`, `updated_at`. RLS enables active owners to `SELECT/INSERT/UPDATE/DELETE` only their own rows; trigger `trg_audio_assets_protect_integrity` locks immutable identity/path fields and prevents client-forged `verified_at` stamps.
  - `public.processing_jobs`: `id`, `user_id` (`REFERENCES public.profiles(id) ON DELETE CASCADE`), `audio_asset_id` (`REFERENCES public.audio_assets(id) ON DELETE SET NULL`), `job_type`, `status`, `progress_percent`, `stage`, `idempotency_key`, `source_audio`, `trim_window`, `parameters`, `studio_context`, `audio_metadata`, `artifacts`, `result`, `error`, generated stored columns `error_code` and `error_message`, `created_at`, `updated_at`, `started_at`, `completed_at`, `cancelled_at`. `authenticated` has `SELECT`-only grant + RLS `user_id = auth.uid()`; all writes are restricted to `service_role` and guarded by `trg_processing_jobs_protect_integrity` (cross-user asset link prevention, namespace verification, immutable ownership/job_type/idempotency_key, and monotonic state transitions).

See `services/music-engine/docs/SUPABASE_PROVISIONING_GUIDE.md` for exact apply commands and verification SQL queries.
