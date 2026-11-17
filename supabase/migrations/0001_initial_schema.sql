-- ============================================================================
-- THEORYLAB — Initial Supabase PostgreSQL Database Migration
-- File: supabase/migrations/0001_initial_schema.sql
--
-- Scope:
--   - Identity & RBAC (profiles, user_roles)
--   - Lecturer management (classes, class_memberships, class_assignments)
--   - Curriculum & enrolments (learning_paths, courses, course_modules, lessons, course_enrolments)
--   - Practice (exercises, questions, question_options, question_answer_keys)
--   - Assessments (assessments, assessment_questions, assessment_attempts, assessment_responses)
--   - Progress & notifications (lesson_progress, notifications)
--   - Authorization helper functions (SECURITY DEFINER, non-recursive)
--   - Triggers (updated_at, auth.users -> profile+role provisioning, integrity guards)
--   - Row Level Security (RLS) policies on all public tables
--
-- IMPORTANT:
--   Review thoroughly before applying to any live Supabase project.
--   Do not run in production without verifying Supabase Auth redirect URLs,
--   service-role usage boundaries, and Edge Function grading endpoints.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Enumerated Types
-- ----------------------------------------------------------------------------

create type public.app_role as enum (
  'independent_learner',
  'student',
  'lecturer',
  'administrator'
);

create type public.theory_level as enum (
  'beginner',
  'elementary',
  'intermediate',
  'advanced'
);

create type public.content_status as enum (
  'draft',
  'published',
  'archived'
);

create type public.class_status as enum (
  'draft',
  'active',
  'archived'
);

create type public.membership_status as enum (
  'invited',
  'active',
  'removed'
);

create type public.enrolment_status as enum (
  'active',
  'completed',
  'withdrawn'
);

create type public.exercise_type as enum (
  'notation_reading',
  'ear_training',
  'keyboard_playing',
  'harmony_analysis',
  'rhythm_reading',
  'multiple_choice'
);

create type public.question_type as enum (
  'multiple_choice',
  'interval_identification',
  'note_identification',
  'chord_building',
  'key_signature',
  'rhythm_pattern'
);

create type public.attempt_status as enum (
  'in_progress',
  'submitted',
  'graded',
  'expired'
);

create type public.progress_status as enum (
  'not_started',
  'in_progress',
  'completed'
);

create type public.notification_category as enum (
  'assignment',
  'assessment',
  'class',
  'progress',
  'system'
);

-- ----------------------------------------------------------------------------
-- 2. Generic Timestamp Trigger Function
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. Identity & Role Tables
-- ----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default 'Learner',
  avatar_url text,
  preferred_level public.theory_level not null default 'beginner',
  account_status text not null default 'active'
    check (account_status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_nonempty check (char_length(trim(display_name)) between 1 and 120)
);

comment on table public.profiles is
  'Public user profile keyed 1:1 to auth.users(id). Passwords and auth secrets never live here.';

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_roles_user_id_role_key unique (user_id, role)
);

comment on table public.user_roles is
  'Explicit RBAC role assignments. Users cannot self-assign lecturer or administrator privileges.';

-- ----------------------------------------------------------------------------
-- 4. Curriculum Tables
-- ----------------------------------------------------------------------------

create table public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  numeral text not null,
  title text not null,
  summary text not null default '',
  level public.theory_level not null,
  sort_order integer not null check (sort_order >= 0),
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_paths_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint learning_paths_title_nonempty check (char_length(trim(title)) between 1 and 160)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null default '',
  level public.theory_level not null,
  sort_order integer not null check (sort_order >= 0),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint courses_title_nonempty check (char_length(trim(title)) between 1 and 180)
);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null default '',
  sort_order integer not null check (sort_order >= 0),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_modules_course_slug_key unique (course_id, slug),
  constraint course_modules_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint course_modules_title_nonempty check (char_length(trim(title)) between 1 and 180)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null default '',
  content_markdown text not null default '',
  notation_payload jsonb,
  audio_config jsonb,
  estimated_minutes integer not null default 10 check (estimated_minutes > 0),
  sort_order integer not null check (sort_order >= 0),
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_module_slug_key unique (module_id, slug),
  constraint lessons_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint lessons_title_nonempty check (char_length(trim(title)) between 1 and 200)
);

-- ----------------------------------------------------------------------------
-- 5. Lecturer Management Tables (Classes & Memberships)
-- ----------------------------------------------------------------------------

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  lecturer_id uuid not null references public.profiles(id) on delete restrict,
  code text not null,
  title text not null,
  description text not null default '',
  level public.theory_level not null default 'beginner',
  join_code text unique,
  status public.class_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_code_nonempty check (char_length(trim(code)) between 2 and 32),
  constraint classes_title_nonempty check (char_length(trim(title)) between 2 and 160)
);

create table public.class_memberships (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status public.membership_status not null default 'active',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_memberships_class_student_key unique (class_id, student_id)
);

create table public.course_enrolments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  status public.enrolment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_enrolments_user_course_key unique (user_id, course_id)
);

-- ----------------------------------------------------------------------------
-- 6. Practice Tables (Exercises, Questions, Options, Separated Answer Keys)
-- ----------------------------------------------------------------------------

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  instructions text not null default '',
  exercise_type public.exercise_type not null,
  level public.theory_level not null default 'beginner',
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercises_title_nonempty check (char_length(trim(title)) between 1 and 200)
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references public.exercises(id) on delete set null,
  prompt text not null,
  question_type public.question_type not null,
  level public.theory_level not null default 'beginner',
  notation_data jsonb,
  audio_data jsonb,
  points integer not null default 1 check (points > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questions_prompt_nonempty check (char_length(trim(prompt)) > 0)
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_label text not null,
  option_value text not null,
  notation_data jsonb,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint question_options_question_value_key unique (question_id, option_value),
  constraint question_options_question_id_id_key unique (question_id, id),
  constraint question_options_label_nonempty check (char_length(trim(option_label)) > 0)
);

comment on table public.question_options is
  'Learner-readable answer choices. Intentionally omits correctness flags.';

create table public.question_answer_keys (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null unique references public.questions(id) on delete cascade,
  correct_option_id uuid,
  accepted_answers jsonb not null default '[]'::jsonb,
  explanation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint question_answer_keys_option_question_fk
    foreign key (question_id, correct_option_id)
    references public.question_options (question_id, id)
    on delete cascade,
  constraint question_answer_keys_accepted_answers_array check (jsonb_typeof(accepted_answers) = 'array'),
  constraint question_answer_keys_has_solution check (
    correct_option_id is not null
    or (
      case
        when jsonb_typeof(accepted_answers) = 'array' then jsonb_array_length(accepted_answers) > 0
        else false
      end
    )
  )
);

comment on table public.question_answer_keys is
  'Restricted answer key store. Never readable by students, independent learners, or anonymous users.';

-- ----------------------------------------------------------------------------
-- 7. Assessment & Class Assignment Tables
-- ----------------------------------------------------------------------------

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null default '',
  level public.theory_level not null default 'beginner',
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  max_attempts integer check (max_attempts is null or max_attempts > 0),
  pass_score_percent numeric(5,2) not null default 70.00
    check (pass_score_percent >= 0 and pass_score_percent <= 100),
  available_from timestamptz,
  due_at timestamptz,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessments_title_nonempty check (char_length(trim(title)) between 1 and 200),
  constraint assessments_window_valid check (
    available_from is null or due_at is null or due_at >= available_from
  )
);

create table public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  sort_order integer not null check (sort_order >= 0),
  points integer not null default 1 check (points > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_questions_assessment_question_key unique (assessment_id, question_id),
  constraint assessment_questions_id_question_key unique (id, question_id)
);

create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  attempt_number integer not null check (attempt_number > 0),
  status public.attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  graded_at timestamptz,
  score_points numeric(8,2) check (score_points is null or score_points >= 0),
  max_points numeric(8,2) check (max_points is null or max_points >= 0),
  score_percent numeric(5,2)
    check (score_percent is null or (score_percent >= 0 and score_percent <= 100)),
  pass_score_percent_snapshot numeric(5,2)
    check (pass_score_percent_snapshot is null or (pass_score_percent_snapshot >= 0 and pass_score_percent_snapshot <= 100)),
  passed boolean,
  regraded_at timestamptz,
  regraded_by uuid references public.profiles(id) on delete set null,
  regrade_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_attempts_unique_number unique (assessment_id, user_id, attempt_number),
  constraint assessment_attempts_score_bounds check (
    score_points is null or max_points is null or score_points <= max_points
  )
);

create table public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  assessment_question_id uuid not null,
  question_id uuid not null,
  selected_option_id uuid,
  response_payload jsonb,
  is_correct boolean,
  points_awarded numeric(6,2) check (points_awarded is null or points_awarded >= 0),
  grader_feedback text,
  answered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_responses_attempt_aq_key unique (attempt_id, assessment_question_id),
  constraint assessment_responses_aq_question_fk
    foreign key (assessment_question_id, question_id)
    references public.assessment_questions (id, question_id)
    on delete restrict,
  constraint assessment_responses_option_question_fk
    foreign key (question_id, selected_option_id)
    references public.question_options (question_id, id)
    on delete restrict
);

