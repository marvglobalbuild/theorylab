/**
 * The single place where the app chooses service implementations.
 * Swap these exports for backend-backed versions when the backend is connected.
 */
export {
  previewAuthService as authService,
  previewProfileService as profileService,
  previewProgressService as progressService,
  previewCourseService as courseService,
  previewAssessmentService as assessmentService,
} from "./preview";
export type * from "./contracts";
