/**
 * Service contracts — the integration boundary for the future Supabase backend.
 *
 * The UI depends only on these interfaces. Today every implementation lives in
 * ./preview.ts and performs no network or database calls. When Supabase is
 * connected, add real implementations (e.g. ./supabase/*.ts) and swap them in
 * ./index.ts; no UI component should need to change.
 */
import type { AcademyLessonContent, AcademyLevel } from "@/content/academy/types";
import type { LearningLevel, LevelId } from "@/content/learning-paths";

/** Returned by every preview implementation when live persistence/auth is not yet active. */
export interface Unavailable {
  status: "unavailable";
  message: string;
}

export type ServiceResult<T> = { status: "ok"; data: T } | Unavailable;

export type UserRole = "independent_learner" | "student" | "lecturer" | "administrator";

/** Account intent chosen on the sign-up screen; privileged lecturer access still requires DB/admin approval. */
export type RegistrationAccountType = "student" | "lecturer";

export type AccountStatus = "active" | "suspended" | "archived";

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "email_already_registered"
  | "weak_password"
  | "validation_error"
  | "account_inactive"
  | "rate_limited"
  | "session_missing"
  | "auth_error";

export type AuthServiceResult<T> =
  | { status: "ok"; data: T }
  | { status: "error"; code: AuthErrorCode; message: string }
  | Unavailable;

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  displayName: string;
  preferredLevel: LevelId;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  profileComplete: boolean;
}

export interface SignUpOutcome {
  session: AuthSession | null;
  requiresEmailConfirmation: boolean;
  email: string;
  requestedAccountType: RegistrationAccountType;
}

export type AuthStateChangeEvent =
  | "INITIAL_SESSION"
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "PASSWORD_RECOVERY";

export interface AuthService {
  signIn(credentials: { email: string; password: string }): Promise<AuthServiceResult<AuthSession>>;
  signUp(details: {
    email: string;
    password: string;
    name: string;
    accountType?: RegistrationAccountType;
  }): Promise<AuthServiceResult<SignUpOutcome>>;
  signOut(): Promise<AuthServiceResult<null>>;
  getSession(): Promise<AuthServiceResult<AuthSession | null>>;
  requestPasswordReset(email: string): Promise<AuthServiceResult<{ sent: true }>>;
  updatePassword(newPassword: string): Promise<AuthServiceResult<{ updated: true }>>;
  verifyEmail(tokenHash: string): Promise<AuthServiceResult<{ verified: true }>>;
  resendVerification(email: string): Promise<AuthServiceResult<{ sent: true }>>;
  onAuthStateChange(
    callback: (event: AuthStateChangeEvent, session: AuthSession | null) => void,
  ): () => void;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  level: LevelId;
  accountStatus: AccountStatus;
}

export interface UserProfileService {
  getProfile(userId: string): Promise<AuthServiceResult<UserProfile>>;
  updateProfile(
    userId: string,
    changes: Partial<Pick<UserProfile, "displayName" | "level">>,
  ): Promise<AuthServiceResult<UserProfile>>;
}

export interface TopicProgress {
  levelId: LevelId;
  topicTitle: string;
  completedAt: string | null;
  score: number | null;
}

export interface LearningProgressService {
  getProgress(userId: string): Promise<ServiceResult<TopicProgress[]>>;
  recordProgress(userId: string, progress: TopicProgress): Promise<ServiceResult<TopicProgress>>;
}

