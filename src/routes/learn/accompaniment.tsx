import { createFileRoute } from "@tanstack/react-router";

import { AccompanimentStudio } from "@/components/studio/AccompanimentStudio";

export const Route = createFileRoute("/learn/accompaniment")({
  head: () => ({
    meta: [
      { title: "AI Accompaniment & Arrangement Studio — SONORA" },
      {
        name: "description",
        content:
          "Upload or record vocals, inspect musical analysis, arrange multi-sampled accompaniment, and export loudness-mastered studio audio.",
      },
    ],
  }),
  component: LearnerAccompanimentStudioPage,
});

function LearnerAccompanimentStudioPage() {
  return <AccompanimentStudio />;
}