create table public.assessment_attempt_snapshots (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  assessment_question_id uuid not null references public.assessment_questions(id) on delete restrict,
  question_id uuid not null references public.questions(id) on delete restrict,
  sort_order integer not null check (sort_order >= 0),
  points integer not null check (points > 0),
  question_prompt text not null,
  question_type public.question_type not null,
  notation_data jsonb,
  options_snapshot jsonb not null default '[]'::jsonb,
  correct_option_id_snapshot uuid,
  accepted_answers_snapshot jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint assessment_attempt_snapshots_attempt_aq_key unique (attempt_id, assessment_question_id)
);

comment on table public.assessment_attempt_snapshots is
  'Immutable per-attempt question, option, point, and answer-key snapshot captured when an attempt starts. Directly inaccessible to learners and anonymous users.';

create table public.class_assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  instructions text not null default '',
  lesson_id uuid references public.lessons(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete set null,
  status public.content_status not null default 'draft',
  available_from timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_assignments_title_nonempty check (char_length(trim(title)) between 1 and 200),
  constraint class_assignments_window_valid check (
    available_from is null or due_at is null or due_at >= available_from
  )
);

-- ----------------------------------------------------------------------------
-- 8. Progress & Notification Tables
-- ----------------------------------------------------------------------------

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status public.progress_status not null default 'not_started',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  practice_seconds integer not null default 0 check (practice_seconds >= 0),
  last_score numeric(5,2) check (last_score is null or (last_score >= 0 and last_score <= 100)),
  started_at timestamptz,
  completed_at timestamptz,
  last_accessed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_progress_user_lesson_key unique (user_id, lesson_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category public.notification_category not null default 'system',
  title text not null,
  body text not null,
  action_url text,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_title_nonempty check (char_length(trim(title)) between 1 and 180)
);

-- ----------------------------------------------------------------------------
-- 9. Performance Indexes (Foreign Keys & Frequently Queried Columns)
-- ----------------------------------------------------------------------------

create index idx_profiles_account_status on public.profiles (account_status);
create index idx_user_roles_user_id on public.user_roles (user_id);
create index idx_user_roles_role on public.user_roles (role);

create index idx_learning_paths_status_sort on public.learning_paths (status, sort_order);
create index idx_courses_path_status_sort on public.courses (learning_path_id, status, sort_order);
create index idx_course_modules_course_status_sort on public.course_modules (course_id, status, sort_order);
create index idx_lessons_module_status_sort on public.lessons (module_id, status, sort_order);

create index idx_classes_lecturer_status on public.classes (lecturer_id, status);
create index idx_class_memberships_student_status on public.class_memberships (student_id, status);
create index idx_class_memberships_class_status on public.class_memberships (class_id, status);
create index idx_course_enrolments_course_id on public.course_enrolments (course_id);
create index idx_course_enrolments_class_id on public.course_enrolments (class_id);

create index idx_exercises_lesson_status_sort on public.exercises (lesson_id, status, sort_order);
create index idx_questions_exercise_status_sort on public.questions (exercise_id, status, sort_order);
create index idx_questions_created_by on public.questions (created_by);
create index idx_question_options_question_sort on public.question_options (question_id, sort_order);
create index idx_question_answer_keys_correct_option on public.question_answer_keys (correct_option_id);

create index idx_assessments_class_status on public.assessments (class_id, status);
create index idx_assessments_course_status on public.assessments (course_id, status);
create index idx_assessments_due_at on public.assessments (due_at);
create index idx_assessment_questions_assessment_sort on public.assessment_questions (assessment_id, sort_order);
create index idx_assessment_questions_question_id on public.assessment_questions (question_id);

create index idx_assessment_attempts_user_started on public.assessment_attempts (user_id, started_at desc);
create index idx_assessment_attempts_assessment_user on public.assessment_attempts (assessment_id, user_id);
create index idx_assessment_responses_attempt_id on public.assessment_responses (attempt_id);
create index idx_assessment_responses_question_id on public.assessment_responses (question_id);
create index idx_assessment_attempt_snapshots_attempt_sort on public.assessment_attempt_snapshots (attempt_id, sort_order);
create index idx_assessment_attempt_snapshots_question_id on public.assessment_attempt_snapshots (question_id);

create index idx_class_assignments_class_due on public.class_assignments (class_id, status, due_at);
create index idx_class_assignments_lesson_id on public.class_assignments (lesson_id);
create index idx_class_assignments_assessment_id on public.class_assignments (assessment_id);

create index idx_lesson_progress_user_accessed on public.lesson_progress (user_id, last_accessed_at desc);
create index idx_lesson_progress_lesson_id on public.lesson_progress (lesson_id);
create index idx_notifications_user_read_created on public.notifications (user_id, is_read, created_at desc);

-- ----------------------------------------------------------------------------
-- 10. Non-Recursive Authorization Helper Functions (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
-- Every helper runs as SECURITY DEFINER with an explicit search_path so RLS
-- policies can inspect role/membership/ownership relationships cleanly without
-- triggering PostgreSQL recursive RLS evaluation errors.

create or replace function public.has_role(target_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.user_roles ur
      join public.profiles p on p.id = ur.user_id
      where ur.user_id = auth.uid()
        and ur.role = target_role
        and p.account_status = 'active'
    );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
  select public.has_role('administrator'::public.app_role);
$$;

create or replace function public.is_lecturer()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
  select public.has_role('lecturer'::public.app_role);
$$;

create or replace function public.is_class_lecturer(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
  select auth.uid() is not null
    and public.is_lecturer()
    and exists (
      select 1
      from public.classes c
      where c.id = target_class_id
        and c.lecturer_id = auth.uid()
    );
$$;

create or replace function public.is_active_class_member(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.class_memberships cm
      join public.profiles p on p.id = cm.student_id
      where cm.class_id = target_class_id
        and cm.student_id = auth.uid()
        and cm.status = 'active'
        and p.account_status = 'active'
    );
$$;

create or replace function public.lecturer_teaches_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
  select auth.uid() is not null
    and public.is_lecturer()
    and exists (
      select 1
      from public.class_memberships cm
      join public.classes c on c.id = cm.class_id
      where cm.student_id = target_student_id
        and cm.status = 'active'
        and c.lecturer_id = auth.uid()
    );
$$;

create or replace function public.can_access_assessment(target_assessment_id uuid)
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
    )
    and exists (
      select 1
      from public.assessments a
      where a.id = target_assessment_id
        and (
          public.is_admin()
          or a.created_by = auth.uid()
          or (a.class_id is not null and public.is_class_lecturer(a.class_id))
          or (
            a.status = 'published'
            and (a.available_from is null or a.available_from <= now())
            and (
              a.class_id is null
              or public.is_active_class_member(a.class_id)
            )
          )
        )
    );
$$;

create or replace function public.can_read_question(target_question_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.questions q
      left join public.exercises e on e.id = q.exercise_id
      left join public.lessons l on l.id = e.lesson_id
      where q.id = target_question_id
        and (
          public.is_admin()
          or (public.is_lecturer() and q.created_by = auth.uid())
          or (
            q.status = 'published'
            and (
              (
                e.id is not null
                and e.status = 'published'
                and (l.id is null or l.status = 'published')
              )
              or exists (
                select 1
                from public.assessment_questions aq
                where aq.question_id = q.id
                  and public.can_access_assessment(aq.assessment_id)
              )
            )
          )
        )
    );
$$;

create or replace function public.is_attempt_owner(target_attempt_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.assessment_attempts aa
      where aa.id = target_attempt_id
        and aa.user_id = auth.uid()
    );
$$;

create or replace function public.is_attempt_lecturer(target_attempt_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.assessment_attempts aa
      join public.assessments a on a.id = aa.assessment_id
      where aa.id = target_attempt_id
        and (
          (a.class_id is not null and public.is_class_lecturer(a.class_id))
          or (a.class_id is null and public.lecturer_teaches_student(aa.user_id))
        )
    );
$$;

create or replace function public.is_attempt_in_progress(target_attempt_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.assessment_attempts aa
    join public.assessments a on a.id = aa.assessment_id
    where aa.id = target_attempt_id
      and aa.status = 'in_progress'
      and (a.due_at is null or now() <= a.due_at)
      and (
        a.duration_minutes is null
        or now() <= aa.started_at + pg_catalog.make_interval(mins => a.duration_minutes)
      )
  );
$$;

revoke all on function public.has_role(public.app_role) from public;
grant execute on function public.has_role(public.app_role) to authenticated;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

revoke all on function public.is_lecturer() from public;
grant execute on function public.is_lecturer() to authenticated;

revoke all on function public.is_class_lecturer(uuid) from public;
grant execute on function public.is_class_lecturer(uuid) to authenticated;

revoke all on function public.is_active_class_member(uuid) from public;
grant execute on function public.is_active_class_member(uuid) to authenticated;

revoke all on function public.lecturer_teaches_student(uuid) from public;
grant execute on function public.lecturer_teaches_student(uuid) to authenticated;

revoke all on function public.can_access_assessment(uuid) from public;
grant execute on function public.can_access_assessment(uuid) to authenticated;

revoke all on function public.can_read_question(uuid) from public;
grant execute on function public.can_read_question(uuid) to authenticated;

revoke all on function public.is_attempt_owner(uuid) from public;
grant execute on function public.is_attempt_owner(uuid) to authenticated;

revoke all on function public.is_attempt_lecturer(uuid) from public;
grant execute on function public.is_attempt_lecturer(uuid) to authenticated;

revoke all on function public.is_attempt_in_progress(uuid) from public;
grant execute on function public.is_attempt_in_progress(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 11. Triggers: Profile Provisioning, Timestamps & Sensitive Column Guards
-- ----------------------------------------------------------------------------

-- 11a. Automatic profile + safe default role provisioning on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
declare
  initial_name text;
begin
  initial_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Learner'
  );

  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, left(initial_name, 120))
  on conflict (id) do nothing;

  -- Assign ONLY independent_learner on self-registration.
  -- Never trust user-editable signup metadata to grant student, lecturer,
  -- or administrator roles; elevated roles require explicit admin/server action.
  insert into public.user_roles (user_id, role, granted_by)
  values (new.id, 'independent_learner'::public.app_role, null)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 11b. Protect non-admin profile updates from changing account_status or identity keys
