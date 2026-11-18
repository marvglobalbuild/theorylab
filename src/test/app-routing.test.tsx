import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import {
  assessmentService,
  authService,
  courseService,
  profileService,
  progressService,
  workspaceService,
} from "@/services";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  const createAppRouter = () =>
    createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it.each([
    "/",
    "/start",
    "/terms",
    "/privacy",
    "/contact",
    "/sign-in",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/learn",
    "/learn/paths",
    "/learn/courses",
    "/learn/lessons/understanding-music-and-sound",
    "/learn/practice",
    "/learn/notation",
    "/learn/keyboard",
    "/learn/assessments",
    "/learn/progress",
    "/teach",
    "/teach/classes",
    "/teach/students",
    "/teach/assignments",
    "/teach/assessments",
    "/teach/resources",
    "/teach/performance",
    "/admin",
    "/admin/users",
    "/admin/lecturers",
    "/admin/curriculum",
    "/admin/lessons",
    "/admin/assessments",
    "/admin/analytics",
    "/admin/settings",
  ])("matches route %s instead of falling back to root not-found", (path) => {
    const router = createAppRouter();
    const matches = router.matchRoutes(path);
    const leaf = matches.at(-1);

    expect(leaf).toBeDefined();
    expect(leaf?.routeId).not.toBe(rootRouteId);
    expect(leaf?.status).not.toBe("notFound");
  });

  it("handles unknown routes via root not-found matching", () => {
    const router = createAppRouter();
    const matches = router.matchRoutes("/non-existent-section");
    const last = matches.at(-1);

    expect(last?.routeId).toBe(rootRouteId);
  });
});

describe("Service boundaries when Supabase env is not supplied", () => {
  it("reports Supabase auth & profile calls as unconfigured cleanly without throwing", async () => {
    const session = await authService.getSession();
    expect(session.status).toBe("unavailable");

    const signInRes = await authService.signIn({
      email: "user@example.edu",
      password: "password123",
    });
    expect(signInRes.status).toBe("unavailable");

    const signUpRes = await authService.signUp({
      email: "user@example.edu",
      password: "password123",
      name: "Clara Bennett",
    });
    expect(signUpRes.status).toBe("unavailable");

    const resetRes = await authService.requestPasswordReset("user@example.edu");
    expect(resetRes.status).toBe("unavailable");

    const updatePwRes = await authService.updatePassword("new-password-123");
    expect(updatePwRes.status).toBe("unavailable");

    const verifyRes = await authService.verifyEmail("token-123");
    expect(verifyRes.status).toBe("unavailable");

    expect((await profileService.getProfile("u-1")).status).toBe("unavailable");
  });

  it("keeps progress and assessment persistence unavailable while serving demonstration snapshots", async () => {
    expect((await progressService.getProgress("u-1")).status).toBe("unavailable");
    expect((await assessmentService.getAssessment("beginner")).status).toBe("unavailable");

    const levels = await courseService.listLevels();
    expect(levels.status).toBe("ok");
    if (levels.status === "ok") {
      expect(levels.data).toHaveLength(4);
    }

    const learner = await workspaceService.getLearnerSnapshot();
    const lecturer = await workspaceService.getLecturerSnapshot();
    const admin = await workspaceService.getAdminSnapshot();
    expect(learner.status).toBe("ok");
    expect(lecturer.status).toBe("ok");
    expect(admin.status).toBe("ok");
    if (learner.status === "ok") expect(learner.data.isDemonstration).toBe(true);
    if (lecturer.status === "ok") expect(lecturer.data.isDemonstration).toBe(true);
    if (admin.status === "ok") expect(admin.data.isDemonstration).toBe(true);
  });
});
