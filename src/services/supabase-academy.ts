import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ACADEMY_COURSES,
  ACADEMY_LEARNING_PATHS,
  ACADEMY_LESSONS,
  ACADEMY_MODULES,
  getCanonicalLessonBySlug,
} from "@/content/academy-curriculum";
import type {
  AcademyLessonContent,
  AcademyLevel,
  AcademyNotationExample,
} from "@/content/academy/types";
import { supabase } from "@/lib/supabase";
import type { PhraseStep } from "@/lib/music/usePiano";

import type {
  AcademyCatalog,
  AcademyCatalogSource,
  AcademyCourse,
  AcademyLearningPath,
  AcademyLesson,
  AcademyLessonProgress,
  AcademyModule,
  AcademyProgressStatus,
  AcademyQueryResult,
  AcademyService,
  ServiceResult,
} from "./contracts";

interface DbLearningPathRow {
  id: string;
  slug: string;
  numeral: string;
  title: string;
  summary: string;
  level: AcademyLevel;
  sort_order: number;
  status: string;
}

interface DbCourseRow {
  id: string;
  learning_path_id: string;
  slug: string;
  title: string;
  description: string;
  level: AcademyLevel;
  sort_order: number;
  estimated_minutes: number | null;
  status: string;
}

interface DbModuleRow {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  summary: string;
  sort_order: number;
  status: string;
}

interface DbLessonRow {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  summary: string;
  content_markdown: string;
  notation_payload: unknown;
  audio_config: unknown;
  estimated_minutes: number;
  sort_order: number;
  status: string;
}

interface DbLessonProgressRow {
  id: string;
  user_id: string;
  lesson_id: string;
  status: AcademyProgressStatus;
  progress_percent: number;
  practice_seconds: number;
  last_score: number | null;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string;
}

const PROGRESS_UNAVAILABLE_MESSAGE =
  "Lesson progress syncing requires a configured Supabase database with published lesson records.";

function mapProgressRow(row: DbLessonProgressRow): AcademyLessonProgress {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    status: row.status,
    progressPercent: Number(row.progress_percent ?? 0),
    practiceSeconds: Number(row.practice_seconds ?? 0),
    lastScore:
      row.last_score !== null && row.last_score !== undefined ? Number(row.last_score) : null,
    startedAt: row.started_at ?? null,
    completedAt: row.completed_at ?? null,
    lastAccessedAt: row.last_accessed_at,
  };
}

function linkLessonSequence(orderedLessons: AcademyLesson[]): AcademyLesson[] {
  return orderedLessons.map((lesson, idx) => {
    const prev = idx > 0 ? orderedLessons[idx - 1]! : null;
    const next = idx < orderedLessons.length - 1 ? orderedLessons[idx + 1]! : null;
    return {
      ...lesson,
      previousLessonSlug: prev?.slug ?? null,
      previousLessonTitle: prev?.title ?? null,
      nextLessonSlug: next?.slug ?? null,
      nextLessonTitle: next?.title ?? null,
    };
  });
}

function pickResumeLesson(
  lessons: AcademyLesson[],
  progressByKey: Record<string, AcademyLessonProgress>,
): AcademyLesson | null {
  if (lessons.length === 0) return null;

  const accessedEntries = lessons
    .map((lesson) => ({
      lesson,
      progress:
        (lesson.dbId ? progressByKey[lesson.dbId] : undefined) ??
        progressByKey[lesson.slug] ??
        null,
    }))
    .filter((entry) => entry.progress !== null)
    .sort((a, b) =>
      (b.progress?.lastAccessedAt ?? "").localeCompare(a.progress?.lastAccessedAt ?? ""),
    );

  const mostRecentInProgress = accessedEntries.find((e) => e.progress?.status === "in_progress");
  if (mostRecentInProgress) return mostRecentInProgress.lesson;

  const firstIncomplete = lessons.find((lesson) => {
    const prog =
      (lesson.dbId ? progressByKey[lesson.dbId] : undefined) ?? progressByKey[lesson.slug];
    return prog?.status !== "completed";
  });

  if (firstIncomplete) return firstIncomplete;
  return accessedEntries[0]?.lesson ?? lessons[0] ?? null;
}