create or replace function public.protect_profile_updates()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
begin
  new.created_at := old.created_at;
  if auth.uid() is not null and not public.is_admin() then
    if new.id <> old.id then
      raise exception 'Profile identifier cannot be modified.';
    end if;
    if new.account_status is distinct from old.account_status then
      raise exception 'Only administrators may change account status.';
    end if;
    if new.email is distinct from old.email then
      raise exception 'Profile email must stay synchronized via Supabase Auth.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_profiles_protect_updates
  before update on public.profiles
  for each row
  execute function public.protect_profile_updates();

-- 11c. Validate question_answer_keys references belong to the owning question
create or replace function public.validate_question_answer_key()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if new.correct_option_id is not null then
    if not exists (
      select 1
      from public.question_options qo
      where qo.id = new.correct_option_id
        and qo.question_id = new.question_id
    ) then
      raise exception 'correct_option_id must belong to the referenced question_id.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_question_answer_keys_validate
  before insert or update on public.question_answer_keys
  for each row
  execute function public.validate_question_answer_key();

-- 11d. Enforce assessment attempt creation (concurrency-safe), grading state transitions, and immutable fields
create or replace function public.protect_assessment_attempt_integrity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
declare
  target_assessment public.assessments%rowtype;
  existing_count integer;
  next_number integer;
  computed_max_points numeric(8,2);
  in_trusted_rpc boolean;
begin
  in_trusted_rpc := coalesce(pg_catalog.current_setting('theorylab.trusted_attempt_rpc', true), '') = 'on';

  select * into target_assessment
  from public.assessments
  where id = new.assessment_id;

  if not found then
    raise exception 'Referenced assessment does not exist.';
  end if;

  if tg_op = 'INSERT' then
    -- Serialize concurrent attempt creations for the same (assessment_id, user_id)
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtext(new.assessment_id::text),
      pg_catalog.hashtext(new.user_id::text)
    );

    select coalesce(sum(aq.points), 0)::numeric(8,2)
    into computed_max_points
    from public.assessment_questions aq
    where aq.assessment_id = new.assessment_id;

    if auth.uid() is not null and not public.is_admin() and not in_trusted_rpc then
      if new.user_id <> auth.uid() then
        raise exception 'Cannot start an attempt for another user.';
      end if;
      if not public.can_access_assessment(new.assessment_id) then
        raise exception 'You do not have access to this assessment.';
      end if;
      if target_assessment.status <> 'published' then
        raise exception 'Assessment is not published.';
      end if;
      if target_assessment.available_from is not null and now() < target_assessment.available_from then
        raise exception 'Assessment is not open yet.';
      end if;
      if target_assessment.due_at is not null and now() > target_assessment.due_at then
        raise exception 'Assessment deadline has passed.';
      end if;

      select count(*), coalesce(max(attempt_number), 0) + 1
      into existing_count, next_number
      from public.assessment_attempts
      where assessment_id = new.assessment_id
        and user_id = new.user_id;

      if target_assessment.max_attempts is not null and existing_count >= target_assessment.max_attempts then
        raise exception 'Maximum attempt limit reached for this assessment.';
      end if;

      -- Server-authoritative defaults on learner attempt creation
      new.attempt_number := next_number;
      new.status := 'in_progress'::public.attempt_status;
      new.started_at := now();
      new.submitted_at := null;
      new.graded_at := null;
      new.score_points := null;
      new.max_points := computed_max_points;
      new.score_percent := null;
      new.pass_score_percent_snapshot := target_assessment.pass_score_percent;
      new.passed := null;
      new.regraded_at := null;
      new.regraded_by := null;
      new.regrade_reason := null;
    else
      if new.pass_score_percent_snapshot is null then
        new.pass_score_percent_snapshot := target_assessment.pass_score_percent;
      end if;
      if new.max_points is null then
        new.max_points := computed_max_points;
      end if;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;

    if new.assessment_id <> old.assessment_id
       or new.user_id <> old.user_id
       or new.attempt_number <> old.attempt_number
       or new.started_at <> old.started_at
       or new.pass_score_percent_snapshot is distinct from old.pass_score_percent_snapshot then
      raise exception 'Attempt identity metadata and pass threshold snapshot cannot be altered.';
    end if;

    -- Enforce explicit state-machine transitions for attempt status
    if new.status is distinct from old.status then
      if old.status = 'in_progress'::public.attempt_status
         and new.status not in ('submitted'::public.attempt_status, 'expired'::public.attempt_status) then
        raise exception 'In-progress attempts may only transition to submitted or expired.';
      elsif old.status in ('submitted'::public.attempt_status, 'expired'::public.attempt_status)
         and new.status <> 'graded'::public.attempt_status then
        raise exception 'Submitted or expired attempts may only transition to graded.';
      elsif old.status = 'graded'::public.attempt_status then
        raise exception 'Finalized graded attempts cannot change status.';
      end if;
    end if;

    if auth.uid() is not null and not public.is_admin() and not in_trusted_rpc then
      -- Only administrators, trusted server-side RPCs, or service-role grading may write grades/regrades
      if new.score_points is distinct from old.score_points
         or new.max_points is distinct from old.max_points
         or new.score_percent is distinct from old.score_percent
         or new.passed is distinct from old.passed
         or new.graded_at is distinct from old.graded_at
         or new.regraded_at is distinct from old.regraded_at
         or new.regraded_by is distinct from old.regraded_by
         or new.regrade_reason is distinct from old.regrade_reason then
        raise exception 'Assessment scores, grades, and regrade fields must be computed server-side.';
      end if;

      -- Learners may only transition an in_progress attempt to submitted
      if old.status <> 'in_progress'::public.attempt_status then
        raise exception 'Closed attempts cannot be modified by learners.';
      end if;
      if new.status not in ('in_progress'::public.attempt_status, 'submitted'::public.attempt_status) then
        raise exception 'Invalid learner attempt status transition.';
      end if;
      if new.status = 'submitted'::public.attempt_status then
        if (target_assessment.due_at is not null and now() > target_assessment.due_at)
           or (
             target_assessment.duration_minutes is not null
             and now() > old.started_at + pg_catalog.make_interval(mins => target_assessment.duration_minutes)
           ) then
          new.status := 'expired'::public.attempt_status;
        end if;
        new.submitted_at := now();
      else
        new.submitted_at := null;
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_assessment_attempts_integrity
  before insert or update on public.assessment_attempts
  for each row
  execute function public.protect_assessment_attempt_integrity();

-- 11d-2. Capture immutable per-attempt question/option/answer-key snapshot on creation
create or replace function public.capture_assessment_attempt_snapshot()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  insert into public.assessment_attempt_snapshots (
    attempt_id,
    assessment_question_id,
    question_id,
    sort_order,
    points,
    question_prompt,
    question_type,
    notation_data,
    options_snapshot,
    correct_option_id_snapshot,
    accepted_answers_snapshot
  )
  select
    new.id,
    aq.id,
    q.id,
    aq.sort_order,
    aq.points,
    q.prompt,
    q.question_type,
    q.notation_data,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', qo.id,
            'option_label', qo.option_label,
            'option_value', qo.option_value,
            'sort_order', qo.sort_order
          )
          order by qo.sort_order, qo.id
        )
        from public.question_options qo
        where qo.question_id = q.id
      ),
      '[]'::jsonb
    ),
    ak.correct_option_id,
    coalesce(ak.accepted_answers, '[]'::jsonb)
  from public.assessment_questions aq
  join public.questions q on q.id = aq.question_id
  left join public.question_answer_keys ak on ak.question_id = q.id
  where aq.assessment_id = new.assessment_id;

  return new;
end;
$$;

create trigger trg_assessment_attempts_capture_snapshot
  after insert on public.assessment_attempts
  for each row
  execute function public.capture_assessment_attempt_snapshot();

