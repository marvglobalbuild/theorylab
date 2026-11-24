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

export type MusicJobType =
  | "audio_analysis"
  | "instrument_detection"
  | "source_separation"
  | "pitch_extraction"
  | "music_transcription"
  | "accompaniment_generation"
  | "audio_rendering";

export type MusicJobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

export type SupportedAudioFormat =
  | "wav"
  | "mp3"
  | "flac"
  | "m4a"
  | "aac"
  | "ogg"
  | "opus"
  | "webm"
  | "mp4"
  | "mov"
  | "mkv"
  | "avi"
  | "mid"
  | "midi";

export type SupportedMediaCategory = "audio" | "video" | "midi";

export interface AudioSourceRef {
  storage_backend: "supabase" | "local";
  bucket: string;
  object_path: string;
  asset_id?: string | null;
  original_filename?: string | null;
  declared_mime_type?: string | null;
  declared_size_bytes?: number | null;
}

export interface TrimWindow {
  start_ms: number;
  end_ms?: number | null;
}

export interface VerifiedAudioMetadata {
  detected_format: SupportedAudioFormat;
  mime_type: string;
  media_category?: SupportedMediaCategory;
  size_bytes: number;
  sha256_checksum: string;
  duration_ms: number;
  sample_rate_hz: number;
  channels: number;
  codec_name: string;
  bit_rate_bps: number | null;
  bit_depth: number | null;
  original_preserved: boolean;
  video_extracted?: boolean;
  midi_track_count?: number | null;
  midi_note_count?: number | null;
}

export interface MusicEngineErrorDetail {
  code: string;
  message: string;
  retryable: boolean;
  details: Record<string, unknown>;
}

export interface MusicEngineHealth {
  status: "ok" | "degraded";
  service: string;
  version: string;
  environment: string;
  uptime_seconds: number;
  timestamp: string;
  storage_backend: string;
  job_repository_backend: string;
  active_jobs: number;
  dependencies: {
    ffmpeg_available: boolean;
    ffprobe_available: boolean;
    supabase_auth_configured: boolean;
    supabase_storage_configured: boolean;
    supabase_db_configured: boolean;
  };
}

export interface MusicEngineCapabilities {
  service: string;
  version: string;
  phase: string;
  supported_formats: Array<{
    format: SupportedAudioFormat;
    mime_types: string[];
    decode_supported: boolean;
    export_supported: boolean;
  }>;
  limits: {
    max_file_size_bytes: number;
    max_duration_seconds: number;
    max_audio_file_size_bytes?: number;
    max_video_file_size_bytes?: number;
    max_midi_file_size_bytes?: number;
    max_audio_duration_seconds?: number;
    max_video_duration_seconds?: number;
    max_midi_duration_seconds?: number;
    max_concurrent_jobs_per_user: number;
    target_internal_sample_rate_hz: number;
    realistic_sample_playback_required: boolean;
  };
  job_types: Array<{
    job_type: MusicJobType;
    studio_consumers: string[];
    status: "ready" | "awaiting_model_integration";
    model_integrated: boolean;
    required_interfaces: string[];
    active_provider: string | null;
    description: string;
  }>;
  processing_interfaces: Array<{
    interface_name: string;
    stage: string;
    readiness: "implemented" | "interface_only";
    description: string;
    model_integrated: boolean;
    notes: string | null;
  }>;
}

export interface JobArtifactRef {
  artifact_type: string;
  storage_backend: string;
  bucket: string | null;
  object_path: string;
  mime_type: string;
  size_bytes: number | null;
}

export interface CreateMusicJobRequest {
  job_type: MusicJobType;
  source_audio: AudioSourceRef;
  trim_window?: TrimWindow | null;
  parameters?: Record<string, unknown>;
  studio_context?: string | null;
  idempotency_key?: string | null;
}

