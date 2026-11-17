/** Landing page anchors. Each hash matches a section id on the home page. */
export const SECTION_IDS = {
  top: "top",
  about: "about",
  experience: "experience",
  learningPaths: "learning-paths",
  features: "features",
  howItWorks: "how-it-works",
  lecturers: "lecturers",
} as const;

export const NAV_LINKS = [
  { label: "Home", hash: SECTION_IDS.top },
  { label: "Learning paths", hash: SECTION_IDS.learningPaths },
  { label: "How it works", hash: SECTION_IDS.howItWorks },
  { label: "For lecturers", hash: SECTION_IDS.lecturers },
  { label: "About", hash: SECTION_IDS.about },
] as const;

export const BRAND = {
  name: "THEORYLAB",
  tagline: "Understand Music. Read Music. Hear Music. Create Music.",
  description:
    "An interactive learning environment that makes classical music theory easier to understand, practise and master.",
};
