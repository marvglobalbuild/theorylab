import type { LevelId } from "./learning-paths";
import type {
  AdminWorkspaceSnapshot,
  LearnerDashboardSnapshot,
  LecturerWorkspaceSnapshot,
} from "@/services/contracts";

/**
 * Clearly labelled demonstration data used exclusively while Supabase
 * authentication and database persistence are not yet connected.
 */
export const DEMO_LEARNER_SNAPSHOT: LearnerDashboardSnapshot = {
  isDemonstration: true,
  learnerName: "Clara Bennett",
  currentLevel: "elementary",
  lessonsCompleted: 7,
  totalLessons: 20,
  practiceMinutesWeek: 95,
  earAccuracyPercent: 84,
  continueLearning: {
    courseTitle: "Elementary Theory · Stage II",
    lessonTitle: "Intervals: Number and Quality",
    levelName: "Elementary",
    progressPercent: 60,
    summary:
      "Measure melodic and harmonic distances above middle C by staff position and semitone count.",
  },
  courses: [
    {
      id: "foundations-1",
      levelId: "beginner",
      title: "Foundations of Notation & Pulse",
      moduleCount: 5,
      completedModules: 5,
      nextLesson: "Stage complete",
      estimatedMinutes: 15,
    },
    {
      id: "scales-intervals-2",
      levelId: "elementary",
      title: "Scales, Keys & Intervals",
      moduleCount: 5,
      completedModules: 2,
      nextLesson: "Key signatures & the circle of fifths",
      estimatedMinutes: 20,
    },
    {
      id: "triads-harmony-3",
      levelId: "intermediate",
      title: "Triads, Inversions & Diatonic Harmony",
      moduleCount: 5,
      completedModules: 0,
      nextLesson: "Building major and minor triads",
      estimatedMinutes: 25,
    },
    {
      id: "analysis-counterpoint-4",
      levelId: "advanced",
      title: "Cadences, Modulation & Counterpoint",
      moduleCount: 5,
      completedModules: 0,
      nextLesson: "Secondary dominants in context",
      estimatedMinutes: 30,
    },
  ],
  recentActivity: [
    {
      id: "act-1",
      title: "Major and minor scales",
      category: "Lesson",
      detail: "Completed natural and harmonic minor comparison",
      dateLabel: "Demonstration · Today",
    },
    {
      id: "act-2",
      title: "Rising intervals from C4",
      category: "Ear Training",
      detail: "10 of 12 identified correctly (Major 3rd, Perfect 5th)",
      dateLabel: "Demonstration · Yesterday",
    },
    {
      id: "act-3",
      title: "Treble staff sight-reading",
      category: "Practice",
      detail: "18 minutes at keyboard & staff",
      dateLabel: "Demonstration · 2 days ago",
    },
    {
      id: "act-4",
      title: "Beginner Stage I Check",
      category: "Assessment",
      detail: "Ready for Stage II progression",
      dateLabel: "Demonstration · Last week",
    },
  ],
};

export interface LearnerAssessmentItem {
  id: string;
  levelId: LevelId;
  title: string;
  topicsCovered: string;
  questionCount: number;
  durationMinutes: number;
  statusLabel: string;
}

export const DEMO_LEARNER_ASSESSMENTS: LearnerAssessmentItem[] = [
  {
    id: "assess-1",
    levelId: "beginner",
    title: "Stage I Foundations Check",
    topicsCovered: "Treble & bass clefs, note values, simple time signatures",
    questionCount: 12,
    durationMinutes: 15,
    statusLabel: "Demonstration preview",
  },
  {
    id: "assess-2",
    levelId: "elementary",
    title: "Intervals & Key Signatures Diagnostic",
    topicsCovered: "Major/minor scales, intervals up to an octave, circle of fifths",
    questionCount: 16,
    durationMinutes: 20,
    statusLabel: "Demonstration preview",
  },
  {
    id: "assess-3",
    levelId: "intermediate",
    title: "Triads & Figured Bass Mastery",
    topicsCovered: "Root position and inversions, dominant seventh resolution",
    questionCount: 18,
    durationMinutes: 25,
    statusLabel: "Locked until Stage II",
  },
];

export const DEMO_LECTURER_SNAPSHOT: LecturerWorkspaceSnapshot = {
  isDemonstration: true,
  lecturerName: "Dr. Eleanor Vance",
  institutionLabel: "Conservatory Harmony Department (Demonstration)",
  activeAssignmentsCount: 6,
  pendingReviewsCount: 14,
  classes: [
    {
      id: "cls-mus101",
      code: "MUS-101",
      title: "Foundations of Tonal Theory",
      level: "Beginner · Cohort A",
      studentCount: 28,
      schedule: "Mon & Wed · 10:00",
      completionPercent: 72,
    },
    {
      id: "cls-mus204",
      code: "MUS-204",
      title: "Diatonic Harmony & Voice Leading",
      level: "Intermediate · Seminar",
      studentCount: 19,
      schedule: "Tue & Thu · 14:00",
      completionPercent: 54,
    },
    {
      id: "cls-ear110",
      code: "EAR-110",
      title: "Aural Skills & Dictation I",
      level: "Elementary · Lab",
      studentCount: 24,
      schedule: "Fri · 11:00",
      completionPercent: 63,
    },
  ],
};

