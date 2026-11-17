import {
  PATH_1_COURSES,
  PATH_1_FOUNDATIONS,
  PATH_1_LESSONS,
  PATH_1_MODULES,
} from "./academy/path-1-foundations";
import {
  PATH_2_COURSES,
  PATH_2_LESSONS,
  PATH_2_MODULES,
  PATH_2_SCALES,
} from "./academy/path-2-scales";
import {
  PATH_3_COURSES,
  PATH_3_HARMONY,
  PATH_3_LESSONS,
  PATH_3_MODULES,
} from "./academy/path-3-harmony";
import {
  PATH_4_COURSES,
  PATH_4_LESSONS,
  PATH_4_MODULES,
  PATH_4_RHYTHM,
} from "./academy/path-4-rhythm";
import type {
  AcademyCourseDefinition,
  AcademyLessonContent,
  AcademyModuleDefinition,
  AcademyPathDefinition,
} from "./academy/types";

export type * from "./academy/types";

export const ACADEMY_LEARNING_PATHS: AcademyPathDefinition[] = [
  PATH_1_FOUNDATIONS,
  PATH_2_SCALES,
  PATH_3_HARMONY,
  PATH_4_RHYTHM,
];

export const ACADEMY_COURSES: AcademyCourseDefinition[] = [
  ...PATH_1_COURSES,
  ...PATH_2_COURSES,
  ...PATH_3_COURSES,
  ...PATH_4_COURSES,
];

export const ACADEMY_MODULES: AcademyModuleDefinition[] = [
  ...PATH_1_MODULES,
  ...PATH_2_MODULES,
  ...PATH_3_MODULES,
  ...PATH_4_MODULES,
];

export const ACADEMY_LESSONS: AcademyLessonContent[] = [
  ...PATH_1_LESSONS,
  ...PATH_2_LESSONS,
  ...PATH_3_LESSONS,
  ...PATH_4_LESSONS,
];

const LESSON_BY_SLUG = new Map<string, AcademyLessonContent>(
  ACADEMY_LESSONS.map((lesson) => [lesson.slug, lesson]),
);

export function getCanonicalLessonBySlug(slug: string): AcademyLessonContent | null {
  return LESSON_BY_SLUG.get(slug) ?? null;
}

export function getCanonicalPathBySlug(slug: string): AcademyPathDefinition | null {
  return ACADEMY_LEARNING_PATHS.find((p) => p.slug === slug) ?? null;
}

export function getCanonicalCourseBySlug(slug: string): AcademyCourseDefinition | null {
  return ACADEMY_COURSES.find((c) => c.slug === slug) ?? null;
}

export function formatAcademyLevel(level: AcademyPathDefinition["level"]): string {
  switch (level) {
    case "beginner":
      return "Beginner";
    case "elementary":
      return "Elementary";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
  }
}
