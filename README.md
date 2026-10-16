# Recipe Studio

An editorial recipe notebook that lives entirely in your browser. Plain
HTML, CSS and JavaScript — no framework, no build-time templating, no
backend calls. The three starter recipes ship as static data; every edit
after that is stored on the device (localStorage), so the app works offline
and keeps its collection private.

## Routes

The history-API router in `src/router.js` maps real URLs onto views:

| Path                  | View                   | What it shows                           |
| --------------------- | ---------------------- | --------------------------------------- |
| `/`                   | `views/home.js`        | Today's special, collection, manifesto  |
| `/recipes`            | `views/recipes.js`     | The database — category chips + sorting |
| `/recipes/new`        | `views/form.js` (new)  | Add-a-recipe form                       |
| `/recipes/:slug`      | `views/recipe.js`      | Full recipe spread with star rating     |
| `/recipes/:slug/edit` | `views/form.js` (edit) | Edit form, pre-filled                   |
| anything else         | `views/notfound.js`    | 404                                     |

## Structure

```
index.html            entry — loads ./src/styles.css and ./src/app.js
404.html              static-host fallback: parks deep routes, reloads the app root
src/
  app.js              boot: routes the URL onto a view, per-route nav/title
  base.js             deploy base — where the app is published (root or sub-path)
  router.js           tiny history router (clicks, back/forward, preview frame)
  ui.js               shared markup: masthead, frames, labels, cards, toasts
  store.js            the collection — localStorage CRUD + seed on first run
  styles.css          the whole stylesheet (tokens, frames, chips, forms…)
  data/recipes.js     seed recipes (exported from the original Convex data)
  lib/photo.js        downscales uploaded photos into localStorage-friendly data URLs
  views/              one module per screen (see table above)
public/               logo, PWA icons, manifest
tests/                form interaction tests (happy-dom)
src/convex/           optional Convex backend kept intact but unused by the UI
```

## Publishing

Nothing is bound to the server root, so the same files work at a domain root
and under a sub-path (a GitHub Pages project site, for instance):

- `src/base.js` derives the base from where the app's own modules were loaded
  (`/src/base.js` → `/`, `/recipe-studio/src/base.js` → `/recipe-studio/`);
  every link and history update goes through `appUrl()`, and the router
  matches routes on `routePath()` with the base stripped.
- `index.html` requests its assets relative to wherever the page was
  published, walking one directory up and finally trying the server root if a
  URL misses.
- `404.html` covers static hosts without rewrites: it records the deep route,
  finds the directory that actually contains the app, reloads from there and
  the app restores the route from `sessionStorage` on boot.
- The icon and manifest links are resolved at runtime by probing the site
  root and `public/` (the dev server maps `public/` to the root, a raw
  published copy keeps the folder name), and the manifest itself uses
  relative URLs, so neither layout logs a 404.

## Data model

A recipe record (see `src/store.js`) looks like:

```js
{
  id, slug, title, category,      // breakfast | lunch | snack | soup | dessert
  note, intro,                    // italic kicker, editorial paragraph
  photo: { src, alt, focus, resize },
  prep, cook, serves,             // free-text; "—" when absent
  ingredients: [string],              // one flat list — no sections/groups
  steps: [string],
  tips: [string] | undefined,
  rating,                         // 1–5 or null
  createdAt,                      // timestamp
}
```

The store persists to `localStorage` under
`recipe-studio:collection:v1`. The first load copies the seed collection in;
afterwards the stored list wins. Saves from older versions that still stored
ingredients as groups (`{ section?, items: [...] }`) are flattened on read. Uploaded photos are downscaled
(`lib/photo.js`) and embedded as data URLs, so nothing ever leaves the
device. The slug is generated once from the title and never changes, which
keeps links stable.

## Today's special

`todaysRecipe()` in `src/data/recipes.js` hashes the calendar date and picks
a recipe from the collection — deterministic for the whole day, rotating at
midnight.

## Scripts

```bash
bun run dev        # Vite dev server
bun run build      # tsc -b (typechecks the Convex functions) + vite build
bun run lint       # eslint
bun run test       # form interaction tests (happy-dom): add/remove rows, save
bun run format     # prettier --write .
```

The static frontend is plain `.js` — there is no frontend typecheck; `tsc`
only covers `src/convex/`.

## Photography

Starter photos are served from Unsplash's CDN and sized per context via
`resolvePhoto()`. User-added photos are stored locally as data URLs.
