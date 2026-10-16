/** The database: filterable chips plus a sort control over the card grid. */

import { listRecipes } from "../store.js";
import { categoryLabel, RECIPE_CATEGORIES } from "../data/recipes.js";
import { pageShell, recipeCard, sectionLabel } from "../ui.js";
import { appUrl } from "../base.js";

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "az", label: "A–Z" },
  { key: "rating", label: "Top rated" },
];

function sortRecipes(recipes, sortKey) {
  const sorted = [...recipes];
  if (sortKey === "oldest") {
    sorted.sort((a, b) => a.createdAt - b.createdAt);
  } else if (sortKey === "az") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortKey === "rating") {
    sorted.sort(
      (a, b) =>
        (b.rating ?? 0) - (a.rating ?? 0) || a.title.localeCompare(b.title),
    );
  } else {
    sorted.sort((a, b) => b.createdAt - a.createdAt);
  }
  return sorted;
}

export function renderRecipes(
  root,
  { nav = "", params = new URLSearchParams() } = {},
) {
  const activeCategory = params.get("category") ?? "all";
  const sort = params.get("sort") ?? "newest";

  const all = listRecipes();
  const filtered = all.filter(
    (recipe) => activeCategory === "all" || recipe.category === activeCategory,
  );
  const recipes = sortRecipes(filtered, sort);

  const chips = [
    { key: "all", label: "All" },
    ...RECIPE_CATEGORIES.map((category) => ({
      key: category.id,
      label: category.label,
    })),
  ]
    .map((chip) => {
      const next = new URLSearchParams(params);
      if (chip.key === "all") next.delete("category");
      else next.set("category", chip.key);
      const pressed = chip.key === activeCategory ? "true" : "false";
      return `<button type="button" class="chip" data-category="${chip.key}" aria-pressed="${pressed}">${chip.label}</button>`;
    })
    .join("");

  const sortButtons = SORTS.map((option) => {
    const next = new URLSearchParams(params);
    if (option.key === "newest") next.delete("sort");
    else next.set("sort", option.key);
    const pressed = option.key === sort ? "true" : "false";
    return `<button type="button" class="chip chip--sort" data-sort="${option.key}" aria-pressed="${pressed}">${option.label}</button>`;
  }).join("");

  const grid = recipes.length
    ? `<div class="card-grid">${recipes.map((recipe) => recipeCard(recipe)).join("")}</div>`
    : `<p class="lede">No recipes in this category yet — add the first one.</p>`;

  root.innerHTML = pageShell({
    nav,
    wide: true,
    main: `
      <section class="database">
        <p class="eyebrow">The database</p>
        <h1 class="page-title">Every recipe, one glance.</h1>
        <p class="lede">
          ${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"} in the
          ${activeCategory === "all" ? "full collection" : categoryLabel(activeCategory).toLowerCase()} —
          filtered and sorted on this device.
        </p>

        <div class="section">
          ${sectionLabel("Categories")}
          <div class="chips" role="group" aria-label="Filter by category">${chips}</div>
        </div>

        <div class="section">
          ${sectionLabel("Sort")}
          <div class="chips" role="group" aria-label="Sort recipes">${sortButtons}</div>
        </div>

        <div class="section">
          ${sectionLabel("Recipes")}
          ${grid}
        </div>
      </section>`,
  });

  root.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = new URLSearchParams(params);
      const key = button.dataset.category;
      if (key === "all") next.delete("category");
      else next.set("category", key);
      const query = next.toString();
      window.history.pushState(
        {},
        "",
        appUrl(`/recipes${query ? `?${query}` : ""}`),
      );
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  });

  root.querySelectorAll("[data-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = new URLSearchParams(params);
      const key = button.dataset.sort;
      if (key === "newest") next.delete("sort");
      else next.set("sort", key);
      const query = next.toString();
      window.history.pushState(
        {},
        "",
        appUrl(`/recipes${query ? `?${query}` : ""}`),
      );
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  });
}
