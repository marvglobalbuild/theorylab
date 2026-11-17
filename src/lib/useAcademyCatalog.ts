import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { useAuth } from "@/lib/auth-context";
import {
  academyService,
  type AcademyCatalog,
  type AcademyLesson,
  type AcademyLessonProgress,
  type ServiceResult,
} from "@/services";

export function useAcademyCatalog() {
  const { session } = useAuth();
  const userId = session?.userId ?? null;
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["academy-catalog", userId ?? "anon"] as const, [userId]);

  const query = useQuery<AcademyCatalog, Error>({
    queryKey,
    queryFn: async () => {
      const result = await academyService.getCatalog(userId);
      if (result.status === "error") {
        throw new Error(result.message);
      }
      return result.data;
    },
    staleTime: 60_000,
  });

  const catalog = query.data ?? null;

  const getLessonProgress = useCallback(
    (lesson: Pick<AcademyLesson, "dbId" | "slug">): AcademyLessonProgress | null => {
      if (!catalog) return null;
      return (
        (lesson.dbId ? catalog.progressByLessonKey[lesson.dbId] : undefined) ??
        catalog.progressByLessonKey[lesson.slug] ??
        null
      );
    },
    [catalog],
  );

  const patchProgressCache = useCallback(
    (lesson: Pick<AcademyLesson, "dbId" | "slug">, progress: AcademyLessonProgress) => {
      queryClient.setQueryData<AcademyCatalog>(queryKey, (prev) => {
        if (!prev) return prev;
        const nextMap = {
          ...prev.progressByLessonKey,
          [progress.lessonId]: progress,
          [lesson.slug]: progress,
        };
        return {
          ...prev,
          progressByLessonKey: nextMap,
        };
      });
    },
    [queryClient, queryKey],
  );

  const recordVisit = useCallback(
    async (
      lesson: Pick<AcademyLesson, "dbId" | "slug">,
    ): Promise<ServiceResult<AcademyLessonProgress>> => {
      const existingProgress = getLessonProgress(lesson);
      const res = await academyService.recordLessonVisit({
        userId,
        lesson,
        existingProgress,
      });
      if (res.status === "ok") {
        patchProgressCache(lesson, res.data);
      }
      return res;
    },
    [getLessonProgress, patchProgressCache, userId],
  );

  const setCompleted = useCallback(
    async (
      lesson: Pick<AcademyLesson, "dbId" | "slug">,
      completed: boolean,
      score?: number | null,
    ): Promise<ServiceResult<AcademyLessonProgress>> => {
      const existingProgress = getLessonProgress(lesson);
      const res = await academyService.markLessonCompleted({
        userId,
        lesson,
        completed,
        score,
        existingProgress,
      });
      if (res.status === "ok") {
        patchProgressCache(lesson, res.data);
      }
      return res;
    },
    [getLessonProgress, patchProgressCache, userId],
  );

  return {
    catalog,
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
    refetch: query.refetch,
    getLessonProgress,
    recordVisit,
    setCompleted,
  };
}