create or replace function public.prevent_snapshot_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  raise exception 'Assessment attempt snapshots are immutable and cannot be modified.';
end;
$$;

create trigger trg_assessment_attempt_snapshots_immutable
  before update on public.assessment_attempt_snapshots
  for each row
  execute function public.prevent_snapshot_mutation();

-- 11d-3. Freeze assessment configuration, questions, options, and answer keys after first attempt
create or replace function public.freeze_attempted_assessment_structure()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  target_assessment_id uuid;
begin
  if tg_op = 'DELETE' then
    target_assessment_id := old.assessment_id;
  else
    target_assessment_id := new.assessment_id;
  end if;

  if exists (
    select 1
    from public.assessment_attempts aa
    where aa.assessment_id = target_assessment_id
  ) then
    raise exception 'Assessment questions, ordering, and points cannot be modified after attempts exist.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger trg_assessment_questions_freeze
  before insert or update or delete on public.assessment_questions
  for each row
  execute function public.freeze_attempted_assessment_structure();

create or replace function public.freeze_attempted_assessment_settings()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if exists (
    select 1
    from public.assessment_attempts aa
    where aa.assessment_id = old.id
  ) then
    if new.class_id is distinct from old.class_id
       or new.course_id is distinct from old.course_id
       or new.pass_score_percent is distinct from old.pass_score_percent
       or new.duration_minutes is distinct from old.duration_minutes
       or new.max_attempts is distinct from old.max_attempts then
      raise exception 'Core assessment settings cannot be changed after attempts exist.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_assessments_freeze
  before update on public.assessments
  for each row
  execute function public.freeze_attempted_assessment_settings();

create or replace function public.freeze_attempted_question_changes()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
begin
  if exists (
    select 1
    from public.assessment_questions aq
    join public.assessment_attempts aa on aa.assessment_id = aq.assessment_id
    where aq.question_id = old.id
  ) then
    if tg_op = 'DELETE' then
      raise exception 'Questions used in attempted assessments cannot be deleted.';
    end if;
    if new.prompt is distinct from old.prompt
       or new.question_type is distinct from old.question_type
       or new.notation_data is distinct from old.notation_data
       or new.audio_data is distinct from old.audio_data
       or new.points is distinct from old.points then
      raise exception 'Questions used in attempted assessments cannot be altered.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.freeze_attempted_question_child_changes()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  target_question_id uuid;
begin
  if tg_op = 'DELETE' then
    target_question_id := old.question_id;
  else
    target_question_id := new.question_id;
  end if;

  if exists (
    select 1
    from public.assessment_questions aq
    join public.assessment_attempts aa on aa.assessment_id = aq.assessment_id
    where aq.question_id = target_question_id
  ) then
    raise exception 'Question options and answer keys used in attempted assessments cannot be modified.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger trg_questions_freeze_attempted
  before update or delete on public.questions
  for each row
  execute function public.freeze_attempted_question_changes();

create trigger trg_question_options_freeze_attempted
  before insert or update or delete on public.question_options
  for each row
  execute function public.freeze_attempted_question_child_changes();

create trigger trg_question_answer_keys_freeze_attempted
  before insert or update or delete on public.question_answer_keys
  for each row
  execute function public.freeze_attempted_question_child_changes();

-- 11e. Enforce response grading integrity & cross-table question/option consistency
create or replace function public.protect_assessment_response_integrity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
declare
  parent_attempt public.assessment_attempts%rowtype;
  linked_aq public.assessment_questions%rowtype;
  in_trusted_rpc boolean;
begin
  in_trusted_rpc := coalesce(pg_catalog.current_setting('theorylab.trusted_attempt_rpc', true), '') = 'on';

  select * into parent_attempt
  from public.assessment_attempts
  where id = new.attempt_id;

  if not found then
    raise exception 'Referenced assessment attempt does not exist.';
  end if;

  select * into linked_aq
  from public.assessment_questions
  where id = new.assessment_question_id;

  if not found or linked_aq.assessment_id <> parent_attempt.assessment_id then
    raise exception 'assessment_question_id does not belong to this assessment attempt.';
  end if;

  if new.question_id <> linked_aq.question_id then
    raise exception 'question_id must match the referenced assessment_question.';
  end if;

  if new.selected_option_id is not null then
    if not exists (
      select 1
      from public.question_options qo
      where qo.id = new.selected_option_id
        and qo.question_id = new.question_id
    ) then
      raise exception 'selected_option_id does not belong to the referenced question.';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if auth.uid() is not null and not public.is_admin() and not in_trusted_rpc then
      if parent_attempt.user_id <> auth.uid() then
        raise exception 'Cannot submit responses for another user.';
      end if;
      if not public.is_attempt_in_progress(parent_attempt.id) then
        raise exception 'Attempt is no longer open for responses.';
      end if;
      new.is_correct := null;
      new.points_awarded := null;
      new.grader_feedback := null;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
    if auth.uid() is not null and not public.is_admin() and not in_trusted_rpc then
      if new.attempt_id <> old.attempt_id
         or new.assessment_question_id <> old.assessment_question_id
         or new.question_id <> old.question_id then
        raise exception 'Response references cannot be modified.';
      end if;

      -- Allow class lecturer to manually grade submitted/expired responses before finalization
      if public.is_attempt_lecturer(parent_attempt.id) and parent_attempt.user_id <> auth.uid() then
        if parent_attempt.status = 'in_progress'::public.attempt_status then
          raise exception 'Lecturers cannot grade in-progress attempts before submission.';
        end if;
        if parent_attempt.status = 'graded'::public.attempt_status then
          raise exception 'Finalized graded responses cannot be modified without administrative regrading.';
        end if;
        if new.selected_option_id is distinct from old.selected_option_id
           or new.response_payload is distinct from old.response_payload then
          raise exception 'Lecturers cannot alter student answer submissions.';
        end if;
        if new.points_awarded is not null and new.points_awarded > linked_aq.points then
          raise exception 'Awarded points cannot exceed question maximum points.';
        end if;
        return new;
      end if;

      if parent_attempt.user_id <> auth.uid() or not public.is_attempt_in_progress(parent_attempt.id) then
        raise exception 'Responses are locked after submission or deadline.';
      end if;

      if new.is_correct is distinct from old.is_correct
         or new.points_awarded is distinct from old.points_awarded
         or new.grader_feedback is distinct from old.grader_feedback then
        raise exception 'Learners cannot grade their own responses.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_assessment_responses_integrity
  before insert or update on public.assessment_responses
  for each row
  execute function public.protect_assessment_response_integrity();

-- 11e-2. Protect immutable identity references and prevent class reassignment on course_enrolments updates
create or replace function public.protect_course_enrolment_updates()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
begin
  new.created_at := old.created_at;
  if auth.uid() is not null and not public.is_admin() then
    if new.user_id <> old.user_id
       or new.course_id <> old.course_id
       or new.enrolled_at <> old.enrolled_at
       or new.class_id is distinct from old.class_id then
      raise exception 'Enrolment identity and class assignment fields cannot be altered.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_course_enrolments_protect_updates
  before update on public.course_enrolments
  for each row
  execute function public.protect_course_enrolment_updates();

-- 11e-3. Prevent class reassignment on class_memberships and authorize student role promotion
create or replace function public.protect_class_membership_updates()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
begin
  new.created_at := old.created_at;
  if auth.uid() is not null and not public.is_admin() then
    if new.class_id <> old.class_id
       or new.student_id <> old.student_id
       or new.joined_at <> old.joined_at then
      raise exception 'Class membership class and student identity cannot be reassigned.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_class_memberships_protect_updates
  before update on public.class_memberships
  for each row
  execute function public.protect_class_membership_updates();

create or replace function public.sync_student_role_on_membership()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
begin
  if new.status = 'active'::public.membership_status then
    insert into public.user_roles (user_id, role, granted_by)
    values (new.student_id, 'student'::public.app_role, auth.uid())
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

create trigger trg_class_memberships_sync_student_role
  after insert or update of status on public.class_memberships
  for each row
  execute function public.sync_student_role_on_membership();

-- 11f. Protect notification content from tampering when recipients mark as read
create or replace function public.protect_notification_updates()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
begin
  new.created_at := old.created_at;
  if auth.uid() is not null and not public.is_admin() then
    if new.user_id <> old.user_id
       or new.category <> old.category
       or new.title <> old.title
       or new.body <> old.body
       or new.action_url is distinct from old.action_url then
      raise exception 'Notification message content cannot be modified by recipients.';
    end if;
    if new.is_read and new.read_at is null then
      new.read_at := now();
    elsif not new.is_read then
      new.read_at := null;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_notifications_protect_updates
  before update on public.notifications
  for each row
  execute function public.protect_notification_updates();

-- 11g. Attach updated_at triggers to all tables
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_user_roles_updated_at before update on public.user_roles
  for each row execute function public.set_updated_at();
create trigger trg_learning_paths_updated_at before update on public.learning_paths
  for each row execute function public.set_updated_at();
create trigger trg_courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();
create trigger trg_course_modules_updated_at before update on public.course_modules
  for each row execute function public.set_updated_at();