export function buildCanonicalAcademyCatalog(
  source: Exclude<AcademyCatalogSource, "supabase">,
  statusNotice: string,
): AcademyCatalog {
  const orderedLessons: AcademyLesson[] = [];

  const paths: AcademyLearningPath[] = [...ACADEMY_LEARNING_PATHS]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((pathDef) => {
      const pathCourses = [...ACADEMY_COURSES]
        .filter((c) => c.learningPathSlug === pathDef.slug)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((courseDef): AcademyCourse => {
          const courseModules = [...ACADEMY_MODULES]
            .filter((m) => m.courseSlug === courseDef.slug)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((modDef): AcademyModule => {
              const modLessons = [...ACADEMY_LESSONS]
                .filter((l) => l.moduleSlug === modDef.slug && l.courseSlug === courseDef.slug)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((lessonContent): AcademyLesson => {
                  const built: AcademyLesson = {
                    ...lessonContent,
                    dbId: null,
                    pathTitle: pathDef.title,
                    pathNumeral: pathDef.numeral,
                    courseTitle: courseDef.title,
                    moduleTitle: modDef.title,
                    previousLessonSlug: null,
                    previousLessonTitle: null,
                    nextLessonSlug: null,
                    nextLessonTitle: null,
                  };
                  orderedLessons.push(built);
                  return built;
                });

              return {
                id: modDef.slug,
                dbId: null,
                slug: modDef.slug,
                courseSlug: courseDef.slug,
                learningPathSlug: pathDef.slug,
                title: modDef.title,
                summary: modDef.summary,
                sortOrder: modDef.sortOrder,
                lessons: modLessons,
              };
            });

          const lessonCount = courseModules.reduce((sum, m) => sum + m.lessons.length, 0);
          return {
            id: courseDef.slug,
            dbId: null,
            slug: courseDef.slug,
            learningPathSlug: pathDef.slug,
            learningPathTitle: pathDef.title,
            learningPathNumeral: pathDef.numeral,
            title: courseDef.title,
            description: courseDef.description,
            level: courseDef.level,
            sortOrder: courseDef.sortOrder,
            estimatedMinutes: courseDef.estimatedMinutes,
            modules: courseModules,
            lessonCount,
          };
        });

      const lessonCount = pathCourses.reduce((sum, c) => sum + c.lessonCount, 0);
      const totalEstimatedMinutes = pathCourses.reduce((sum, c) => sum + c.estimatedMinutes, 0);

      return {
        id: pathDef.slug,
        dbId: null,
        slug: pathDef.slug,
        numeral: pathDef.numeral,
        title: pathDef.title,
        summary: pathDef.summary,
        level: pathDef.level,
        sortOrder: pathDef.sortOrder,
        courses: pathCourses,
        lessonCount,
        totalEstimatedMinutes,
      };
    });

  const linked = linkLessonSequence(orderedLessons);
  const linkedMap = new Map(linked.map((l) => [l.slug, l]));
  paths.forEach((p) =>
    p.courses.forEach((c) =>
      c.modules.forEach((m) => {
        m.lessons = m.lessons.map((l) => linkedMap.get(l.slug) ?? l);
      }),
    ),
  );

  return {
    source,
    persistenceAvailable: false,
    statusNotice,
    paths,
    courses: paths.flatMap((p) => p.courses),
    lessons: linked,
    progressByLessonKey: {},
    resumeLesson: linked[0] ?? null,
  };
}

function parseDbNotation(payload: unknown): AcademyNotationExample | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const candidate = payload as Record<string, unknown>;
  const chords = candidate["chords"];
  if (!Array.isArray(chords)) return undefined;
  const rawClef = candidate["clef"];
  const keySignature = candidate["keySignature"];
  const timeSignature = candidate["timeSignature"];
  const label = candidate["label"];
  const caption = candidate["caption"];
  return {
    clef:
      rawClef === "bass" || rawClef === "alto" || rawClef === "tenor" || rawClef === "treble"
        ? rawClef
        : "treble",
    keySignature: typeof keySignature === "string" ? keySignature : undefined,
    timeSignature: typeof timeSignature === "string" ? timeSignature : undefined,
    chords: chords as AcademyNotationExample["chords"],
    beamNotes: Boolean(candidate["beamNotes"]),
    label: typeof label === "string" ? label : "Musical notation illustration",
    caption: typeof caption === "string" ? caption : "",
  };
}