export interface CourseContentService {
  listLevels(): Promise<ServiceResult<LearningLevel[]>>;
  getLevel(id: LevelId): Promise<ServiceResult<LearningLevel>>;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface AssessmentService {
  getAssessment(levelId: LevelId): Promise<ServiceResult<AssessmentQuestion[]>>;
  submitAnswers(
    userId: string,
    levelId: LevelId,
    answers: Record<string, string>,
  ): Promise<ServiceResult<{ score: number }>>;
}

export interface LearnerCourseSummary {
  id: string;
  levelId: LevelId;
  title: string;
  moduleCount: number;
  completedModules: number;
  nextLesson: string;
  estimatedMinutes: number;
}

export interface ActivityEntry {
  id: string;
  title: string;
  category: "Lesson" | "Practice" | "Ear Training" | "Assessment";
  detail: string;
  dateLabel: string;
}

export interface LearnerDashboardSnapshot {
  isDemonstration: true;
  learnerName: string;
  currentLevel: LevelId;
  lessonsCompleted: number;
  totalLessons: number;
  practiceMinutesWeek: number;
  earAccuracyPercent: number;
  continueLearning: {
    courseTitle: string;
    lessonTitle: string;
    levelName: string;
    progressPercent: number;
    summary: string;
  };
  courses: LearnerCourseSummary[];
  recentActivity: ActivityEntry[];
}

export interface LecturerClassSummary {
  id: string;
  code: string;
  title: string;
  level: string;
  studentCount: number;
  schedule: string;
  completionPercent: number;
}

export interface LecturerWorkspaceSnapshot {
  isDemonstration: true;
  lecturerName: string;
  institutionLabel: string;
  classes: LecturerClassSummary[];
  activeAssignmentsCount: number;
  pendingReviewsCount: number;
}

export interface AdminWorkspaceSnapshot {
  isDemonstration: true;
  totalUsersLabel: string;
  activeLecturersLabel: string;
  curriculumStages: number;
  publishedLessons: number;
}

export interface WorkspacePreviewService {
  getLearnerSnapshot(): Promise<ServiceResult<LearnerDashboardSnapshot>>;
  getLecturerSnapshot(): Promise<ServiceResult<LecturerWorkspaceSnapshot>>;
  getAdminSnapshot(): Promise<ServiceResult<AdminWorkspaceSnapshot>>;
}

export type AcademyProgressStatus = "not_started" | "in_progress" | "completed";

export interface AcademyLessonProgress {
  id: string;
  lessonId: string;
  status: AcademyProgressStatus;
  progressPercent: number;
  practiceSeconds: number;
  lastScore: number | null;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string;
}

export interface AcademyLesson extends AcademyLessonContent {
  /** Database UUID when backed by Supabase `public.lessons`; null in unseeded syllabus mode. */
  dbId: string | null;
  pathTitle: string;
  pathNumeral: string;
  courseTitle: string;
  moduleTitle: string;
  previousLessonSlug: string | null;
  previousLessonTitle: string | null;
  nextLessonSlug: string | null;
  nextLessonTitle: string | null;
}

export interface AcademyModule {
  id: string;
  dbId: string | null;
  slug: string;
  courseSlug: string;
  learningPathSlug: string;
  title: string;
  summary: string;
  sortOrder: number;
  lessons: AcademyLesson[];
}

export interface AcademyCourse {
  id: string;
  dbId: string | null;
  slug: string;
  learningPathSlug: string;
  learningPathTitle: string;
  learningPathNumeral: string;
  title: string;
  description: string;
  level: AcademyLevel;
  sortOrder: number;
  estimatedMinutes: number;
  modules: AcademyModule[];
  lessonCount: number;
}

export interface AcademyLearningPath {
  id: string;
  dbId: string | null;
  slug: string;
  numeral: string;
  title: string;
  summary: string;
  level: AcademyLevel;
  sortOrder: number;
  courses: AcademyCourse[];
  lessonCount: number;
  totalEstimatedMinutes: number;
}

export type AcademyCatalogSource = "supabase" | "fallback_empty_db" | "fallback_unconfigured";

export interface AcademyCatalog {
  source: AcademyCatalogSource;
  persistenceAvailable: boolean;
  statusNotice: string | null;
  paths: AcademyLearningPath[];
  courses: AcademyCourse[];
  lessons: AcademyLesson[];
  progressByLessonKey: Record<string, AcademyLessonProgress>;
  resumeLesson: AcademyLesson | null;
}

export type AcademyQueryResult<T> =
  { status: "ok"; data: T } | { status: "error"; message: string };

export interface AcademyService {
  getCatalog(userId?: string | null): Promise<AcademyQueryResult<AcademyCatalog>>;
  recordLessonVisit(input: {
    userId: string | null | undefined;
    lesson: Pick<AcademyLesson, "dbId" | "slug">;
    existingProgress?: AcademyLessonProgress | null | undefined;
  }): Promise<ServiceResult<AcademyLessonProgress>>;
  markLessonCompleted(input: {
    userId: string | null | undefined;
    lesson: Pick<AcademyLesson, "dbId" | "slug">;
    completed: boolean;
    score?: number | null | undefined;
    existingProgress?: AcademyLessonProgress | null | undefined;
  }): Promise<ServiceResult<AcademyLessonProgress>>;
}