create trigger trg_lessons_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();
create trigger trg_classes_updated_at before update on public.classes
  for each row execute function public.set_updated_at();
create trigger trg_class_memberships_updated_at before update on public.class_memberships
  for each row execute function public.set_updated_at();
create trigger trg_course_enrolments_updated_at before update on public.course_enrolments
  for each row execute function public.set_updated_at();
create trigger trg_exercises_updated_at before update on public.exercises
  for each row execute function public.set_updated_at();
create trigger trg_questions_updated_at before update on public.questions
  for each row execute function public.set_updated_at();
create trigger trg_question_options_updated_at before update on public.question_options
  for each row execute function public.set_updated_at();
create trigger trg_question_answer_keys_updated_at before update on public.question_answer_keys
  for each row execute function public.set_updated_at();
create trigger trg_assessments_updated_at before update on public.assessments
  for each row execute function public.set_updated_at();
create trigger trg_assessment_questions_updated_at before update on public.assessment_questions
  for each row execute function public.set_updated_at();
create trigger trg_assessment_attempts_updated_at before update on public.assessment_attempts
  for each row execute function public.set_updated_at();
create trigger trg_assessment_responses_updated_at before update on public.assessment_responses
  for each row execute function public.set_updated_at();
create trigger trg_class_assignments_updated_at before update on public.class_assignments
  for each row execute function public.set_updated_at();
create trigger trg_lesson_progress_updated_at before update on public.lesson_progress
  for each row execute function public.set_updated_at();
create trigger trg_notifications_updated_at before update on public.notifications
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 12. Enable Row Level Security (RLS) on Every Table
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.learning_paths enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.classes enable row level security;
alter table public.class_memberships enable row level security;
alter table public.course_enrolments enable row level security;
alter table public.exercises enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_answer_keys enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.assessment_attempt_snapshots enable row level security;
alter table public.class_assignments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.notifications enable row level security;

-- Lock down default schema and table privileges for public and anon across all tables
revoke all on schema public from public, anon;
grant usage on schema public to authenticated, service_role;

revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

-- Grant explicit least-privilege table permissions to authenticated (RLS policies enforce row access)
-- Note: assessment_attempt_snapshots remains completely inaccessible to anon and authenticated.
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.user_roles to authenticated;
grant select, insert, update, delete on table public.learning_paths to authenticated;
grant select, insert, update, delete on table public.courses to authenticated;
grant select, insert, update, delete on table public.course_modules to authenticated;
grant select, insert, update, delete on table public.lessons to authenticated;
grant select, insert, update, delete on table public.classes to authenticated;
grant select, insert, update, delete on table public.class_memberships to authenticated;
grant select, insert, update, delete on table public.course_enrolments to authenticated;
grant select, insert, update, delete on table public.exercises to authenticated;
grant select, insert, update, delete on table public.questions to authenticated;
grant select, insert, update, delete on table public.question_options to authenticated;
grant select, insert, update, delete on table public.question_answer_keys to authenticated;
grant select, insert, update, delete on table public.assessments to authenticated;
grant select, insert, update, delete on table public.assessment_questions to authenticated;
grant select, insert, update, delete on table public.assessment_attempts to authenticated;
grant select, insert, update, delete on table public.assessment_responses to authenticated;
grant select, insert, update, delete on table public.class_assignments to authenticated;
grant select, insert, update, delete on table public.lesson_progress to authenticated;
grant select, insert, update, delete on table public.notifications to authenticated;
revoke all on table public.assessment_attempt_snapshots from public, anon, authenticated;

-- Ensure service_role retains full backend management access
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Re-grant execute ONLY on non-trigger authorization helper functions to authenticated
grant execute on function public.has_role(public.app_role) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_lecturer() to authenticated;
grant execute on function public.is_class_lecturer(uuid) to authenticated;
grant execute on function public.is_active_class_member(uuid) to authenticated;
grant execute on function public.lecturer_teaches_student(uuid) to authenticated;
grant execute on function public.can_access_assessment(uuid) to authenticated;
grant execute on function public.can_read_question(uuid) to authenticated;
grant execute on function public.is_attempt_owner(uuid) to authenticated;
grant execute on function public.is_attempt_lecturer(uuid) to authenticated;
grant execute on function public.is_attempt_in_progress(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 13. Row Level Security Policies
-- ----------------------------------------------------------------------------

-- 13.1 PROFILES
create policy profiles_select_own_or_teacher_or_admin
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or (public.is_lecturer() and public.lecturer_teaches_student(id))
  );

create policy profiles_update_own_or_admin
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Profiles are created by on_auth_user_created; only administrators may insert/delete directly.
create policy profiles_insert_admin_only
  on public.profiles
  for insert
  to authenticated
  with check (public.is_admin());

create policy profiles_delete_admin_only
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin());

-- 13.2 USER ROLES (Self-read only; only administrators grant/revoke roles)
create policy user_roles_select_own_or_admin
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy user_roles_insert_admin_only
  on public.user_roles
  for insert
  to authenticated
  with check (public.is_admin());

create policy user_roles_update_admin_only
  on public.user_roles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy user_roles_delete_admin_only
  on public.user_roles
  for delete
  to authenticated
  using (public.is_admin());

-- 13.3 CURRICULUM: LEARNING PATHS, COURSES, MODULES, LESSONS
create policy learning_paths_select_published_or_admin
  on public.learning_paths
  for select
  to authenticated
  using (status = 'published' or public.is_admin());

create policy learning_paths_insert_admin_only
  on public.learning_paths
  for insert
  to authenticated
  with check (public.is_admin());

create policy learning_paths_update_admin_only
  on public.learning_paths
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy learning_paths_delete_admin_only
  on public.learning_paths
  for delete
  to authenticated
  using (public.is_admin());

create policy courses_select_published_or_admin
  on public.courses
  for select
  to authenticated
  using (
    public.is_admin()
    or (
      status = 'published'
      and exists (
        select 1 from public.learning_paths lp
        where lp.id = courses.learning_path_id
          and lp.status = 'published'
      )
    )
  );

create policy courses_insert_admin_only
  on public.courses
  for insert
  to authenticated
  with check (public.is_admin());

create policy courses_update_admin_only
  on public.courses
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy courses_delete_admin_only
  on public.courses
  for delete
  to authenticated
  using (public.is_admin());

create policy course_modules_select_published_or_admin
  on public.course_modules
  for select
  to authenticated
  using (
    public.is_admin()
    or (
      status = 'published'
      and exists (
        select 1 from public.courses c
        where c.id = course_modules.course_id
          and c.status = 'published'
      )
    )
  );

create policy course_modules_insert_admin_only
  on public.course_modules
  for insert
  to authenticated
  with check (public.is_admin());

create policy course_modules_update_admin_only
  on public.course_modules
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy course_modules_delete_admin_only
  on public.course_modules
  for delete
  to authenticated
  using (public.is_admin());

create policy lessons_select_published_or_admin
  on public.lessons
  for select
  to authenticated
  using (
    public.is_admin()
    or (
      status = 'published'
      and exists (
        select 1
        from public.course_modules cm
        join public.courses c on c.id = cm.course_id
        where cm.id = lessons.module_id
          and cm.status = 'published'
          and c.status = 'published'
      )
    )
  );

create policy lessons_insert_admin_only
  on public.lessons
  for insert
  to authenticated
  with check (public.is_admin());

create policy lessons_update_admin_only
  on public.lessons
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy lessons_delete_admin_only
  on public.lessons
  for delete
  to authenticated
  using (public.is_admin());

-- 13.4 COURSE ENROLMENTS (Independent learners & class-enrolled students)
create policy course_enrolments_select_own_or_teacher_or_admin
  on public.course_enrolments
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or (class_id is not null and public.is_class_lecturer(class_id))
  );

create policy course_enrolments_insert_self_or_teacher_or_admin
  on public.course_enrolments
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      user_id = auth.uid()
      and (class_id is null or public.is_active_class_member(class_id))
      and exists (
        select 1 from public.courses c
        where c.id = course_enrolments.course_id
          and c.status = 'published'
      )
    )
    or (
      class_id is not null
      and public.is_lecturer()
      and public.is_class_lecturer(class_id)
      and exists (
        select 1 from public.class_memberships cm
        where cm.class_id = course_enrolments.class_id
          and cm.student_id = course_enrolments.user_id
          and cm.status in ('invited', 'active')
      )
    )
  );

create policy course_enrolments_update_own_or_admin
  on public.course_enrolments
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or (class_id is not null and public.is_lecturer() and public.is_class_lecturer(class_id))
  )
  with check (
    public.is_admin()
    or (
      user_id = auth.uid()
      and (class_id is null or public.is_active_class_member(class_id))
    )
    or (class_id is not null and public.is_lecturer() and public.is_class_lecturer(class_id))
  );

create policy course_enrolments_delete_admin_only
  on public.course_enrolments
  for delete
  to authenticated
  using (public.is_admin());

-- 13.5 CLASSES & MEMBERSHIPS & ASSIGNMENTS
create policy classes_select_lecturer_member_or_admin
  on public.classes
  for select
  to authenticated
  using (
    lecturer_id = auth.uid()
    or public.is_admin()
    or (status = 'active' and public.is_active_class_member(id))
  );

