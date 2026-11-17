# THEORYLAB

**Understand Music. Read Music. Hear Music. Create Music.**

THEORYLAB is an interactive classical music theory education platform for independent learners, students, lecturers, and administrators — built with React, TypeScript, Vite, TanStack Start/Router, Tailwind CSS, Tone.js, VexFlow, and Supabase.

## Documentation

Official product, architecture, and roadmap specifications live under `/docs`:

- [Master Product Requirements (`docs/PRODUCT_REQUIREMENTS.md`)](./docs/PRODUCT_REQUIREMENTS.md) — Core educational positioning, user roles, preserved workspaces, and future Music Intelligence Studio requirements.
- [Module & Navigation Architecture (`docs/MODULE_AND_NAVIGATION_ARCHITECTURE.md`)](./docs/MODULE_AND_NAVIGATION_ARCHITECTURE.md) — Route map, role boundaries, workspace navigation, and planned Music Intelligence Studio flows.
- [System & Technical Architecture (`docs/SYSTEM_ARCHITECTURE.md`)](./docs/SYSTEM_ARCHITECTURE.md) — Frontend stack, Supabase Auth/PostgreSQL/RLS design, dedicated audio processing worker architecture, security rules, and AI provider evaluation criteria.
- [Official Development Roadmap (`docs/ROADMAP.md`)](./docs/ROADMAP.md) — 11-phase roadmap from Application Foundation and Authentication through Curriculum, Workspaces, and Music Intelligence Studio.

## Local Development

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and supply your Supabase project's public `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` before testing live authentication.
