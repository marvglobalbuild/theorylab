import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";

import { LessonReader } from "@/components/academy/LessonReader";
import {
  ACADEMY_COURSES,
  ACADEMY_LEARNING_PATHS,
  ACADEMY_LESSONS,
} from "@/content/academy-curriculum";
import {
  createSupabaseAcademyService,
  buildCanonicalAcademyCatalog,
} from "@/services/supabase-academy";
import { Route as LearnDashboardRoute } from "@/routes/learn/index";
import { Route as LearnPathsRoute } from "@/routes/learn/paths";
import { Route as LearnCoursesRoute } from "@/routes/learn/courses";
import { Route as LearnProgressRoute } from "@/routes/learn/progress";
import type { AcademyCatalog } from "@/services/contracts";

const mockPlayPhrase = vi.fn();

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    Link: ({
      to,
      params,
      children,
      ...props
    }: {
      to?: string;
      params?: Record<string, string>;
      children?: ReactNode;
      [key: string]: unknown;
    }) => {
      let href = typeof to === "string" ? to : "#";
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          href = href.replace(`$${k}`, encodeURIComponent(v));
        });
      }
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
  };
});

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    session: {
      userId: "user-123",
      email: "learner@theorylab.edu",
      role: "independent_learner",
      roles: ["independent_learner"],
      displayName: "Clara Schumann",
      preferredLevel: "beginner",
      accountStatus: "active",
      emailVerified: true,
      profileComplete: true,
    },
    isLoading: false,
  }),
}));

vi.mock("@/lib/music/usePiano", () => ({
  usePiano: () => ({
    status: "ready",
    noteOn: vi.fn(),
    noteOff: vi.fn(),
    playPhrase: mockPlayPhrase,
  }),
}));

const mockGetCatalog = vi.fn();
const mockRecordLessonVisit = vi.fn();
const mockMarkLessonCompleted = vi.fn();

vi.mock("@/services", async () => {
  const actual = await vi.importActual<typeof import("@/services")>("@/services");
  return {
    ...actual,
    academyService: {
      getCatalog: (...args: unknown[]) => mockGetCatalog(...args),
      recordLessonVisit: (...args: unknown[]) => mockRecordLessonVisit(...args),
      markLessonCompleted: (...args: unknown[]) => mockMarkLessonCompleted(...args),
    },
  };
});

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

function createMockSupabaseForAcademy({
  paths = [] as unknown[],
  courses = [] as unknown[],
  modules = [] as unknown[],
  lessons = [] as unknown[],
  progress = [] as unknown[],
  queryError = null as { message: string } | null,
  upsertError = null as { message: string } | null,
}: {
  paths?: unknown[];
  courses?: unknown[];
  modules?: unknown[];
  lessons?: unknown[];
  progress?: unknown[];
  queryError?: { message: string } | null;
  upsertError?: { message: string } | null;
} = {}) {
  const upsertSingle = vi.fn().mockImplementation(() => {
    if (upsertError) {
      return Promise.resolve({ data: null, error: upsertError });
    }
    return Promise.resolve({
      data: {
        id: "prog-1",
        user_id: "user-123",
        lesson_id: "lesson-uuid-1",
        status: "completed",
        progress_percent: 100,
        practice_seconds: 0,
        last_score: 100,
        started_at: "2026-11-17T00:00:00Z",
        completed_at: "2026-11-17T00:10:00Z",
        last_accessed_at: "2026-11-17T00:10:00Z",
      },
      error: null,
    });
  });

  const client = {
    from(table: string) {
      if (table === "lesson_progress") {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: progress, error: queryError }),
          }),
          upsert: vi.fn(() => ({
            select: () => ({
              single: upsertSingle,
            }),
          })),
        };
      }

      const tableData: Record<string, unknown[]> = {
        learning_paths: paths,
        courses,
        course_modules: modules,
        lessons,
      };

      const rows = tableData[table] ?? [];
      return {
        select: () => ({
          eq: (_col: string, val: string) => ({
            order: () =>
              Promise.resolve({
                data: queryError
                  ? null
                  : rows.filter((r) => (r as { status: string }).status === val),
                error: queryError,
              }),
          }),
        }),
      };
    },
  };

  return { client: client as unknown as SupabaseClient, upsertSingle };
}

