import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../styles.css?url", () => ({ default: "/src/styles.css" }));

import { routeTree } from "@/routeTree.gen";

// Polyfill observers missing in jsdom
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof globalThis.IntersectionObserver === "undefined") {
  (globalThis as unknown as Record<string, unknown>)["IntersectionObserver"] = MockObserver;
}
if (typeof globalThis.ResizeObserver === "undefined") {
  (globalThis as unknown as Record<string, unknown>)["ResizeObserver"] = MockObserver;
}

async function testRouteHydration(path: string, clientReducedMotion = false) {
  const errors: string[] = [];
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = args.map((a) => String(a)).join(" ");
    errors.push(msg);
  };

  const origMatchMedia = window.matchMedia;
  const rootRoute = routeTree as unknown as {
    options: { shellComponent?: unknown };
  };
  const origShell = rootRoute.options.shellComponent;
  rootRoute.options.shellComponent = ({ children }: { children: React.ReactNode }) => <>{children}</>;

  let serverHtml = "";
  try {
    // 1. Server render
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    })) as typeof window.matchMedia;

    const serverHistory = createMemoryHistory({ initialEntries: [path] });
    const serverQueryClient = new QueryClient();
    const serverRouter = createRouter({
      routeTree,
      history: serverHistory,
      context: { queryClient: serverQueryClient },
    });
    await serverRouter.load();

    serverHtml = renderToString(<RouterProvider router={serverRouter} />);

    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.appendChild(container);

    // 2. Client hydrate
    window.matchMedia = ((query: string) => ({
      matches: clientReducedMotion && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    })) as typeof window.matchMedia;

    const clientHistory = createMemoryHistory({ initialEntries: [path] });
    const clientQueryClient = new QueryClient();
    const clientRouter = createRouter({
      routeTree,
      history: clientHistory,
      context: { queryClient: clientQueryClient },
    });
    await clientRouter.load();

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <RouterProvider router={clientRouter} />, {
        onRecoverableError(err) {
          errors.push(`RECOVERABLE: ${String(err)}`);
        },
      });
    });

    await act(async () => {
      root?.unmount();
    });
    container.remove();
  } finally {
    rootRoute.options.shellComponent = origShell;
    console.error = origError;
    window.matchMedia = origMatchMedia;
  }

  return {
    serverHtml,
    errors: errors.filter((e) => !e.includes("not configured to support act")),
  };
}

describe("SSR hydration parity", () => {
  it("hydrates / without mismatch (normal motion)", async () => {
    const { serverHtml, errors } = await testRouteHydration("/", false);
    expect(serverHtml).toContain("THEORY");
    expect(errors).toEqual([]);
  });

  it("hydrates / without mismatch (reduced motion)", async () => {
    const { errors } = await testRouteHydration("/", true);
    expect(errors).toEqual([]);
  });

  it("matches live dev server SSR HTML on /", async () => {
    const res = await fetch("http://localhost:3000/");
    const liveHtml = await res.text();
    const bodyMatch = liveHtml.match(/<body[^>]*>([\s\S]*)<\/body>/);
    expect(bodyMatch).toBeTruthy();
    // Strip dev scripts and data-tsd-source to compare DOM structure/attributes
    const liveBody = bodyMatch![1]!
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/\sdata-tsd-source="[^"]*"/g, "")
      .replace(/<!--\$-->/g, "")
      .replace(/<!--\/\$-->/g, "");

    const container = document.createElement("div");
    container.innerHTML = liveBody;
    document.body.appendChild(container);

    const errors: string[] = [];
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args.map((a) => String(a)).join(" "));
    };

    const rootRoute = routeTree as unknown as { options: { shellComponent?: unknown } };
    const origShell = rootRoute.options.shellComponent;
    rootRoute.options.shellComponent = ({ children }: { children: React.ReactNode }) => <>{children}</>;

    try {
      const clientHistory = createMemoryHistory({ initialEntries: ["/"] });
      const clientQueryClient = new QueryClient();
      const clientRouter = createRouter({
        routeTree,
        history: clientHistory,
        context: { queryClient: clientQueryClient },
      });
      await clientRouter.load();

      let root: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => {
        root = hydrateRoot(container, <RouterProvider router={clientRouter} />, {
          onRecoverableError(err) {
            errors.push(`RECOVERABLE: ${String(err)}`);
          },
        });
      });
      await act(async () => {
        root?.unmount();
      });
    } finally {
      rootRoute.options.shellComponent = origShell;
      console.error = origError;
      container.remove();
    }

    const filtered = errors.filter((e) => !e.includes("not configured to support act"));
    expect(filtered).toEqual([]);
  });
});
