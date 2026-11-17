import { createFileRoute } from "@tanstack/react-router";

import { TextPage } from "@/components/layout/TextPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — THEORYLAB" },
      { name: "description", content: "How to reach the THEORYLAB team." },
      { property: "og:title", content: "Contact — THEORYLAB" },
      { property: "og:description", content: "How to reach the THEORYLAB team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <TextPage
      title="Contact"
      intro="THEORYLAB is in development. A contact address for students, lecturers and institutions will be published here at launch."
    >
      <section>
        <h2>Lecturers and institutions</h2>
        <p>
          If you teach music theory and would like to shape the lecturer tools, this page will list how to get in
          touch once enquiries open.
        </p>
      </section>
    </TextPage>
  ),
});