create policy classes_insert_lecturer_or_admin
  on public.classes
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (public.is_lecturer() and lecturer_id = auth.uid())
  );

create policy classes_update_lecturer_or_admin
  on public.classes
  for update
  to authenticated
  using (public.is_admin() or (public.is_lecturer() and lecturer_id = auth.uid()))
  with check (public.is_admin() or (public.is_lecturer() and lecturer_id = auth.uid()));

create policy classes_delete_lecturer_or_admin
  on public.classes
  for delete
  to authenticated
  using (public.is_admin() or (public.is_lecturer() and lecturer_id = auth.uid()));

create policy class_memberships_select_self_lecturer_or_admin
  on public.class_memberships
  for select
  to authenticated
  using (
    student_id = auth.uid()
    or public.is_admin()
    or public.is_class_lecturer(class_id)
  );

create policy class_memberships_insert_lecturer_or_admin
  on public.class_memberships
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (public.is_lecturer() and public.is_class_lecturer(class_id))
  );

create policy class_memberships_update_lecturer_or_admin
  on public.class_memberships
  for update
  to authenticated
  using (
    public.is_admin()
    or (public.is_lecturer() and public.is_class_lecturer(class_id))
  )
  with check (
    public.is_admin()
    or (public.is_lecturer() and public.is_class_lecturer(class_id))
  );

create policy class_memberships_delete_lecturer_or_admin
  on public.class_memberships
  for delete
  to authenticated
  using (
    public.is_admin()
    or (public.is_lecturer() and public.is_class_lecturer(class_id))
  );

create policy class_assignments_select_member_lecturer_or_admin
  on public.class_assignments
  for select
  to authenticated
  using (
    public.is_admin()
    or public.is_class_lecturer(class_id)
    or (
      status = 'published'
      and (available_from is null or available_from <= now())
      and public.is_active_class_member(class_id)
    )
  );

create policy class_assignments_insert_lecturer_or_admin
  on public.class_assignments
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.is_lecturer()
      and public.is_class_lecturer(class_id)
      and created_by = auth.uid()
      and (
        assessment_id is null
        or exists (
          select 1 from public.assessments a
          where a.id = class_assignments.assessment_id
            and (a.class_id is null or a.class_id = class_assignments.class_id)
        )
      )
    )
  );

create policy class_assignments_update_lecturer_or_admin
  on public.class_assignments
  for update
  to authenticated
  using (
    public.is_admin()
    or (public.is_lecturer() and public.is_class_lecturer(class_id))
  )
  with check (
    public.is_admin()
    or (
      public.is_lecturer()
      and public.is_class_lecturer(class_id)
      and (
        assessment_id is null
        or exists (
          select 1 from public.assessments a
          where a.id = class_assignments.assessment_id
            and (a.class_id is null or a.class_id = class_assignments.class_id)
        )
      )
    )
  );

create policy class_assignments_delete_lecturer_or_admin
  on public.class_assignments
  for delete
  to authenticated
  using (
    public.is_admin()
    or (public.is_lecturer() and public.is_class_lecturer(class_id))
  );

-- 13.6 PRACTICE: EXERCISES, QUESTIONS, OPTIONS, ANSWER KEYS
create policy exercises_select_published_lecturer_or_admin
  on public.exercises
  for select
  to authenticated
  using (
    public.is_admin()
    or (public.is_lecturer() and created_by = auth.uid())
    or (
      status = 'published'
      and (
        lesson_id is null
        or exists (
          select 1 from public.lessons l
          where l.id = exercises.lesson_id
            and l.status = 'published'
        )
      )
    )
  );

create policy exercises_insert_admin_or_author_lecturer
  on public.exercises
  for insert
  to authenticated
  with check (public.is_admin() or (public.is_lecturer() and created_by = auth.uid()));

create policy exercises_update_admin_or_author_lecturer
  on public.exercises
  for update
  to authenticated
  using (public.is_admin() or (public.is_lecturer() and created_by = auth.uid()))
  with check (public.is_admin() or (public.is_lecturer() and created_by = auth.uid()));

create policy exercises_delete_admin_or_author_lecturer
  on public.exercises
  for delete
  to authenticated
  using (public.is_admin() or (public.is_lecturer() and created_by = auth.uid()));

create policy questions_select_accessible
  on public.questions
  for select
  to authenticated
  using (public.can_read_question(id));

create policy questions_insert_admin_or_author_lecturer
  on public.questions
  for insert
  to authenticated
  with check (public.is_admin() or (public.is_lecturer() and created_by = auth.uid()));

create policy questions_update_admin_or_author_lecturer
  on public.questions
  for update
  to authenticated
  using (public.is_admin() or (public.is_lecturer() and created_by = auth.uid()))
  with check (public.is_admin() or (public.is_lecturer() and created_by = auth.uid()));

create policy questions_delete_admin_or_author_lecturer
  on public.questions
  for delete
  to authenticated
  using (public.is_admin() or (public.is_lecturer() and created_by = auth.uid()));

create policy question_options_select_accessible
  on public.question_options
  for select
  to authenticated
  using (public.can_read_question(question_id));

create policy question_options_insert_admin_or_author_lecturer
  on public.question_options
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.questions q
        where q.id = question_options.question_id
          and q.created_by = auth.uid()
      )
    )
  );

create policy question_options_update_admin_or_author_lecturer
  on public.question_options
  for update
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.questions q
        where q.id = question_options.question_id
          and q.created_by = auth.uid()
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.questions q
        where q.id = question_options.question_id
          and q.created_by = auth.uid()
      )
    )
  );

create policy question_options_delete_admin_or_author_lecturer
  on public.question_options
  for delete
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.questions q
        where q.id = question_options.question_id
          and q.created_by = auth.uid()
      )
    )
  );

-- Answer keys are NEVER publicly readable and NEVER exposed to learners/students.
-- Only administrators or the lecturer who authored a specific question may inspect/manage its key.
create policy question_answer_keys_restricted_select
  on public.question_answer_keys
  for select
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.questions q
        where q.id = question_answer_keys.question_id
          and q.created_by = auth.uid()
      )
    )
  );

create policy question_answer_keys_restricted_insert
  on public.question_answer_keys
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.questions q
        where q.id = question_answer_keys.question_id
          and q.created_by = auth.uid()
      )
    )
  );

create policy question_answer_keys_restricted_update
  on public.question_answer_keys
  for update
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.questions q
        where q.id = question_answer_keys.question_id
          and q.created_by = auth.uid()
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.questions q
        where q.id = question_answer_keys.question_id
          and q.created_by = auth.uid()
      )
    )
  );

create policy question_answer_keys_restricted_delete
  on public.question_answer_keys
  for delete
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.questions q
        where q.id = question_answer_keys.question_id
          and q.created_by = auth.uid()
      )
    )
  );

-- 13.7 ASSESSMENTS, QUESTIONS LINK, ATTEMPTS, RESPONSES
create policy assessments_select_accessible
  on public.assessments
  for select
  to authenticated
  using (public.can_access_assessment(id));

create policy assessments_insert_lecturer_or_admin
  on public.assessments
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.is_lecturer()
      and created_by = auth.uid()
      and class_id is not null
      and public.is_class_lecturer(class_id)
    )
  );

create policy assessments_update_lecturer_or_admin
  on public.assessments
  for update
  to authenticated
  using (
    public.is_admin()
    or (public.is_lecturer() and class_id is not null and public.is_class_lecturer(class_id))
  )
  with check (
    public.is_admin()
    or (public.is_lecturer() and class_id is not null and public.is_class_lecturer(class_id))
  );

create policy assessments_delete_lecturer_or_admin
  on public.assessments
  for delete
  to authenticated
  using (
    public.is_admin()
    or (public.is_lecturer() and class_id is not null and public.is_class_lecturer(class_id))
  );

create policy assessment_questions_select_accessible
  on public.assessment_questions
  for select
  to authenticated
  using (public.can_access_assessment(assessment_id));

create policy assessment_questions_insert_lecturer_or_admin
  on public.assessment_questions
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.assessments a
        where a.id = assessment_questions.assessment_id
          and a.class_id is not null
          and public.is_class_lecturer(a.class_id)
      )
    )
  );

create policy assessment_questions_update_lecturer_or_admin
  on public.assessment_questions
  for update
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.assessments a
        where a.id = assessment_questions.assessment_id
          and a.class_id is not null
          and public.is_class_lecturer(a.class_id)
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.assessments a
        where a.id = assessment_questions.assessment_id
          and a.class_id is not null
          and public.is_class_lecturer(a.class_id)
      )
    )
  );

create policy assessment_questions_delete_lecturer_or_admin
  on public.assessment_questions
  for delete
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_lecturer()
      and exists (
        select 1 from public.assessments a
        where a.id = assessment_questions.assessment_id
          and a.class_id is not null
          and public.is_class_lecturer(a.class_id)
      )
    )
  );

