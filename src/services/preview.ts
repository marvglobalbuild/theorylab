/**
 * Frontend-only preview implementations. Nothing here stores data or contacts a server.
 * Accounts, saved progress and assessments report "unavailable" rather than pretending
 * to succeed. Course content is served from the local content files.
 */
import { LEARNING_LEVELS } from "@/content/learning-paths";
import type {
  AssessmentService,
  AuthService,
  CourseContentService,
  LearningProgressService,
  Unavailable,
  UserProfileService,
} from "./contracts";

const unavailable = (feature: string): Unavailable => ({
  status: "unavailable",
  message: `${feature} will be available once THEORYLAB accounts launch. Nothing has been sent or saved.`,
});

const later = <T extends Unavailable>(value: T) => Promise.resolve(value);

// TODO(backend): replace with an implementation backed by the authentication provider.
export const previewAuthService: AuthService = {
  signIn: () => later(unavailable("Signing in")),
  signUp: () => later(unavailable("Account creation")),
  signOut: () => later(unavailable("Signing out")),
  getSession: () => Promise.resolve({ status: "ok", data: null }),
};

// TODO(backend): read and write profiles from the database.
export const previewProfileService: UserProfileService = {
  getProfile: () => later(unavailable("Profiles")),
  updateProfile: () => later(unavailable("Profiles")),
};

// TODO(backend): persist topic completion and scores per user.
export const previewProgressService: LearningProgressService = {
  getProgress: () => later(unavailable("Saved progress")),
  recordProgress: () => later(unavailable("Saved progress")),
};

// TODO(backend): serve course content from the database instead of local files.
export const previewCourseService: CourseContentService = {
  listLevels: () => Promise.resolve({ status: "ok", data: LEARNING_LEVELS }),
  getLevel: (id) => {
    const level = LEARNING_LEVELS.find((l) => l.id === id);
    return Promise.resolve(level ? { status: "ok", data: level } : unavailable("This level"));
  },
};

// TODO(backend): load question banks and score submissions on the server.
export const previewAssessmentService: AssessmentService = {
  getAssessment: () => later(unavailable("Assessments")),
  submitAnswers: () => later(unavailable("Assessments")),
};