function parseDbAudio(config: unknown): PhraseStep[] | undefined {
  if (!config || typeof config !== "object") return undefined;
  const candidate = config as Record<string, unknown>;
  const steps = candidate["steps"];
  if (!Array.isArray(steps)) return undefined;
  return steps as PhraseStep[];
}

function hydrateDbLessonContent(
  row: DbLessonRow,
  meta: {
    pathSlug: string;
    courseSlug: string;
    moduleSlug: string;
    level: AcademyLevel;
  },
): AcademyLessonContent {
  const canonical = getCanonicalLessonBySlug(row.slug);
  if (canonical) {
    return {
      ...canonical,
      title: row.title || canonical.title,
      summary: row.summary || canonical.summary,
      estimatedMinutes: row.estimated_minutes || canonical.estimatedMinutes,
      sortOrder: row.sort_order,
    };
  }

  const dbNotation = parseDbNotation(row.notation_payload);
  const dbAudio = parseDbAudio(row.audio_config);
  const paragraphs = row.content_markdown
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary || "Published curriculum lesson.",
    learningPathSlug: meta.pathSlug,
    courseSlug: meta.courseSlug,
    moduleSlug: meta.moduleSlug,
    level: meta.level,
    estimatedMinutes: row.estimated_minutes || 10,
    sortOrder: row.sort_order,
    objectives: [`Understand core concepts presented in ${row.title}.`],
    sections: [
      {
        id: "overview",
        heading: "Lesson commentary",
        body: paragraphs.length > 0 ? paragraphs : [row.summary || row.title],
        notation: dbNotation,
        audioSteps: dbAudio,
        audioLabel: dbAudio ? "Hear lesson audio illustration" : undefined,
      },
    ],
    repertoireExample: {
      composer: "Classical Repertoire Study",
      work: row.title,
      barReference: "Lesson reference",
      insight: row.summary || "Apply this theory concept directly while score-reading.",
    },
    workedExample: {
      title: "Guided concept review",
      scenario: `Apply the core ideas from ${row.title} directly on the musical staff.`,
      steps:
        paragraphs.slice(0, 3).length > 0 ? paragraphs.slice(0, 3) : [row.summary || row.title],
      conclusion: "Review the engraved staff and audio illustration before continuing.",
    },
    practiceActivities: [],
    summaryText: row.summary || `Completed study notes for ${row.title}.`,
    keyTakeaways: [row.summary || `Mastered core concept: ${row.title}.`],
  };
}