export interface DemoStudentRecord {
  id: string;
  name: string;
  classCode: string;
  stage: string;
  assignmentsCompleted: string;
  earAccuracy: string;
  supportNote: string;
}

export const DEMO_LECTURER_STUDENTS: DemoStudentRecord[] = [
  {
    id: "stu-1",
    name: "Clara Bennett",
    classCode: "EAR-110",
    stage: "Elementary II",
    assignmentsCompleted: "5 / 6",
    earAccuracy: "84%",
    supportNote: "On track",
  },
  {
    id: "stu-2",
    name: "Julian Mercer",
    classCode: "MUS-204",
    stage: "Intermediate III",
    assignmentsCompleted: "4 / 6",
    earAccuracy: "91%",
    supportNote: "Strong voice leading",
  },
  {
    id: "stu-3",
    name: "Nadia Lindqvist",
    classCode: "MUS-101",
    stage: "Beginner I",
    assignmentsCompleted: "3 / 6",
    earAccuracy: "62%",
    supportNote: "Needs interval review",
  },
  {
    id: "stu-4",
    name: "Tomasz Kowalski",
    classCode: "MUS-204",
    stage: "Intermediate III",
    assignmentsCompleted: "6 / 6",
    earAccuracy: "88%",
    supportNote: "On track",
  },
];

export interface DemoAssignmentRecord {
  id: string;
  title: string;
  classCode: string;
  focus: string;
  dueLabel: string;
  submissionsLabel: string;
}

export const DEMO_LECTURER_ASSIGNMENTS: DemoAssignmentRecord[] = [
  {
    id: "asg-1",
    title: "Treble & Bass Ledger Line Reading",
    classCode: "MUS-101",
    focus: "Notation Lab",
    dueLabel: "Demonstration · Fri",
    submissionsLabel: "22 / 28",
  },
  {
    id: "asg-2",
    title: "Perfect vs. Plagal Cadences in C & G",
    classCode: "MUS-204",
    focus: "Harmony Studio",
    dueLabel: "Demonstration · Mon",
    submissionsLabel: "15 / 19",
  },
  {
    id: "asg-3",
    title: "Melodic Intervals Recognition Set 3",
    classCode: "EAR-110",
    focus: "Ear Training",
    dueLabel: "Demonstration · Wed",
    submissionsLabel: "18 / 24",
  },
];

export interface DemoResourceRecord {
  id: string;
  title: string;
  stage: string;
  format: string;
  topicCount: number;
}

export const DEMO_LECTURER_RESOURCES: DemoResourceRecord[] = [
  {
    id: "res-1",
    title: "Seminar Deck: The Musical Alphabet & Clefs",
    stage: "Stage I · Beginner",
    format: "Interactive Staff + Notes",
    topicCount: 5,
  },
  {
    id: "res-2",
    title: "Workshop: Constructing Scales & Key Signatures",
    stage: "Stage II · Elementary",
    format: "Keyboard + Circle of Fifths",
    topicCount: 5,
  },
  {
    id: "res-3",
    title: "Score Study: Chorale Cadence Analysis",
    stage: "Stage III · Intermediate",
    format: "Annotated Progression Pack",
    topicCount: 4,
  },
];

export const DEMO_ADMIN_SNAPSHOT: AdminWorkspaceSnapshot = {
  isDemonstration: true,
  totalUsersLabel: "Demonstration",
  activeLecturersLabel: "Demonstration",
  curriculumStages: 4,
  publishedLessons: 20,
};

export interface DemoAdminUserRow {
  id: string;
  name: string;
  email: string;
  role: "Independent Learner" | "Student" | "Lecturer" | "Administrator";
  stage: string;
  accountStatus: string;
}

export const DEMO_ADMIN_USERS: DemoAdminUserRow[] = [
  {
    id: "u-1",
    name: "Clara Bennett",
    email: "c.bennett@example.edu",
    role: "Student",
    stage: "Elementary II",
    accountStatus: "Demonstration record",
  },
  {
    id: "u-2",
    name: "Arthur Pendelton",
    email: "arthur.p@example.org",
    role: "Independent Learner",
    stage: "Intermediate III",
    accountStatus: "Demonstration record",
  },
  {
    id: "u-3",
    name: "Dr. Eleanor Vance",
    email: "e.vance@conservatory.example.edu",
    role: "Lecturer",
    stage: "Faculty",
    accountStatus: "Provisioned via Admin",
  },
  {
    id: "u-4",
    name: "Dr. Henrik Lindholm",
    email: "h.lindholm@conservatory.example.edu",
    role: "Lecturer",
    stage: "Faculty",
    accountStatus: "Provisioned via Admin",
  },
  {
    id: "u-5",
    name: "Platform Steward",
    email: "steward@theorylab.example.org",
    role: "Administrator",
    stage: "System",
    accountStatus: "Protected role",
  },
];
