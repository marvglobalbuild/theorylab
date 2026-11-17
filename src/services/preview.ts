/**
 * Frontend-only preview implementations. Nothing here stores data or contacts a server.
 * Accounts, saved progress, submissions and administrative actions report "unavailable"
 * rather than pretending to succeed. Read-only workspace snapshots are clearly flagged
 * with `isDemonstration: true`.
 */
import { LEARNING_LEVELS } from "@/content/learning-paths";
import {
  DEMO_ADMIN_SNAPSHOT,
  DEMO_LEARNER_SNAPSHOT,
  DEMO_LECTURER_SNAPSHOT,
} from "@/content/workspaces";
import type {
  AssessmentService,
  AuthService,
  CourseContentService,
  LearningProgressService,
  Unavailable,
  UserProfileService,
  WorkspacePreviewService,
} from "./contracts";

const unavailable = (feature: string): Unavailable => ({
  status: "unavailable",
  message: `${feature} will be active once Supabase authentication and database services are connected. Nothing has been sent or saved.`,
});

const later = <T extends Unavailable>(value: T) => Promise.resolve(value);

// TODO(supabase): replace with Supabase Auth implementation.
export const previewAuthService: AuthService = {
  signIn: () => later(unavailable("Signing in")),
  signUp: () => later(unavailable("Account registration")),
  signOut: () => later(unavailable("Signing out")),
  getSession: () => Promise.resolve({ status: "ok", data: null }),
  requestPasswordReset: () => later(unavailable("Password recovery")),
  updatePassword: () => later(unavailable("Password update")),
  verifyEmail: () => later(unavailable("Email verification")),
  resendVerification: () => later(unavailable("Verification email resend")),
  onAuthStateChange: () => () => {},
};

// TODO(supabase): read and write profiles from Supabase Postgres with RLS.
export const previewProfileService: UserProfileService = {
  getProfile: () => later(unavailable("User profiles")),
  updateProfile: () => later(unavailable("Profile updates")),
};

// TODO(supabase): persist topic completion and scores per user.
export const previewProgressService: LearningProgressService = {
  getProgress: () => later(unavailable("Saved learning progress")),
  recordProgress: () => later(unavailable("Progress recording")),
};

// TODO(supabase): serve course content from Supabase tables.
export const previewCourseService: CourseContentService = {
  listLevels: () => Promise.resolve({ status: "ok", data: LEARNING_LEVELS }),
  getLevel: (id) => {
    const level = LEARNING_LEVELS.find((l) => l.id === id);
    return Promise.resolve(level ? { status: "ok", data: level } : unavailable("This level"));
  },
};

// TODO(supabase): load question banks and score submissions on the server.
export const previewAssessmentService: AssessmentService = {
  getAssessment: () => later(unavailable("Assessments")),
  submitAnswers: () => later(unavailable("Assessment submission")),
};

// TODO(supabase): replace demonstration workspace snapshots with authenticated queries.
export const previewWorkspaceService: WorkspacePreviewService = {
  getLearnerSnapshot: () => Promise.resolve({ status: "ok", data: DEMO_LEARNER_SNAPSHOT }),
  getLecturerSnapshot: () => Promise.resolve({ status: "ok", data: DEMO_LECTURER_SNAPSHOT }),
  getAdminSnapshot: () => Promise.resolve({ status: "ok", data: DEMO_ADMIN_SNAPSHOT }),
};
