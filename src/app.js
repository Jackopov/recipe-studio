/**
 * Recipe Studio — a static, single-file frontend. No framework, no backend:
 * the router maps the URL onto a view, and every view reads and writes the
 * collection through the localStorage store.
 */

import { startRouter } from "./router.js";
import { appUrl, routePath } from "./base.js";
import { navLink } from "./ui.js";
import { renderHome } from "./views/home.js";
import { renderRecipes } from "./views/recipes.js";
import { renderRecipe } from "./views/recipe.js";
import { renderRecipeForm } from "./views/form.js";
import { renderNotFound } from "./views/notfound.js";

const root = document.getElementById("app");

const TITLES = {
  home: "Recipe Studio — Your recipes, beautifully kept",
  database: "The database — Recipe Studio",
  new: "New recipe — Recipe Studio",
  notFound: "404 — Recipe Studio",
};

function navFor(pathname) {
  const links = [
    navLink("/", "Home", pathname === "/"),
    navLink("/recipes", "Database", pathname.startsWith("/recipes")),
  ];
  return links.join("");
}

function render() {
  // The URL without the deploy base, so the same paths work at "/" and
  // under a published sub-path like "/recipe-studio/".
  const pathname = routePath();
  const nav = navFor(pathname);

  if (pathname === "/") {
    document.title = TITLES.home;
    renderHome(root, { nav });
  } else if (pathname === "/recipes") {
    document.title = TITLES.database;
    renderRecipes(root, {
      nav,
      params: new URLSearchParams(window.location.search),
    });
  } else if (pathname === "/recipes/new") {
    document.title = TITLES.new;
    renderRecipeForm(root, { nav, mode: "new" });
  } else {
    const editMatch = pathname.match(/^\/recipes\/([^/]+)\/edit$/);
    const detailMatch = pathname.match(/^\/recipes\/([^/]+)$/);

    if (editMatch) {
      const slug = decodeURIComponent(editMatch[1]);
      document.title = `Edit — ${slug.replace(/-/g, " ")} — Recipe Studio`;
      renderRecipeForm(root, { nav, slug, mode: "edit" });
    } else if (detailMatch) {
      const slug = decodeURIComponent(detailMatch[1]);
      document.title = `${slug.replace(/-/g, " ")} — Recipe Studio`;
      renderRecipe(root, { nav, slug });
    } else {
      document.title = TITLES.notFound;
      renderNotFound(root, { nav });
    }
  }

  window.scrollTo(0, 0);
}

// A photograph that fails to load leaves its frame as a warm placeholder
// instead of the browser's broken-image glyph.
window.addEventListener(
  "error",
  (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement && !target.dataset.fallback) {
      target.dataset.fallback = "1";
      target.removeAttribute("src");
    }
  },
  true,
);

/**
 * Icon and manifest live in public/ — served from the site root by the dev
 * server, but kept under their folder name in a published copy of the repo.
 * Probe both locations so neither layout logs a 404.
 */
async function firstThatExists(candidates) {
  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { method: "HEAD" });
      if (response.ok) return candidate;
    } catch {
      // Network hiccup — try the next location.
    }
  }
  return null;
}

async function loadAppLinks() {
  const iconCandidates = [appUrl("logo.svg"), appUrl("public/logo.svg")];
  const manifestCandidates = [
    appUrl("manifest.webmanifest"),
    appUrl("public/manifest.webmanifest"),
  ];
  const [icon, manifest] = await Promise.all([
    firstThatExists(iconCandidates),
    firstThatExists(manifestCandidates),
  ]);

  const manifestLink = document.createElement("link");
  manifestLink.rel = "manifest";
  manifestLink.href = manifest ?? manifestCandidates[0];
  document.head.appendChild(manifestLink);

  const iconLink = document.createElement("link");
  iconLink.rel = "icon";
  iconLink.type = "image/svg+xml";
  iconLink.href = icon ?? iconCandidates[0];
  document.head.appendChild(iconLink);
}

// A static host answers unknown paths with 404.html, which parks the deep
// route here before reloading the app root (see 404.html).
try {
  const parked = window.sessionStorage.getItem("recipe-studio:route");
  if (parked) {
    window.sessionStorage.removeItem("recipe-studio:route");
    window.history.replaceState({}, "", appUrl(parked));
  }
} catch {
  // Storage unavailable — nothing parked.
}

loadAppLinks();
startRouter(render);
render();
