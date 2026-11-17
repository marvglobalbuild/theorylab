/**
 * Service contracts — the integration boundary for the future backend.
 *
 * The UI depends only on these interfaces. Today every implementation lives in
 * ./preview.ts and performs no network calls. When the backend is introduced,
 * add real implementations (e.g. ./supabase/*.ts) and swap them in ./index.ts;
 * no component should need to change.
 */
import type { LearningLevel, LevelId } from "@/content/learning-paths";

/** Returned by every preview implementation: the feature is not live yet. */
export interface Unavailable {
  status: "unavailable";
  message: string;
}

export type ServiceResult<T> = { status: "ok"; data: T } | Unavailable;

export interface AuthSession {
  userId: string;
  email: string;
}

export interface AuthService {
  signIn(credentials: { email: string; password: string }): Promise<ServiceResult<AuthSession>>;
  signUp(details: { email: string; password: string; name: string }): Promise<ServiceResult<AuthSession>>;
  signOut(): Promise<ServiceResult<null>>;
  getSession(): Promise<ServiceResult<AuthSession | null>>;
}

export type UserRole = "student" | "lecturer";

export interface UserProfile {
  id: string;
  displayName: string;
  role: UserRole;
  level: LevelId;
}

export interface UserProfileService {
  getProfile(userId: string): Promise<ServiceResult<UserProfile>>;
  updateProfile(userId: string, changes: Partial<Omit<UserProfile, "id">>): Promise<ServiceResult<UserProfile>>;
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
