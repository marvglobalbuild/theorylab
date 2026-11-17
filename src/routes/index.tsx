import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Experience } from "@/components/sections/Experience";
import { Features } from "@/components/sections/Features";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { LearningIntro } from "@/components/sections/LearningIntro";
import { LearningPaths } from "@/components/sections/LearningPaths";
import { Lecturers } from "@/components/sections/Lecturers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "THEORYLAB — Music theory, understood differently" },
      {
        name: "description",
        content:
          "Learn classical music theory through interactive lessons, a playable piano, engraved notation and listening exercises.",
      },
      { property: "og:title", content: "THEORYLAB — Music theory, understood differently" },
      {
        property: "og:description",
        content: "Interactive lessons, a playable piano, real notation and ear training for music students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[70] rounded-sm bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <LearningIntro />
        <Experience />
        <LearningPaths />
        <Features />
        <Lecturers />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
