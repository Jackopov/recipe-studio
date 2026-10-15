/**
 * Small editorial building blocks shared by the recipe screens: the masthead,
 * the gallery-style photo frame, section labels, the meta strip, the card and
 * the star rows — the HTML counterparts of the old React components.
 */

import { categoryLabel, resolvePhoto } from "./data/recipes.js";

const SVG_STAR =
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.45l-5.81 3.05 1.11-6.47L2.6 9.45l6.5-.95L12 2.6z"/></svg>';

/** Escape anything that came from user data before it goes into markup. */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Shared markup for quiet text links next to the Add button. */
export function navLink(href, label) {
  return `<a class="nav-link" href="${href}">${escapeHtml(label)}</a>`;
}

export function siteHeader(navHtml = "") {
  return `
    <header class="site-header">
      <div class="site-header__inner shell">
        <a class="brand" href="/">
          <span class="brand__mark"><span class="brand__dot"></span></span>
          <span class="brand__name">Recipe Studio</span>
        </a>
        <div class="header-actions">
          ${navHtml}
          <a class="btn btn--outline btn--add" href="/recipes/new" aria-label="Add a recipe">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            Add
          </a>
        </div>
      </div>
    </header>`;
}

export function siteFooter() {
  return `
    <footer class="site-footer">
      <div class="site-footer__inner shell">
        <p class="site-footer__tag">Kept close at hand.</p>
        <p>Photography via Unsplash · Add to your Home Screen for a full-screen view.</p>
      </div>
    </footer>`;
}

/** Full page shell: header, main content, footer. */
export function pageShell({ nav = "", main = "", wide = false } = {}) {
  return `
    <div class="page">
      ${siteHeader(nav)}
      <main class="shell${wide ? " shell--wide" : ""} page__main">${main}</main>
      ${siteFooter()}
    </div>`;
}

/** A photo matted inside a thin frame, like a print on a gallery wall. */
export function framedPhoto({ src, alt, focus, ratio, priority = false }) {
  const style = focus ? ` style="object-position:${escapeHtml(focus)}"` : "";
  return `
    <figure class="frame">
      <div class="frame__box ${ratio}">
        <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"
          loading="${priority ? "eager" : "lazy"}" decoding="async"${style}>
      </div>
    </figure>`;
}

/** A tracked-out label with a hairline rule — the app's section heading. */
export function sectionLabel(text, right = "") {
  return `
    <div class="section-label">
      <span class="section-label__text">${escapeHtml(text)}</span>
      <span class="section-label__rule"></span>
      ${right ? `<span class="section-label__right">${right}</span>` : ""}
    </div>`;
}

/** Prep / cook / serves, split into equal columns with hairline dividers. */
export function metaStrip(items) {
  return `
    <dl class="meta-strip">
      ${items
        .map(
          (item) => `
        <div class="meta-strip__cell">
          <dt>${escapeHtml(item.label)}</dt>
          <dd>${escapeHtml(item.value)}</dd>
        </div>`,
        )
        .join("")}
    </dl>`;
}

/** Small read-only stars for cards — hidden while a recipe is unrated. */
export function starsMarkup(value) {
  if (!value) return "";
  const stars = [1, 2, 3, 4, 5]
    .map(
      (star) =>
        `<span class="star${star <= value ? " star--filled" : ""}">${SVG_STAR}</span>`,
    )
    .join("");
  return `<span class="stars stars--readonly" aria-label="Rated ${value} out of 5 stars">${stars}</span>`;
}

function cardTimes(recipe) {
  const times = [
    recipe.prep !== "—" ? `${recipe.prep} prep` : null,
    recipe.cook !== "—" ? `${recipe.cook} cook` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return times || "Open the recipe";
}

/** The card shared by the homepage collection and the database. */
export function recipeCard(recipe, badge = "") {
  return `
    <a class="recipe-card" href="/recipes/${encodeURIComponent(recipe.slug)}">
      <span class="recipe-card__frame">
        <span class="recipe-card__box ratio--card">
          <img src="${escapeHtml(resolvePhoto(recipe.photo, 800))}"
            alt="${escapeHtml(recipe.photo.alt)}" loading="lazy" decoding="async"
            ${recipe.photo.focus ? `style="object-position:${escapeHtml(recipe.photo.focus)}"` : ""}>
        </span>
      </span>
      <span class="recipe-card__shelf">
        ${escapeHtml(categoryLabel(recipe.category))}${badge ? ` · ${escapeHtml(badge)}` : ""}
      </span>
      <span class="recipe-card__title">${escapeHtml(recipe.title)}</span>
      <span class="recipe-card__meta">${escapeHtml(cardTimes(recipe))}</span>
      ${starsMarkup(recipe.rating)}
    </a>`;
}

/**
 * Toasts replace the old sonner toaster: a single snackbar that fades away.
 * kind: "success" | "error".
 */
export function toast(message, kind = "success") {
  let host = document.getElementById("toasts");
  if (!host) {
    host = document.createElement("div");
    host.id = "toasts";
    host.className = "toasts";
    document.body.appendChild(host);
  }
  const element = document.createElement("div");
  element.className = `toast toast--${kind === "error" ? "error" : "success"}`;
  element.setAttribute("role", "status");
  element.textContent = message;
  host.appendChild(element);
  requestAnimationFrame(() => element.classList.add("toast--visible"));
  window.setTimeout(() => {
    element.classList.remove("toast--visible");
    window.setTimeout(() => element.remove(), 300);
  }, 3200);
}
