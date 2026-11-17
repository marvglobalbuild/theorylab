<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Frontend only: no backend, database or auth is connected. UI talks to `src/services` contracts; preview implementations return "unavailable" and never fake success — swap implementations in `src/services/index.ts` when a backend arrives.
- Music logic stays pure in `src/lib/music/theory.ts` (unit-tested in `src/test/music-theory.test.ts`); audio and notation live in separate browser-only modules.
- Tone.js and VexFlow are dynamically imported in the browser only (Tone on the first user gesture, to satisfy autoplay rules and keep SSR clean).
- Custom type-scale utilities are named `type-*` (not `text-*`) so `cn()`/tailwind-merge doesn't strip them when combined with text colour classes.
- Landing sections are reached via hash links (`SectionLink`) on `/`, as the brief requires one scrolling landing page; secondary pages are separate routes.
