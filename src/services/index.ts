/**
 * The single place where the app chooses service implementations.
 * Authentication and profile/role services are connected to Supabase Auth and PostgreSQL.
 */
export {
  supabaseAuthService as authService,
  supabaseProfileService as profileService,
} from "./supabase-auth";
export { supabaseAcademyService as academyService } from "./supabase-academy";
export { musicIntelligenceService, createMusicIntelligenceService } from "./music-intelligence";
export {
  previewProgressService as progressService,
  previewCourseService as courseService,
  previewAssessmentService as assessmentService,
  previewWorkspaceService as workspaceService,
} from "./preview";
export type * from "./contracts";