create policy assessment_attempts_select_own_lecturer_or_admin
  on public.assessment_attempts
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or (public.is_lecturer() and public.is_attempt_lecturer(id))
  );

create policy assessment_attempts_insert_own
  on public.assessment_attempts
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_access_assessment(assessment_id)
    and status = 'in_progress'::public.attempt_status
  );

create policy assessment_attempts_update_own_or_admin
  on public.assessment_attempts
  for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Preserve assessment attempt history: learners/lecturers never delete attempts.
create policy assessment_attempts_delete_admin_only
  on public.assessment_attempts
  for delete
  to authenticated
  using (public.is_admin());

create policy assessment_responses_select_own_lecturer_or_admin
  on public.assessment_responses
  for select
  to authenticated
  using (
    public.is_attempt_owner(attempt_id)
    or public.is_admin()
    or (public.is_lecturer() and public.is_attempt_lecturer(attempt_id))
  );

create policy assessment_responses_insert_attempt_owner
  on public.assessment_responses
  for insert
  to authenticated
  with check (
    public.is_attempt_owner(attempt_id)
    and public.is_attempt_in_progress(attempt_id)
  );

create policy assessment_responses_update_owner_lecturer_or_admin
  on public.assessment_responses
  for update
  to authenticated
  using (
    public.is_admin()
    or (public.is_attempt_owner(attempt_id) and public.is_attempt_in_progress(attempt_id))
    or (public.is_lecturer() and public.is_attempt_lecturer(attempt_id))
  )
  with check (
    public.is_admin()
    or (public.is_attempt_owner(attempt_id) and public.is_attempt_in_progress(attempt_id))
    or (public.is_lecturer() and public.is_attempt_lecturer(attempt_id))
  );

create policy assessment_responses_delete_admin_only
  on public.assessment_responses
  for delete
  to authenticated
  using (public.is_admin());

-- 13.8 PROGRESS & NOTIFICATIONS
create policy lesson_progress_select_own_lecturer_or_admin
  on public.lesson_progress
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or (public.is_lecturer() and public.lecturer_teaches_student(user_id))
  );

create policy lesson_progress_insert_own
  on public.lesson_progress
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.lessons l
      where l.id = lesson_progress.lesson_id
        and l.status = 'published'
    )
  );

create policy lesson_progress_update_own_or_admin
  on public.lesson_progress
  for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy lesson_progress_delete_admin_only
  on public.lesson_progress
  for delete
  to authenticated
  using (public.is_admin());

create policy notifications_select_own_or_admin
  on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy notifications_insert_lecturer_or_admin
  on public.notifications
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (public.is_lecturer() and public.lecturer_teaches_student(user_id))
  );

create policy notifications_update_own_or_admin
  on public.notifications
  for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy notifications_delete_own_or_admin
  on public.notifications
  for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Explicit deny-all client policies on immutable snapshot store (accessed strictly by SECURITY DEFINER RPCs / service_role)
create policy assessment_attempt_snapshots_deny_all_authenticated
  on public.assessment_attempt_snapshots
  for all
  to authenticated
  using (false)
  with check (false);

-- ----------------------------------------------------------------------------
-- 14. Server-Side Assessment Attempt & Grading RPCs (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
-- These functions provide concurrency-safe attempt initialization (with atomic
-- snapshot capture) and server-authoritative grading / administrative regrading
-- without exposing question_answer_keys or service-role credentials to clients.

create or replace function public.start_assessment_attempt(target_assessment_id uuid)
returns public.assessment_attempts
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
declare
  caller_id uuid := auth.uid();
  target_assessment public.assessments%rowtype;
  existing_count integer;
  next_number integer;
  computed_max_points numeric(8,2);
  created_attempt public.assessment_attempts%rowtype;
begin
  if caller_id is null then
    raise exception 'Authentication required to start an assessment attempt.';
  end if;

  if not public.can_access_assessment(target_assessment_id) then
    raise exception 'You do not have permission to access this assessment.';
  end if;

  -- Serialize concurrent attempt creation per (assessment_id, user_id)
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(target_assessment_id::text),
    pg_catalog.hashtext(caller_id::text)
  );

  select * into target_assessment
  from public.assessments
  where id = target_assessment_id;

  if not found then
    raise exception 'Assessment not found.';
  end if;

  if target_assessment.status <> 'published' then
    raise exception 'Assessment is not published.';
  end if;

  if target_assessment.available_from is not null and now() < target_assessment.available_from then
    raise exception 'Assessment is not open yet.';
  end if;

  if target_assessment.due_at is not null and now() > target_assessment.due_at then
    raise exception 'Assessment deadline has passed.';
  end if;

  select count(*), coalesce(max(attempt_number), 0) + 1
  into existing_count, next_number
  from public.assessment_attempts
  where assessment_id = target_assessment_id
    and user_id = caller_id;

  if target_assessment.max_attempts is not null and existing_count >= target_assessment.max_attempts then
    raise exception 'Maximum attempt limit reached for this assessment.';
  end if;

  select coalesce(sum(aq.points), 0)::numeric(8,2)
  into computed_max_points
  from public.assessment_questions aq
  where aq.assessment_id = target_assessment_id;

  perform pg_catalog.set_config('theorylab.trusted_attempt_rpc', 'on', true);

  insert into public.assessment_attempts (
    assessment_id,
    user_id,
    attempt_number,
    status,
    started_at,
    max_points,
    pass_score_percent_snapshot
  )
  values (
    target_assessment_id,
    caller_id,
    next_number,
    'in_progress'::public.attempt_status,
    now(),
    computed_max_points,
    target_assessment.pass_score_percent
  )
  returning * into created_attempt;

  perform pg_catalog.set_config('theorylab.trusted_attempt_rpc', 'off', true);

  return created_attempt;
end;
$$;

create or replace function public.grade_assessment_attempt(target_attempt_id uuid)
returns public.assessment_attempts
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
declare
  caller_id uuid := auth.uid();
  target_attempt public.assessment_attempts%rowtype;
  target_assessment public.assessments%rowtype;
  resp_rec record;
  normalized_answer text;
  matched_answer boolean;
  awarded_pts numeric(6,2);
  pending_manual_count integer := 0;
  total_score_points numeric(8,2) := 0;
  total_max_points numeric(8,2) := 0;
  effective_pass_percent numeric(5,2);
  computed_percent numeric(5,2) := 0;
  did_pass boolean := false;
  graded_attempt public.assessment_attempts%rowtype;
