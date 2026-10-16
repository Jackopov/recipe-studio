/**
 * One recipe, presented like a magazine spread: framed photograph, meta strip,
 * ingredients you can tick off, numbered method, tips — and the interactive
 * star rating (tapping a star saves it to the local store).
 */

import { getRecipe, removeRecipe, saveRating } from "../store.js";
import { formatDate, resolvePhoto } from "../data/recipes.js";
import {
  escapeHtml,
  framedPhoto,
  metaStrip,
  pageShell,
  sectionLabel,
  toast,
} from "../ui.js";
import { appUrl } from "../base.js";

function ratingMarkup(rating) {
  const stars = [1, 2, 3, 4, 5]
    .map((star) => {
      const filled = rating != null && star <= rating;
      return `<button type="button" class="star-btn${
        filled ? " star-btn--filled" : ""
      }" data-star="${star}" aria-label="Rate ${star} out of 5 stars"
        aria-pressed="${filled}"><svg viewBox="0 0 24 24" width="22" height="22"
        aria-hidden="true" focusable="false"><path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.45l-5.81 3.05 1.11-6.47L2.6 9.45l6.5-.95L12 2.6z"/></svg></button>`;
    })
    .join("");
  return `
    <div class="rating">
      <div class="star-rating" role="group" aria-label="Your rating">${stars}</div>
      <p class="rating__note">${
        rating
          ? `You rated this ${rating} out of 5.`
          : "Unrated so far — tap a star."
      }</p>
    </div>`;
}

function ingredientsMarkup(recipe) {
  return `
    <ul class="ingredient-list">
      ${recipe.ingredients
        .map(
          (item) => `
        <li class="ingredient">
          <label>
            <input type="checkbox" class="ingredient__check">
            <span class="ingredient__text">${escapeHtml(item)}</span>
          </label>
        </li>`,
        )
        .join("")}
    </ul>`;
}

function stepsMarkup(steps) {
  return `
    <ol class="steps">
      ${steps
        .map(
          (step, index) => `
        <li class="step">
          <span class="step__num">${String(index + 1).padStart(2, "0")}</span>
          <p class="step__text">${escapeHtml(step)}</p>
        </li>`,
        )
        .join("")}
    </ol>`;
}

export function renderRecipe(root, { nav = "", slug = "" } = {}) {
  const recipe = getRecipe(slug);
  if (!recipe) {
    window.history.replaceState({}, "", appUrl("/404"));
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }

  const main = `
    <article class="detail">
      <p class="detail__back">
        <a class="nav-link" href="${appUrl("/recipes")}">← Back to the database</a>
      </p>

      <p class="kicker-row">
        <span class="eyebrow">${escapeHtml(recipe.category)} · ${formatDate(recipe.createdAt)}</span>
        <span class="kicker-row__rule"></span>
        <a class="nav-link" href="${appUrl(`/recipes/${encodeURIComponent(recipe.slug)}/edit`)}">Edit</a>
      </p>

      <h1 class="detail__title">${escapeHtml(recipe.title)}</h1>
      ${recipe.note ? `<p class="hero-note">${escapeHtml(recipe.note)}</p>` : ""}

      ${framedPhoto({
        src: resolvePhoto(recipe.photo, 1200),
        alt: recipe.photo.alt,
        focus: recipe.photo.focus,
        ratio: "ratio--hero",
        priority: true,
      })}

      ${metaStrip([
        { label: "Prep", value: recipe.prep },
        { label: "Cook", value: recipe.cook },
        { label: "Serves", value: recipe.serves },
      ])}

      ${recipe.intro ? `<p class="detail__intro">${escapeHtml(recipe.intro)}</p>` : ""}

      <section class="section">
        ${sectionLabel("Ingredients")}
        ${ingredientsMarkup(recipe)}
      </section>

      <section class="section">
        ${sectionLabel("Method")}
        ${stepsMarkup(recipe.steps)}
      </section>

      ${
        recipe.tips?.length
          ? `<section class="section">
              ${sectionLabel("Tips")}
              <ul class="tips">
                ${recipe.tips
                  .map((tip) => `<li class="tip">${escapeHtml(tip)}</li>`)
                  .join("")}
              </ul>
            </section>`
          : ""
      }

      <section class="section">
        ${sectionLabel("Your rating")}
        ${ratingMarkup(recipe.rating)}
      </section>

      <section class="section delete-block">
        ${sectionLabel("Remove")}
        <p class="lede">
          Deleting is permanent — this recipe lives only on this device.
        </p>
        <div class="delete-block__actions" data-delete-zone>
          <button type="button" class="btn btn--danger" data-delete-request>Delete recipe</button>
        </div>
      </section>
    </article>`;

  root.innerHTML = pageShell({ nav, main });

  // Star rating — immediate save, like the old optimistic mutation.
  root.querySelectorAll("[data-star]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = Number(button.dataset.star);
      saveRating(recipe.slug, value);
      toast(`Rated ${value} out of 5 stars.`);
      renderRecipe(root, { nav, slug });
    });
  });

  // Delete: first press arms the confirmation, second press removes it.
  const zone = root.querySelector("[data-delete-zone]");
  zone
    ?.querySelector("[data-delete-request]")
    ?.addEventListener("click", () => {
      zone.innerHTML = `
      <div class="delete-confirm">
        <p class="delete-confirm__text">
          Delete “${escapeHtml(recipe.title)}” for good? This cannot be undone.
        </p>
        <div class="delete-confirm__actions">
          <button type="button" class="btn btn--danger-solid" data-delete-confirm>Delete</button>
          <button type="button" class="btn btn--outline" data-delete-cancel>Keep it</button>
        </div>
      </div>`;
      zone
        .querySelector("[data-delete-confirm]")
        .addEventListener("click", () => {
          removeRecipe(recipe.slug);
          toast("Recipe deleted.");
          window.history.pushState({}, "", appUrl("/recipes"));
          window.dispatchEvent(new PopStateEvent("popstate"));
        });
      zone
        .querySelector("[data-delete-cancel]")
        .addEventListener("click", () => {
          renderRecipe(root, { nav, slug });
        });
    });
}