describe("Theory Academy curriculum structure & completeness", () => {
  it("contains all 4 required learning paths and 39 distinct topics", () => {
    expect(ACADEMY_LEARNING_PATHS.map((p) => p.title)).toEqual([
      "Foundations of Music",
      "Scales and Tonality",
      "Intervals and Harmony",
      "Rhythm and Musical Reading",
    ]);

    expect(ACADEMY_LESSONS).toHaveLength(39);
    const uniqueSlugs = new Set(ACADEMY_LESSONS.map((l) => l.slug));
    expect(uniqueSlugs.size).toBe(39);

    const expectedCounts: Record<string, number> = {
      "foundations-of-music": 10,
      "scales-and-tonality": 9,
      "intervals-and-harmony": 10,
      "rhythm-and-musical-reading": 10,
    };

    Object.entries(expectedCounts).forEach(([pathSlug, count]) => {
      const countInPath = ACADEMY_LESSONS.filter((l) => l.learningPathSlug === pathSlug).length;
      expect(countInPath).toBe(count);
    });
  });

  it("equips every lesson with objectives, sections, repertoire, worked example, practice check, and takeaways", () => {
    expect(ACADEMY_COURSES.length).toBeGreaterThanOrEqual(8);

    for (const lesson of ACADEMY_LESSONS) {
      expect(lesson.objectives.length).toBeGreaterThanOrEqual(2);
      expect(lesson.sections.length).toBeGreaterThanOrEqual(1);
      expect(lesson.repertoireExample.composer.length).toBeGreaterThan(2);
      expect(lesson.workedExample.steps.length).toBeGreaterThanOrEqual(2);
      expect(lesson.practiceActivities.length).toBeGreaterThanOrEqual(1);
      expect(lesson.keyTakeaways.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("supabaseAcademyService", () => {
  it("returns honest unconfigured syllabus notice and unavailable writes when Supabase client is null", async () => {
    const svc = createSupabaseAcademyService(null);
    const cat = await svc.getCatalog("user-123");

    expect(cat.status).toBe("ok");
    if (cat.status === "ok") {
      expect(cat.data.source).toBe("fallback_unconfigured");
      expect(cat.data.persistenceAvailable).toBe(false);
      expect(cat.data.lessons).toHaveLength(39);
    }

    const visit = await svc.recordLessonVisit({
      userId: "user-123",
      lesson: { dbId: null, slug: "understanding-music-and-sound" },
    });
    expect(visit.status).toBe("unavailable");

    const complete = await svc.markLessonCompleted({
      userId: "user-123",
      lesson: { dbId: null, slug: "understanding-music-and-sound" },
      completed: true,
    });
    expect(complete.status).toBe("unavailable");
  });

  it("returns fallback_empty_db cleanly when connected DB has zero published rows", async () => {
    const { client } = createMockSupabaseForAcademy();
    const svc = createSupabaseAcademyService(client);
    const cat = await svc.getCatalog("user-123");

    expect(cat.status).toBe("ok");
    if (cat.status === "ok") {
      expect(cat.data.source).toBe("fallback_empty_db");
      expect(cat.data.persistenceAvailable).toBe(false);
      expect(cat.data.lessons).toHaveLength(39);
    }
  });

  it("surfaces DB query errors cleanly without crashing", async () => {
    const { client } = createMockSupabaseForAcademy({
      queryError: { message: "Database timeout" },
    });
    const svc = createSupabaseAcademyService(client);
    const cat = await svc.getCatalog("user-123");

    expect(cat.status).toBe("error");
    if (cat.status === "error") {
      expect(cat.message).toContain("Database timeout");
    }
  });

  it("enforces published-only curriculum hierarchy and persists completion into lesson_progress", async () => {
    const { client, upsertSingle } = createMockSupabaseForAcademy({
      paths: [
        {
          id: "path-1",
          slug: "foundations-of-music",
          numeral: "I",
          title: "Foundations of Music",
          summary: "Foundations",
          level: "beginner",
          sort_order: 1,
          status: "published",
        },
        {
          id: "path-draft",
          slug: "secret-draft",
          numeral: "V",
          title: "Unpublished Draft Path",
          summary: "Hidden",
          level: "advanced",
          sort_order: 9,
          status: "draft",
        },
      ],
      courses: [
        {
          id: "course-1",
          learning_path_id: "path-1",
          slug: "foundations-pitch-and-literacy",
          title: "Sound & Literacy",
          description: "Pitch & staff",
          level: "beginner",
          sort_order: 1,
          estimated_minutes: 30,
          status: "published",
        },
        {
          id: "course-draft",
          learning_path_id: "path-draft",
          slug: "draft-course",
          title: "Hidden Course",
          description: "",
          level: "beginner",
          sort_order: 2,
          estimated_minutes: 20,
          status: "published",
        },
      ],
      modules: [
        {
          id: "mod-1",
          course_id: "course-1",
          slug: "sound-pitch-and-alphabet",
          title: "Module 1",
          summary: "Core",
          sort_order: 1,
          status: "published",
        },
      ],
      lessons: [
        {
          id: "lesson-uuid-1",
          module_id: "mod-1",
          slug: "understanding-music-and-sound",
          title: "Understanding music and sound",
          summary: "Sound intro",
          content_markdown: "",
          notation_payload: null,
          audio_config: null,
          estimated_minutes: 8,
          sort_order: 1,
          status: "published",
        },
        {
          id: "lesson-uuid-2",
          module_id: "mod-1",
          slug: "pitch-and-frequency",
          title: "Pitch and frequency",
          summary: "Hz",
          content_markdown: "",
          notation_payload: null,
          audio_config: null,
          estimated_minutes: 9,
          sort_order: 2,
          status: "published",
        },
      ],
      progress: [
        {
          id: "prog-0",
          user_id: "user-123",
          lesson_id: "lesson-uuid-2",
          status: "in_progress",
          progress_percent: 25,
          practice_seconds: 60,
          last_score: null,
          started_at: "2026-11-17T00:00:00Z",
          completed_at: null,
          last_accessed_at: "2026-11-17T02:00:00Z",
        },
      ],
    });

    const svc = createSupabaseAcademyService(client);
    const cat = await svc.getCatalog("user-123");

    expect(cat.status).toBe("ok");
    if (cat.status === "ok") {
      expect(cat.data.source).toBe("supabase");
      expect(cat.data.persistenceAvailable).toBe(true);
      expect(cat.data.paths).toHaveLength(1);
      expect(cat.data.courses).toHaveLength(1);
      expect(cat.data.lessons).toHaveLength(2);
      expect(cat.data.resumeLesson?.slug).toBe("pitch-and-frequency");
    }

    const done = await svc.markLessonCompleted({
      userId: "user-123",
      lesson: { dbId: "lesson-uuid-1", slug: "understanding-music-and-sound" },
      completed: true,
      score: 100,
    });
    expect(done.status).toBe("ok");
    expect(upsertSingle).toHaveBeenCalledTimes(1);
  });
});

describe("Theory Academy UI integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Academy dashboard with resume lesson, 4 paths, and courses from live catalog", async () => {
    const canonical = buildCanonicalAcademyCatalog(
      "fallback_empty_db",
      "Connected to Supabase, pending seed.",
    );
    mockGetCatalog.mockResolvedValue({ status: "ok", data: canonical });

    const Dashboard = LearnDashboardRoute.options.component!;
    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Clara Schumann\./i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Foundations of Music/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Scales and Tonality/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Intervals and Harmony/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Rhythm and Musical Reading/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: /Start first lesson/i })).toHaveAttribute(
      "href",
      "/learn/lessons/understanding-music-and-sound",
    );
  });

  it("renders loading and error recovery cleanly on Academy paths page", async () => {
    mockGetCatalog.mockResolvedValueOnce({ status: "error", message: "Connection failed" });

    const PathsPage = LearnPathsRoute.options.component!;
    render(<PathsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Unable to load learning paths/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Connection failed/i)).toBeInTheDocument();
  });

  it("filters Academy courses by difficulty and handles empty/populated views cleanly", async () => {
    const canonical = buildCanonicalAcademyCatalog("fallback_unconfigured", "Read-only mode.");
    mockGetCatalog.mockResolvedValue({ status: "ok", data: canonical });

    const CoursesPage = LearnCoursesRoute.options.component!;
    render(<CoursesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Sound, Pitch & Staff Literacy/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("tab", { name: /Intermediate/i }));
    expect(screen.getByText(/Intervals, Consonance & Triads/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sound, Pitch & Staff Literacy/i)).not.toBeInTheDocument();
  });

  it("renders real progress counts cleanly on Academy progress page", async () => {
    const catalog = buildCanonicalAcademyCatalog(
      "fallback_empty_db",
      "Connected to Supabase.",
    ) as AcademyCatalog;
    catalog.persistenceAvailable = true;
    catalog.statusNotice = null;
    catalog.progressByLessonKey[catalog.lessons[0]!.slug] = {
      id: "p-1",
      lessonId: "db-1",
      status: "completed",
      progressPercent: 100,
      practiceSeconds: 120,
      lastScore: 100,
      startedAt: "2026-11-17T00:00:00Z",
      completedAt: "2026-11-17T00:08:00Z",
      lastAccessedAt: "2026-11-17T00:08:00Z",
    };

    mockGetCatalog.mockResolvedValue({ status: "ok", data: catalog });

    const ProgressPage = LearnProgressRoute.options.component!;
    render(<ProgressPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("1/39")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("tab", { name: /Completed \(1\)/i }));
    expect(screen.getByText(/Understanding music and sound/i)).toBeInTheDocument();
  });

  it("supports interactive practice feedback, Tone audio playback, and lesson completion inside LessonReader", async () => {
    const canonical = buildCanonicalAcademyCatalog("fallback_unconfigured", "Read-only mode.");
    const lesson = canonical.lessons[0]!;
    const onRecordVisit = vi.fn().mockResolvedValue({
      status: "unavailable",
      message: "Read-only",
    });
    const onToggleCompleted = vi.fn().mockResolvedValue({
      status: "unavailable",
      message: "Lesson progress syncing requires published database records.",
    });

    render(
      <LessonReader
        lesson={lesson}
        progress={null}
        persistenceAvailable={false}
        statusNotice="Read-only mode."
        onRecordVisit={onRecordVisit}
        onToggleCompleted={onToggleCompleted}
      />,
    );

    expect(screen.getByRole("heading", { name: lesson.title })).toBeInTheDocument();
    expect(screen.getByText(/Learning objectives/i)).toBeInTheDocument();
    expect(screen.getByText(/In real repertoire/i)).toBeInTheDocument();
    expect(screen.getByText(/Worked example/i)).toBeInTheDocument();

    const playBtn = screen.getByRole("button", { name: /Hear rising open tones/i });
    fireEvent.click(playBtn);
    expect(mockPlayPhrase).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Timbre" }));
    expect(screen.getByText("Correct.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Mark lesson as completed/i }));
    await waitFor(() => {
      expect(onToggleCompleted).toHaveBeenCalledWith(true, 100);
    });
    expect(
      screen.getByText(/Lesson progress syncing requires published database records\./i),
    ).toBeInTheDocument();
  });
});
