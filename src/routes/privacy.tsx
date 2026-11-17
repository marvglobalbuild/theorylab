import { createFileRoute } from "@tanstack/react-router";

import { TextPage } from "@/components/layout/TextPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — THEORYLAB" },
      { name: "description", content: "How the THEORYLAB preview handles your information." },
      { property: "og:title", content: "Privacy policy — THEORYLAB" },
      { property: "og:description", content: "How the THEORYLAB preview handles your information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <TextPage
      title="Privacy policy"
      intro="A full privacy policy will be published before accounts launch. This note describes the preview as it stands."
    >
      <section>
        <h2>What the preview collects</h2>
        <p>
          The preview has no accounts and stores nothing you enter. Choices on the learning preview and anything
          typed into the sign-in form stay in your browser and are discarded when you leave the page.
        </p>
      </section>
      <section>
        <h2>Third-party resources</h2>
        <p>
          Fonts are loaded from Google Fonts. When you first play the piano, piano recordings are downloaded from
          the Tone.js sample library. These services receive standard request information such as your IP address.
        </p>
      </section>
    </TextPage>
  ),
});
