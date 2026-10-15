/** The landing screen: today's special, the collection and the manifesto. */

import { listRecipes } from "../store.js";
import {
  categoryLabel,
  formatDate,
  resolvePhoto,
  todaysRecipe,
} from "../data/recipes.js";
import {
  escapeHtml,
  framedPhoto,
  pageShell,
  recipeCard,
  sectionLabel,
} from "../ui.js";

const CATEGORIES = [
  { key: "breakfast", label: "Breakfast", href: "/recipes?category=breakfast" },
  { key: "lunch", label: "Lunch", href: "/recipes?category=lunch" },
  { key: "snack", label: "Snack", href: "/recipes?category=snack" },
  { key: "soup", label: "Soup", href: "/recipes?category=soup" },
  { key: "dessert", label: "Dessert", href: "/recipes?category=dessert" },
];

export function renderHome(root, { nav = "" } = {}) {
  const recipes = listRecipes();
  const special = todaysRecipe(recipes);

  const hero = special
    ? `
      <section class="hero">
        <p class="kicker-row">
          <span class="eyebrow">The special today</span>
          <span class="kicker-row__rule"></span>
          <span class="kicker-row__date">${formatDate()}</span>
        </p>
        <h1 class="hero-title">${special.title}</h1>
        ${special.note ? `<p class="hero-note">${special.note}</p>` : ""}
        <p class="hero-cta">
          <a class="btn btn--primary" href="/recipes/${encodeURIComponent(special.slug)}">Cook the special</a>
          <a class="nav-link" href="#collection">Browse the collection →</a>
        </p>
        ${framedPhoto({
          src: resolvePhoto(special.photo, 1200),
          alt: special.photo.alt,
          focus: special.photo.focus,
          ratio: "ratio--hero",
          priority: true,
        })}
        <p class="hero-caption">
          <span class="eyebrow">${escapeHtml(categoryLabel(special.category))}</span>
          <span>${special.intro}</span>
        </p>
      </section>`
    : `
      <section class="hero">
        <p class="eyebrow">Nothing on the counter</p>
        <h1 class="hero-title">The studio is empty.</h1>
        <p class="lede">Add the first recipe and today's special will write itself.</p>
        <p class="hero-cta"><a class="btn btn--primary" href="/recipes/new">Add a recipe</a></p>
      </section>`;

  const cards = recipes
    .slice(0, 3)
    .map((recipe) => recipeCard(recipe))
    .join("");

  root.innerHTML = pageShell({
    nav,
    wide: true,
    main: `
      ${hero}

      <section class="section" id="collection">
        ${sectionLabel("The collection", `<a class="section-label__link" href="/recipes">View all →</a>`)}
        <div class="card-grid">${cards}</div>
      </section>

      <section class="section">
        ${sectionLabel("The categories")}
        <div class="chips">
          ${CATEGORIES.map(
            (category) =>
              `<a class="chip" href="${category.href}">${category.label}</a>`,
          ).join("")}
        </div>
      </section>

      <section class="section manifesto">
        ${sectionLabel("The manifesto")}
        <div class="manifesto__grid">
          <p class="manifesto__lead">
            A recipe is a letter from one kitchen to another — written in the
            same hand, kept in the same drawer, pulled out when the afternoon
            calls for it.
          </p>
          <p class="manifesto__body">
            Recipe Studio keeps your collection the way a good notebook does:
            one page per dish, a photograph matted and framed, ingredients
            measured in the order you reach for them. Nothing to sync, nothing
            to sign into — the studio lives on this device.
          </p>
        </div>
      </section>

      <section class="section cta">
        ${sectionLabel("Start cooking")}
        <p class="cta__line">Have a dish worth keeping?</p>
        <p class="hero-cta">
          <a class="btn btn--primary" href="/recipes/new">Add a recipe</a>
          <a class="nav-link" href="/recipes">Open the database →</a>
        </p>
      </section>`,
  });
}