export function createSupabaseAcademyService(
  client: SupabaseClient | null = supabase,
): AcademyService {
  return {
    async getCatalog(userId) {
      if (!client) {
        return {
          status: "ok",
          data: buildCanonicalAcademyCatalog(
            "fallback_unconfigured",
            "Supabase environment variables are not configured in this preview. Studying from the complete Theory Academy syllabus in read-only mode.",
          ),
        };
      }

      try {
        const [pathsRes, coursesRes, modulesRes, lessonsRes] = await Promise.all([
          client
            .from("learning_paths")
            .select("id, slug, numeral, title, summary, level, sort_order, status")
            .eq("status", "published")
            .order("sort_order", { ascending: true }),
          client
            .from("courses")
            .select(
              "id, learning_path_id, slug, title, description, level, sort_order, estimated_minutes, status",
            )
            .eq("status", "published")
            .order("sort_order", { ascending: true }),
          client
            .from("course_modules")
            .select("id, course_id, slug, title, summary, sort_order, status")
            .eq("status", "published")
            .order("sort_order", { ascending: true }),
          client
            .from("lessons")
            .select(
              "id, module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status",
            )
            .eq("status", "published")
            .order("sort_order", { ascending: true }),
        ]);

        const firstError =
          pathsRes.error || coursesRes.error || modulesRes.error || lessonsRes.error;
        if (firstError) {
          return {
            status: "error",
            message: `Could not load published Theory Academy curriculum: ${firstError.message}`,
          };
        }

        const dbPaths = ((pathsRes.data ?? []) as DbLearningPathRow[]).filter(
          (row) => row.status === "published",
        );
        const publishedPathIds = new Set(dbPaths.map((p) => p.id));

        const dbCourses = ((coursesRes.data ?? []) as DbCourseRow[]).filter(
          (row) => row.status === "published" && publishedPathIds.has(row.learning_path_id),
        );
        const publishedCourseIds = new Set(dbCourses.map((c) => c.id));

        const dbModules = ((modulesRes.data ?? []) as DbModuleRow[]).filter(
          (row) => row.status === "published" && publishedCourseIds.has(row.course_id),
        );
        const publishedModuleIds = new Set(dbModules.map((m) => m.id));

        const dbLessons = ((lessonsRes.data ?? []) as DbLessonRow[]).filter(
          (row) => row.status === "published" && publishedModuleIds.has(row.module_id),
        );

        if (dbPaths.length === 0 || dbCourses.length === 0 || dbLessons.length === 0) {
          return {
            status: "ok",
            data: buildCanonicalAcademyCatalog(
              "fallback_empty_db",
              "Connected to Supabase, but no published curriculum records exist in the database yet. Displaying the canonical Theory Academy syllabus in read-only mode until curriculum records are seeded.",
            ),
          };
        }

        const progressByLessonKey: Record<string, AcademyLessonProgress> = {};
        if (userId) {
          const progressRes = await client
            .from("lesson_progress")
            .select(
              "id, user_id, lesson_id, status, progress_percent, practice_seconds, last_score, started_at, completed_at, last_accessed_at",
            )
            .eq("user_id", userId);

          if (!progressRes.error && progressRes.data) {
            (progressRes.data as DbLessonProgressRow[]).forEach((row) => {
              const mapped = mapProgressRow(row);
              progressByLessonKey[mapped.lessonId] = mapped;
            });
          }
        }

        const flatOrdered: AcademyLesson[] = [];

        const paths: AcademyLearningPath[] = dbPaths
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((pRow) => {
            const pathCourses = dbCourses
              .filter((c) => c.learning_path_id === pRow.id)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((cRow): AcademyCourse => {
                const courseModules = dbModules
                  .filter((m) => m.course_id === cRow.id)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((mRow): AcademyModule => {
                    const modLessons = dbLessons
                      .filter((l) => l.module_id === mRow.id)
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((lRow): AcademyLesson => {
                        const content = hydrateDbLessonContent(lRow, {
                          pathSlug: pRow.slug,
                          courseSlug: cRow.slug,
                          moduleSlug: mRow.slug,
                          level: cRow.level,
                        });
                        const lesson: AcademyLesson = {
                          ...content,
                          dbId: lRow.id,
                          pathTitle: pRow.title,
                          pathNumeral: pRow.numeral,
                          courseTitle: cRow.title,
                          moduleTitle: mRow.title,
                          previousLessonSlug: null,
                          previousLessonTitle: null,
                          nextLessonSlug: null,
                          nextLessonTitle: null,
                        };
                        if (progressByLessonKey[lRow.id]) {
                          progressByLessonKey[lRow.slug] = progressByLessonKey[lRow.id]!;
                        }
                        flatOrdered.push(lesson);
                        return lesson;
                      });

                    return {
                      id: mRow.id,
                      dbId: mRow.id,
                      slug: mRow.slug,
                      courseSlug: cRow.slug,
                      learningPathSlug: pRow.slug,
                      title: mRow.title,
                      summary: mRow.summary,
                      sortOrder: mRow.sort_order,
                      lessons: modLessons,
                    };
                  });

                const lessonCount = courseModules.reduce((sum, m) => sum + m.lessons.length, 0);
                const estimatedMinutes =
                  cRow.estimated_minutes ??
                  courseModules.reduce(
                    (sum, m) => sum + m.lessons.reduce((ls, l) => ls + l.estimatedMinutes, 0),
                    0,
                  );

                return {
                  id: cRow.id,
                  dbId: cRow.id,
                  slug: cRow.slug,
                  learningPathSlug: pRow.slug,
                  learningPathTitle: pRow.title,
                  learningPathNumeral: pRow.numeral,
                  title: cRow.title,
                  description: cRow.description,
                  level: cRow.level,
                  sortOrder: cRow.sort_order,
                  estimatedMinutes,
                  modules: courseModules,
                  lessonCount,
                };
              });

            const lessonCount = pathCourses.reduce((sum, c) => sum + c.lessonCount, 0);
            const totalEstimatedMinutes = pathCourses.reduce(
              (sum, c) => sum + c.estimatedMinutes,
              0,
            );

            return {
              id: pRow.id,
              dbId: pRow.id,
              slug: pRow.slug,
              numeral: pRow.numeral,
              title: pRow.title,
              summary: pRow.summary,
              level: pRow.level,
              sortOrder: pRow.sort_order,
              courses: pathCourses,
              lessonCount,
              totalEstimatedMinutes,
            };
          });

        const linked = linkLessonSequence(flatOrdered);
        const linkedMap = new Map(linked.map((l) => [l.slug, l]));
        paths.forEach((p) =>
          p.courses.forEach((c) =>
            c.modules.forEach((m) => {
              m.lessons = m.lessons.map((l) => linkedMap.get(l.slug) ?? l);
            }),
          ),
        );

        const nonEmptyPaths = paths.filter((p) => p.lessonCount > 0);
        const courses = nonEmptyPaths.flatMap((p) => p.courses).filter((c) => c.lessonCount > 0);

        return {
          status: "ok",
          data: {
            source: "supabase",
            persistenceAvailable: true,
            statusNotice: null,
            paths: nonEmptyPaths,
            courses,
            lessons: linked,
            progressByLessonKey,
            resumeLesson: pickResumeLesson(linked, progressByLessonKey),
          },
        };
      } catch (err) {
        return {
          status: "error",
          message:
            err instanceof Error
              ? err.message
              : "Unexpected error while loading Theory Academy curriculum.",
        };
      }
    },

    async recordLessonVisit({
      userId,
      lesson,
      existingProgress,
    }): Promise<ServiceResult<AcademyLessonProgress>> {
      if (!client || !userId || !lesson.dbId) {
        return { status: "unavailable", message: PROGRESS_UNAVAILABLE_MESSAGE };
      }

      const now = new Date().toISOString();
      const alreadyCompleted = existingProgress?.status === "completed";

      try {
        const payload = {
          user_id: userId,
          lesson_id: lesson.dbId,
          status: (alreadyCompleted ? "completed" : "in_progress") as AcademyProgressStatus,
          progress_percent: alreadyCompleted
            ? 100
            : Math.max(existingProgress?.progressPercent ?? 0, 25),
          started_at: existingProgress?.startedAt ?? now,
          completed_at: alreadyCompleted ? (existingProgress?.completedAt ?? now) : null,
          last_accessed_at: now,
        };

        const { data, error } = await client
          .from("lesson_progress")
          .upsert(payload, { onConflict: "user_id,lesson_id" })
          .select(
            "id, user_id, lesson_id, status, progress_percent, practice_seconds, last_score, started_at, completed_at, last_accessed_at",
          )
          .single();

        if (error || !data) {
          return {
            status: "unavailable",
            message: error?.message ?? "Could not record lesson visit in Supabase.",
          };
        }

        return { status: "ok", data: mapProgressRow(data as DbLessonProgressRow) };
      } catch (err) {
        return {
          status: "unavailable",
          message: err instanceof Error ? err.message : "Could not record lesson visit.",
        };
      }
    },

    async markLessonCompleted({
      userId,
      lesson,
      completed,
      score,
      existingProgress,
    }): Promise<ServiceResult<AcademyLessonProgress>> {
      if (!client || !userId || !lesson.dbId) {
        return { status: "unavailable", message: PROGRESS_UNAVAILABLE_MESSAGE };
      }

      const now = new Date().toISOString();

      try {
        const payload = {
          user_id: userId,
          lesson_id: lesson.dbId,
          status: (completed ? "completed" : "in_progress") as AcademyProgressStatus,
          progress_percent: completed ? 100 : 50,
          started_at: existingProgress?.startedAt ?? now,
          completed_at: completed ? now : null,
          last_score: score !== undefined ? score : (existingProgress?.lastScore ?? null),
          last_accessed_at: now,
        };

        const { data, error } = await client
          .from("lesson_progress")
          .upsert(payload, { onConflict: "user_id,lesson_id" })
          .select(
            "id, user_id, lesson_id, status, progress_percent, practice_seconds, last_score, started_at, completed_at, last_accessed_at",
          )
          .single();

        if (error || !data) {
          return {
            status: "unavailable",
            message: error?.message ?? "Could not save lesson completion state.",
          };
        }

        return { status: "ok", data: mapProgressRow(data as DbLessonProgressRow) };
      } catch (err) {
        return {
          status: "unavailable",
          message: err instanceof Error ? err.message : "Could not save lesson completion state.",
        };
      }
    },
  };
}

export const supabaseAcademyService = createSupabaseAcademyService();
