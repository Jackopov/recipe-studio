/**
 * Recipe Studio — a static, single-file frontend. No framework, no backend:
 * the router maps the URL onto a view, and every view reads and writes the
 * collection through the localStorage store.
 */

import { startRouter } from "./router.js";
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
  const { pathname } = window.location;
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

startRouter(render);
render();