export interface MusicProcessingJob {
  job_id: string;
  user_id: string;
  job_type: MusicJobType;
  status: MusicJobStatus;
  progress_percent: number;
  stage: string;
  source_audio: AudioSourceRef;
  trim_window: TrimWindow | null;
  parameters: Record<string, unknown>;
  studio_context: string | null;
  audio_metadata: VerifiedAudioMetadata | null;
  artifacts: JobArtifactRef[];
  result: Record<string, unknown> | null;
  error: MusicEngineErrorDetail | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

export interface CancelMusicJobResponse {
  job_id: string;
  status: MusicJobStatus;
  cancelled: boolean;
  message: string;
  job: MusicProcessingJob;
}

export type InstrumentFamily = "piano" | "strings" | "bass" | "brass" | "woodwinds" | "drums";

export type ArrangementStyle = "ballad" | "pop" | "gospel" | "classical" | "cinematic";

export type ExportFormat = "wav" | "flac" | "mp3";

export type VocalBalanceMode = "auto_adaptive" | "manual";

export interface InstrumentSpec {
  instrument_id: string;
  family: InstrumentFamily;
  display_name: string;
  gm_program: number;
  default_channel: number;
  is_percussion: boolean;
  min_midi: number;
  max_midi: number;
  default_volume: number;
  default_pan: number;
}

export interface SoundLibraryStatus {
  available: boolean;
  soundfont_path: string | null;
  soundfont_name: string | null;
  format: "sf2" | "sf3" | "unknown";
  size_bytes: number | null;
  license_name: string | null;
  missing_reason: string | null;
  install_instructions: string | null;
}

export interface InstrumentDiagnostics {
  fluidsynth_available: boolean;
  fluidsynth_executable: string | null;
  sound_library: SoundLibraryStatus;
  supported_families: InstrumentFamily[];
  instruments: InstrumentSpec[];
}

export interface AudioUploadResponse {
  valid: boolean;
  asset_reference: AudioSourceRef | null;
  metadata: VerifiedAudioMetadata;
  warnings: string[];
}

export interface ArtifactSignedUrlResponse {
  job_id: string;
  object_path: string;
  mime_type: string;
  filename: string;
  storage_backend: string;
  access_mode: "signed_url" | "authenticated_stream" | string;
  signed_url: string | null;
  download_path: string;
  expires_in_seconds: number;
}

export interface DownloadedArtifactPayload {
  blob: Blob;
  filename: string;
  mimeType: string;
  objectPath: string;
}

export interface BeatMarker {
  time_ms: number;
  beat_number: number;
  bar_number: number;
  is_downbeat: boolean;
}

export interface ChordEvent {
  start_ms: number;
  end_ms: number;
  symbol: string;
  root: string;
  quality: string;
  confidence: number;
}

export interface ChromaSummary {
  pitch_classes: Record<string, number>;
  hop_ms: number;
  frame_count: number;
  mean_energy: number;
}

export interface PitchPoint {
  time_ms: number;
  frequency_hz: number | null;
  midi_note: number | null;
  confidence: number;
  voiced: boolean;
}

export interface TimeRegion {
  start_ms: number;
  end_ms: number;
  mean_confidence: number;
}

export interface NoteEvent {
  start_ms: number;
  end_ms: number;
  midi_pitch: number;
  velocity: number;
  voice: string;
  clef_hint: "treble" | "bass" | "alto" | "tenor";
  confidence: number;
}

export interface PitchExtractionResult {
  mode: "monophonic" | "polyphonic";
  hop_ms: number;
  contours: PitchPoint[];
  voiced_regions: TimeRegion[];
  unvoiced_regions: TimeRegion[];
  note_events: NoteEvent[];
  note_event_count?: number;
  voiced_frame_count: number;
  total_frame_count: number;
  voiced_ratio: number;
  mean_confidence: number;
  pitch_range_midi: [number, number] | null;
  audio_duration_ms: number;
  sample_rate_hz: number;
  extractor_method: string;
  monophonic_only_notice: string;
  warnings: string[];
}

export interface AudioAnalysisResult {
  tempo_bpm: number | null;
  tempo_confidence: number;
  tempo_stability: "steady" | "moderate_variation" | "rubato_or_uncertain" | "unavailable";
  time_signature: string | null;
  estimated_key: string | null;
  key_root: string | null;
  scale: string | null;
  key_confidence: number;
  tuning_offset_cents: number | null;
  beats: BeatMarker[];
  chords: ChordEvent[];
  chroma_summary: ChromaSummary | null;
  audio_duration_ms: number;
  sample_rate_hz: number;
  reliability: "high" | "medium" | "low" | "unreliable";
  reliability_score: number;
  analysis_method: string;
  is_heuristic: boolean;
  instrument_tags: string[];
  warnings: string[];
  vocal_pitch?: PitchExtractionResult | null;
}

export interface ArrangementConfig {
  style: ArrangementStyle;
  selected_instruments: string[];
  energy: number;
  density: number;
  key_override: string | null;
  tempo_override_bpm: number | null;
  transpose_semitones: number;
  intro_bars: number;
  outro_bars: number;
  instrument_volumes: Record<string, number>;
  enabled_tracks?: Record<string, boolean>;
  render_individual_stems: boolean;
}

export interface ExportMetadata {
  title?: string | null;
  artist?: string | null;
  album?: string | null;
  comment?: string | null;
}

export interface MixAndExportConfig {
  output_formats: ExportFormat[];
  sample_rate_hz: number;
  wav_bit_depth: 16 | 24;
  mp3_bitrate_kbps: number;
  target_lufs: number;
  true_peak_ceiling_dbtp: number;
  max_limiting_db: number;
  vocal_gain_db: number;
  accompaniment_gain_db: number;
  vocal_balance_mode: VocalBalanceMode;
  stem_gains_db: Record<string, number>;
  stem_pans: Record<string, number>;
  muted_stems: string[];
  solo_stems: string[];
  vocal_pan: number;
  accompaniment_pan: number;
  preserve_outro: boolean;
  include_original_vocal_copy: boolean;
  metadata?: ExportMetadata | null;
}

export interface LoudnessMeasurement {
  integrated_lufs: number | null;
  sample_peak_linear: number;
  sample_peak_dbfs: number | null;
  true_peak_linear: number;
  true_peak_dbtp: number | null;
  rms_dbfs: number | null;
  crest_factor_db: number | null;
  is_silent: boolean;
  true_peak_method: string;
}

export interface MasteringReport {
  target_lufs: number;
  true_peak_ceiling_dbtp: number;
  max_limiting_db: number;
  true_peak_method: string;
  loudness_method: string;
  input_metrics: LoudnessMeasurement;
  output_metrics: LoudnessMeasurement;
  applied_gain_db: number;
  limiting_applied: boolean;
  limiting_gain_reduction_db: number;
  clipping_detected: boolean;
  target_lufs_achieved: boolean;
  true_peak_compliant: boolean;
  dynamic_range_preserved: boolean;
  warnings: string[];
  notes: string[];
}

export interface ExportArtifactSummary {
  format: ExportFormat;
  filename: string;
  object_path: string;
  mime_type: string;
  size_bytes: number;
  sample_rate_hz: number;
  channels: number;
  duration_ms: number;
  bit_depth: number | null;
  bitrate_kbps: number | null;
  codec_name: string;
  ffprobe_verified: boolean;
  soundfile_verified: boolean;
  peak_amplitude: number | null;
  metadata_written: Record<string, string>;
}

export interface StemRenderSummary {
  instrument_id: string;
  track_name: string;
  gm_program: number;
  channel: number;
  object_path: string;
  duration_ms: number;
  peak_amplitude: number | null;
  rms_amplitude: number | null;
  size_bytes: number;
}

export interface TrackMixSummary {
  track_id: string;
  is_original_vocal: boolean;
  source_sample_rate_hz: number;
  source_channels: number;
  resampled: boolean;
  duration_ms: number;
  offset_ms: number;
  applied_gain_db: number;
  pan: number;
  muted: boolean;
  input_lufs: number | null;
}

export interface MixingSummary {
  sample_rate_hz: number;
  channels: number;
  mix_duration_ms: number;
  vocal_duration_ms: number;
  accompaniment_duration_ms: number;
  intro_offset_ms: number;
  vocal_balance_mode: VocalBalanceMode;
  adaptive_accompaniment_trim_db: number;
  effective_vocal_gain_db: number;
  effective_accompaniment_gain_db: number;
  used_individual_stems: boolean;
  pre_master_sample_peak_dbfs: number | null;
  pre_master_true_peak_dbtp: number | null;
  pre_master_clipping_risk: boolean;
  original_vocal_preserved: boolean;
  vocal_timing_and_pitch_unmodified: boolean;
  original_vocal_copy_object_path: string | null;
  tracks_mixed: TrackMixSummary[];
  warnings: string[];
}

export interface AccompanimentJobResult {
  arrangement: {
    style: ArrangementStyle;
    key: string;
    key_root: string;
    scale: string;
    tempo_bpm: number;
    time_signature: string;
    beats_per_bar: number;
    total_bars: number;
    intro_bars: number;
    outro_bars: number;
    duration_ms: number;
    transpose_semitones: number;
    harmony_source: string;
    chords: Array<{
      bar_index: number;
      start_ms: number;
      end_ms: number;
      symbol: string;
      roman_numeral: string;
      root_pc: number;
      quality: string;
    }>;
    tracks: Array<{
      instrument_id: string;
      track_name: string;
      gm_program: number;
      channel: number;
      is_percussion: boolean;
      volume: number;
      pan: number;
      note_count: number;
    }>;
    warnings: string[];
  };
  midi: {
    filename: string;
    object_path: string;
    track_count: number;
    instrument_tracks: number;
    note_count: number;
    duration_ms: number;
    tempo_bpm: number;
    time_signature: string;
    key_signature: string;
    ticks_per_beat: number;
  };
  synthesis: {
    engine: string;
    soundfont_name: string | null;
    sample_rate_hz: number;
    channels: number;
    duration_ms: number;
    peak_amplitude: number | null;
    rms_amplitude: number | null;
    size_bytes: number;
    object_path: string;
    individual_stems: StemRenderSummary[];
  };
  musical_analysis: {
    tempo_bpm: number | null;
    tempo_confidence: number;
    tempo_stability: string;
    time_signature: string | null;
    estimated_key: string | null;
    key_confidence: number;
    reliability: string;
    reliability_score: number;
    chord_count: number;
    warnings: string[];
  };
  vocal_pitch: {
    mode: string;
    voiced_ratio: number;
    mean_confidence: number;
    note_event_count: number;
    pitch_range_midi: [number, number] | null;
    warnings: string[];
  };
  original_vocal_preserved: boolean;
  mixing_status: string;
  mixing?: MixingSummary;
  mastering?: MasteringReport;
  exports?: ExportArtifactSummary[];
}

export type MusicIntelligenceResult<T> =
  | { status: "ok"; data: T }
  | {
      status: "error";
      code: string;
      message: string;
      httpStatus?: number;
      retryable: boolean;
      details?: Record<string, unknown>;
    }
  | Unavailable;

export interface AudioUploadOptions {
  onProgress?: (percent: number) => void;
}

export interface MusicIntelligenceService {
  isConfigured(): boolean;
  getHealth(): Promise<MusicIntelligenceResult<MusicEngineHealth>>;
  getCapabilities(): Promise<MusicIntelligenceResult<MusicEngineCapabilities>>;
  getInstruments(): Promise<MusicIntelligenceResult<InstrumentDiagnostics>>;
  uploadAudio(
    file: File,
    options?: AudioUploadOptions,
  ): Promise<MusicIntelligenceResult<AudioUploadResponse>>;
  createJob(request: CreateMusicJobRequest): Promise<MusicIntelligenceResult<MusicProcessingJob>>;
  listJobs(limit?: number): Promise<MusicIntelligenceResult<MusicProcessingJob[]>>;
  getJob(jobId: string): Promise<MusicIntelligenceResult<MusicProcessingJob>>;
  cancelJob(
    jobId: string,
    reason?: string,
  ): Promise<MusicIntelligenceResult<CancelMusicJobResponse>>;
  getArtifactSignedUrl(
    jobId: string,
    objectPath: string,
    expiresInSeconds?: number,
  ): Promise<MusicIntelligenceResult<ArtifactSignedUrlResponse>>;
  downloadArtifactBlob(
    jobId: string,
    objectPath: string,
  ): Promise<MusicIntelligenceResult<DownloadedArtifactPayload>>;
}