begin
  if caller_id is null then
    raise exception 'Authentication required to grade an assessment attempt.';
  end if;

  select * into target_attempt
  from public.assessment_attempts
  where id = target_attempt_id
  for update;

  if not found then
    raise exception 'Assessment attempt not found.';
  end if;

  if not (
    public.is_admin()
    or public.is_attempt_lecturer(target_attempt_id)
    or target_attempt.user_id = caller_id
  ) then
    raise exception 'Not authorized to grade this attempt.';
  end if;

  -- Prevent unauthorized repeated grading of already-finalized attempts
  if target_attempt.status = 'graded'::public.attempt_status then
    raise exception 'Attempt is already graded. Use administrative regrading to recompute finalized grades.';
  end if;

  select * into target_assessment
  from public.assessments
  where id = target_attempt.assessment_id;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('grade_attempt'),
    pg_catalog.hashtext(target_attempt_id::text)
  );

  perform pg_catalog.set_config('theorylab.trusted_attempt_rpc', 'on', true);

  -- Transition expired in_progress attempts consistently before grading
  if target_attempt.status = 'in_progress'::public.attempt_status then
    if (target_assessment.due_at is not null and now() > target_assessment.due_at)
       or (
         target_assessment.duration_minutes is not null
         and now() > target_attempt.started_at + pg_catalog.make_interval(mins => target_assessment.duration_minutes)
       ) then
      update public.assessment_attempts
      set status = 'expired'::public.attempt_status
      where id = target_attempt_id
      returning * into target_attempt;
    else
      perform pg_catalog.set_config('theorylab.trusted_attempt_rpc', 'off', true);
      raise exception 'In-progress attempts must be submitted or expired before grading.';
    end if;
  end if;

  -- Grade using the immutable per-attempt snapshot captured when the attempt began
  select coalesce(sum(s.points), 0)::numeric(8,2)
  into total_max_points
  from public.assessment_attempt_snapshots s
  where s.attempt_id = target_attempt_id;

  if total_max_points = 0 then
    select coalesce(sum(aq.points), 0)::numeric(8,2)
    into total_max_points
    from public.assessment_questions aq
    where aq.assessment_id = target_attempt.assessment_id;
  end if;

  for resp_rec in
    select
      ar.id as response_id,
      ar.selected_option_id,
      ar.response_payload,
      ar.is_correct as existing_is_correct,
      ar.points_awarded as existing_points_awarded,
      coalesce(s.points, aq.points) as question_points,
      coalesce(s.correct_option_id_snapshot, ak.correct_option_id) as correct_option_id,
      coalesce(s.accepted_answers_snapshot, ak.accepted_answers) as accepted_answers
    from public.assessment_responses ar
    join public.assessment_questions aq on aq.id = ar.assessment_question_id
    left join public.assessment_attempt_snapshots s
      on s.attempt_id = ar.attempt_id
     and s.assessment_question_id = ar.assessment_question_id
    left join public.question_answer_keys ak on ak.question_id = ar.question_id
    where ar.attempt_id = target_attempt_id
  loop
    matched_answer := null;
    awarded_pts := null;

    if resp_rec.correct_option_id is not null then
      matched_answer := (resp_rec.selected_option_id is not null and resp_rec.selected_option_id = resp_rec.correct_option_id);
      awarded_pts := case when matched_answer then resp_rec.question_points::numeric(6,2) else 0.00 end;
    elsif resp_rec.accepted_answers is not null
          and jsonb_typeof(resp_rec.accepted_answers) = 'array'
          and jsonb_array_length(resp_rec.accepted_answers) > 0 then
      normalized_answer := lower(trim(coalesce(
        resp_rec.response_payload ->> 'answer',
        resp_rec.response_payload ->> 'value',
        ''
      )));
      matched_answer := exists (
        select 1
        from jsonb_array_elements_text(resp_rec.accepted_answers) as accepted(val)
        where lower(trim(accepted.val)) = normalized_answer
          and normalized_answer <> ''
      );
      awarded_pts := case when matched_answer then resp_rec.question_points::numeric(6,2) else 0.00 end;
    elsif resp_rec.existing_is_correct is not null or resp_rec.existing_points_awarded is not null then
      matched_answer := resp_rec.existing_is_correct;
      awarded_pts := least(coalesce(resp_rec.existing_points_awarded, 0.00), resp_rec.question_points::numeric(6,2));
    else
      -- Manual response without automatic answer key still awaiting lecturer evaluation
      pending_manual_count := pending_manual_count + 1;
    end if;

    if matched_answer is not null or awarded_pts is not null then
      update public.assessment_responses
      set is_correct = matched_answer,
          points_awarded = awarded_pts
      where id = resp_rec.response_id;
    end if;
  end loop;

  -- Preserve submitted/expired state while manual lecturer grading is still pending
  if pending_manual_count > 0 then
    perform pg_catalog.set_config('theorylab.trusted_attempt_rpc', 'off', true);
    return target_attempt;
  end if;

  select coalesce(sum(coalesce(ar.points_awarded, 0)), 0)::numeric(8,2)
  into total_score_points
  from public.assessment_responses ar
  where ar.attempt_id = target_attempt_id;

  total_score_points := least(total_score_points, total_max_points);

  if total_max_points > 0 then
    computed_percent := round((total_score_points / total_max_points) * 100.0, 2)::numeric(5,2);
  else
    computed_percent := 0.00;
  end if;

  effective_pass_percent := coalesce(target_attempt.pass_score_percent_snapshot, target_assessment.pass_score_percent);
  did_pass := (computed_percent >= effective_pass_percent);

  update public.assessment_attempts
  set status = 'graded'::public.attempt_status,
      graded_at = now(),
      score_points = total_score_points,
      max_points = total_max_points,
      score_percent = computed_percent,
      passed = did_pass
  where id = target_attempt_id
  returning * into graded_attempt;

  perform pg_catalog.set_config('theorylab.trusted_attempt_rpc', 'off', true);

  return graded_attempt;
end;
$$;

create or replace function public.admin_regrade_assessment_attempt(
  target_attempt_id uuid,
  reason text default null
)
returns public.assessment_attempts
language plpgsql
security definer
set search_path = pg_catalog, public, auth, pg_temp
as $$
declare
  caller_id uuid := auth.uid();
  target_attempt public.assessment_attempts%rowtype;
  target_assessment public.assessments%rowtype;
  resp_rec record;
  normalized_answer text;
  matched_answer boolean;
  awarded_pts numeric(6,2);
  total_score_points numeric(8,2) := 0;
  total_max_points numeric(8,2) := 0;
  effective_pass_percent numeric(5,2);
  computed_percent numeric(5,2) := 0;
  did_pass boolean := false;
  regraded_attempt public.assessment_attempts%rowtype;
begin
  if caller_id is not null and not public.is_admin() then
    raise exception 'Administrator privileges required to regrade finalized attempts.';
  end if;

  select * into target_attempt
  from public.assessment_attempts
  where id = target_attempt_id
  for update;

  if not found then
    raise exception 'Assessment attempt not found.';
  end if;

  if target_attempt.status <> 'graded'::public.attempt_status then
    raise exception 'Only graded attempts can be administratively regraded.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('grade_attempt'),
    pg_catalog.hashtext(target_attempt_id::text)
  );

  select * into target_assessment
  from public.assessments
  where id = target_attempt.assessment_id;

  select coalesce(sum(s.points), 0)::numeric(8,2)
  into total_max_points
  from public.assessment_attempt_snapshots s
  where s.attempt_id = target_attempt_id;

  if total_max_points = 0 then
    select coalesce(sum(aq.points), 0)::numeric(8,2)
    into total_max_points
    from public.assessment_questions aq
    where aq.assessment_id = target_attempt.assessment_id;
  end if;

  perform pg_catalog.set_config('theorylab.trusted_attempt_rpc', 'on', true);

  for resp_rec in
    select
      ar.id as response_id,
      ar.selected_option_id,
      ar.response_payload,
      ar.is_correct as existing_is_correct,
      ar.points_awarded as existing_points_awarded,
      coalesce(s.points, aq.points) as question_points,
      coalesce(s.correct_option_id_snapshot, ak.correct_option_id) as correct_option_id,
      coalesce(s.accepted_answers_snapshot, ak.accepted_answers) as accepted_answers
    from public.assessment_responses ar
    join public.assessment_questions aq on aq.id = ar.assessment_question_id
    left join public.assessment_attempt_snapshots s
      on s.attempt_id = ar.attempt_id
     and s.assessment_question_id = ar.assessment_question_id
    left join public.question_answer_keys ak on ak.question_id = ar.question_id
    where ar.attempt_id = target_attempt_id
  loop
    matched_answer := null;
    awarded_pts := null;

    if resp_rec.correct_option_id is not null then
      matched_answer := (resp_rec.selected_option_id is not null and resp_rec.selected_option_id = resp_rec.correct_option_id);
      awarded_pts := case when matched_answer then resp_rec.question_points::numeric(6,2) else 0.00 end;
    elsif resp_rec.accepted_answers is not null
          and jsonb_typeof(resp_rec.accepted_answers) = 'array'
          and jsonb_array_length(resp_rec.accepted_answers) > 0 then
      normalized_answer := lower(trim(coalesce(
        resp_rec.response_payload ->> 'answer',
        resp_rec.response_payload ->> 'value',
        ''
      )));
      matched_answer := exists (
        select 1
        from jsonb_array_elements_text(resp_rec.accepted_answers) as accepted(val)
        where lower(trim(accepted.val)) = normalized_answer
          and normalized_answer <> ''
      );
      awarded_pts := case when matched_answer then resp_rec.question_points::numeric(6,2) else 0.00 end;
    elsif resp_rec.existing_is_correct is not null or resp_rec.existing_points_awarded is not null then
      matched_answer := resp_rec.existing_is_correct;
      awarded_pts := least(coalesce(resp_rec.existing_points_awarded, 0.00), resp_rec.question_points::numeric(6,2));
    end if;

    if matched_answer is not null or awarded_pts is not null then
      update public.assessment_responses
      set is_correct = matched_answer,
          points_awarded = awarded_pts
      where id = resp_rec.response_id;
    end if;
  end loop;

  select coalesce(sum(coalesce(ar.points_awarded, 0)), 0)::numeric(8,2)
  into total_score_points
  from public.assessment_responses ar
  where ar.attempt_id = target_attempt_id;

  total_score_points := least(total_score_points, total_max_points);

  if total_max_points > 0 then
    computed_percent := round((total_score_points / total_max_points) * 100.0, 2)::numeric(5,2);
  else
    computed_percent := 0.00;
  end if;

  effective_pass_percent := coalesce(target_attempt.pass_score_percent_snapshot, target_assessment.pass_score_percent);
  did_pass := (computed_percent >= effective_pass_percent);

  update public.assessment_attempts
  set graded_at = coalesce(graded_at, now()),
      score_points = total_score_points,
      max_points = total_max_points,
      score_percent = computed_percent,
      passed = did_pass,
      regraded_at = now(),
      regraded_by = caller_id,
      regrade_reason = nullif(trim(reason), '')
  where id = target_attempt_id
  returning * into regraded_attempt;

  perform pg_catalog.set_config('theorylab.trusted_attempt_rpc', 'off', true);

  return regraded_attempt;
end;
$$;

revoke all on function public.start_assessment_attempt(uuid) from public, anon;
grant execute on function public.start_assessment_attempt(uuid) to authenticated, service_role;

revoke all on function public.grade_assessment_attempt(uuid) from public, anon;
grant execute on function public.grade_assessment_attempt(uuid) to authenticated, service_role;

revoke all on function public.admin_regrade_assessment_attempt(uuid, text) from public, anon;
grant execute on function public.admin_regrade_assessment_attempt(uuid, text) to authenticated, service_role;

commit;
