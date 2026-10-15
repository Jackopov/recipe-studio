/** Two-line 404 — the studio has wandered off the edge of the map. */

import { pageShell } from "../ui.js";

export function renderNotFound(root, { nav = "" } = {}) {
  root.innerHTML = pageShell({
    nav,
    main: `
      <section class="not-found">
        <p class="eyebrow">Not in the collection</p>
        <h1 class="page-title">404 — Page not found.</h1>
        <p class="lede">
          This page was never in the studio, or the link is slightly off.
        </p>
        <p class="actions">
          <a class="btn btn--primary" href="/">Back to today's special</a>
          <a class="nav-link" href="/recipes">The database →</a>
        </p>
      </section>`,
  });
}
