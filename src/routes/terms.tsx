import { createFileRoute } from "@tanstack/react-router";

import { TextPage } from "@/components/layout/TextPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of use — THEORYLAB" },
      { name: "description", content: "Terms for using the THEORYLAB preview." },
      { property: "og:title", content: "Terms of use — THEORYLAB" },
      { property: "og:description", content: "Terms for using the THEORYLAB preview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <TextPage
      title="Terms of use"
      intro="Full terms of use will be published before accounts launch. Until then, the following applies to the preview."
    >
      <section>
        <h2>Using the preview</h2>
        <p>
          The interactive demonstrations are offered free for personal study and teaching. Features described as
          in development are not yet available and may change before release.
        </p>
      </section>
    </TextPage>
  ),
});
