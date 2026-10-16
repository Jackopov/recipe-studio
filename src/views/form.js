/**
 * The shared editor behind "New recipe" and "Edit recipe": title, note, intro,
 * photograph (file → local data URL or a direct link), extra gallery photos,
 * meta fields, the ingredient list, steps and tips — plus validation and the
 * local save.
 */

import { createRecipe, getRecipe, updateRecipe } from "../store.js";
import { RECIPE_CATEGORIES } from "../data/recipes.js";
import { photoToDataUrl } from "../lib/photo.js";
import { appUrl } from "../base.js";
import { escapeHtml, pageShell, sectionLabel, toast } from "../ui.js";

function photoFromValue(value) {
  const url = (value || "").trim();
  if (!url) return null;
  if (url.startsWith("data:image/")) return { src: url, alt: "", focus: "" };
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return { src: url, alt: "", focus: "", source: host };
  } catch {
    return null;
  }
}

/** A short human label for a gallery photo row. */
function photoLabel(src) {
  if (src.startsWith("data:")) return "Uploaded photo — kept on this device";
  try {
    return new URL(src).hostname.replace(/^www\./, "");
  } catch {
    return src;
  }
}

function defaultsFor(recipe) {
  if (!recipe) {
    return {
      title: "",
      slug: "",
      category: "lunch",
      note: "",
      intro: "",
      photoValue: "",
      photoAlt: "",
      photos: [],
      photoAddUrl: "",
      prep: "",
      cook: "",
      serves: "",
      ingredients: [""],
      steps: [""],
      tips: [""],
    };
  }
  return {
    title: recipe.title,
    slug: recipe.slug,
    category: recipe.category,
    note: recipe.note ?? "",
    intro: recipe.intro ?? "",
    photoValue: recipe.photo.src,
    photoAlt: recipe.photo.alt ?? "",
    photos: [...(recipe.photos ?? [])],
    photoAddUrl: "",
    prep: recipe.prep === "—" ? "" : recipe.prep,
    cook: recipe.cook === "—" ? "" : recipe.cook,
    serves: recipe.serves === "—" ? "" : recipe.serves,
    ingredients: [...recipe.ingredients],
    steps: [...recipe.steps],
    tips: [...(recipe.tips ?? [])],
  };
}

export function renderRecipeForm(
  root,
  { nav = "", slug = null, mode = "new" } = {},
) {
  const existing = slug ? getRecipe(slug) : null;
  if (slug && !existing) {
    window.history.replaceState({}, "", appUrl("/404"));
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }
  const draft = defaultsFor(existing);

  const ingredientMarkup = (item, index) => `
    <li class="group__item">
      <input class="input" type="text" placeholder="Ingredient"
        value="${escapeHtml(item)}" data-item="${index}">
      <button type="button" class="btn btn--ghost btn--small" data-item-remove="${index}"
        ${draft.ingredients.length === 1 ? "disabled" : ""}>×</button>
    </li>`;

  const extraPhotoMarkup = (src, index) => `
    <li class="group__item photo-row" data-photo="${escapeHtml(src)}">
      <img class="photo-row__thumb" src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async">
      <span class="photo-row__label">${escapeHtml(photoLabel(src))}</span>
      <button type="button" class="btn btn--ghost btn--small" data-photo-remove="${index}">×</button>
    </li>`;

  const stepMarkup = (step, index) => `
    <li class="group__item">
      <span class="step__num">${String(index + 1).padStart(2, "0")}</span>
      <textarea class="textarea" rows="2" placeholder="Describe this step"
        data-step="${index}">${escapeHtml(step)}</textarea>
      <button type="button" class="btn btn--ghost btn--small" data-step-remove="${index}"
        ${draft.steps.length === 1 ? "disabled" : ""}>×</button>
    </li>`;

  const tipMarkup = (tip, index) => `
    <li class="group__item">
      <textarea class="textarea" rows="2" placeholder="Optional note"
        data-tip="${index}">${escapeHtml(tip)}</textarea>
      <button type="button" class="btn btn--ghost btn--small" data-tip-remove="${index}"
        ${draft.tips.length === 1 ? "disabled" : ""}>×</button>
    </li>`;

  const render = () => {
    // Re-rendering swaps the whole page — hold the scroll place so the row
    // that was just added stays in view.
    const scrollY = window.scrollY;
    root.innerHTML = pageShell({
      nav,
      main: `
        <section class="form-page">
          <p class="detail__back">
            <a class="nav-link" href="${appUrl(
              existing
                ? `/recipes/${encodeURIComponent(existing.slug)}`
                : "/recipes",
            )}">← ${existing ? "Back to the recipe" : "Back to the database"}</a>
          </p>
          <p class="eyebrow">${mode === "edit" ? "Edit recipe" : "New recipe"}</p>
          <h1 class="page-title">${mode === "edit" ? "Revise the page." : "Add a page."}</h1>
          <p class="lede">
            Everything is saved on this device only — no account, no upload.
          </p>

          <form class="form" data-form novalidate>
            <div class="form-error" data-error hidden></div>

            <div class="field">
              <label class="field-label" for="f-title">Title</label>
              <input class="input" id="f-title" name="title" type="text" required
                placeholder="Lemon ricotta pancakes" value="${escapeHtml(draft.title)}">
            </div>

            <div class="field">
              <label class="field-label" for="f-note">Kicker <span class="field-hint">— short italic line</span></label>
              <input class="input" id="f-note" type="text"
                placeholder="Sunday, turned up a notch." value="${escapeHtml(draft.note)}">
            </div>

            <div class="field">
              <label class="field-label" for="f-intro">Intro</label>
              <textarea class="textarea" id="f-intro" rows="3"
                placeholder="One editorial paragraph…">${escapeHtml(draft.intro)}</textarea>
            </div>

            <fieldset class="field">
              <legend class="field-label">Category</legend>
              <div class="chips" role="radiogroup" aria-label="Category">
                ${RECIPE_CATEGORIES.map(
                  (category) => `
                  <button type="button" class="chip" data-category="${category.id}"
                    role="radio" aria-checked="${category.id === draft.category}"
                    aria-pressed="${category.id === draft.category}">${category.label}</button>`,
                ).join("")}
              </div>
            </fieldset>

            <div class="field">
              <label class="field-label" for="f-photo">Photograph</label>
              <div class="photo-pick">
                <img class="photo-pick__thumb" data-photo-thumb alt=""
                  ${draft.photoValue ? `src="${escapeHtml(draft.photoValue)}"` : ""} hidden>
                <div class="photo-pick__controls">
                  <input class="input" id="f-photo" type="url" placeholder="https://… image link"
                    value="${escapeHtml(
                      draft.photoValue.startsWith("data:")
                        ? ""
                        : draft.photoValue,
                    )}" data-photo-url>
                  <label class="nav-link photo-pick__file">
                    or upload a file
                    <input type="file" accept="image/*" data-photo-file hidden>
                  </label>
                </div>
              </div>
              <label class="field-label field-label--sub" for="f-photo-alt">Alt text</label>
              <input class="input" id="f-photo-alt" type="text" placeholder="Describe the photo"
                value="${escapeHtml(draft.photoAlt)}" data-photo-alt>
            </div>

            <section class="form-section">
              ${sectionLabel("More photos", '<span class="section-label__right">optional</span>')}
              <p class="field-hint">
                Beyond the cover — process shots or the recipe written on a page.
              </p>
              <ul class="group__items" data-photo-list>
                ${draft.photos.map(extraPhotoMarkup).join("")}
              </ul>
              <div class="photo-pick__controls">
                <input class="input" type="url" placeholder="https://… image link"
                  value="${escapeHtml(draft.photoAddUrl)}" data-photo-add-url>
                <div class="photo-add-actions">
                  <button type="button" class="nav-link" data-photo-add>+ Add photo</button>
                  <label class="nav-link photo-pick__file">
                    or upload a file
                    <input type="file" accept="image/*" data-photo-add-file hidden>
                  </label>
                </div>
              </div>
            </section>

            <div class="field field--split">
              <div>
                <label class="field-label" for="f-prep">Prep</label>
                <input class="input" id="f-prep" type="text" placeholder="15 min"
                  value="${escapeHtml(draft.prep)}">
              </div>
              <div>
                <label class="field-label" for="f-cook">Cook</label>
                <input class="input" id="f-cook" type="text" placeholder="20 min"
                  value="${escapeHtml(draft.cook)}">
              </div>
              <div>
                <label class="field-label" for="f-serves">Serves</label>
                <input class="input" id="f-serves" type="text" placeholder="4"
                  value="${escapeHtml(draft.serves)}">
              </div>
            </div>

            <section class="form-section">
              ${sectionLabel("Ingredients")}
              <ul class="group__items" data-ingredients>
                ${draft.ingredients.map(ingredientMarkup).join("")}
              </ul>
              <button type="button" class="nav-link" data-item-add>+ Add ingredient</button>
            </section>

            <section class="form-section">
              ${sectionLabel("Method")}
              <ul class="group__items" data-steps>
                ${draft.steps.map(stepMarkup).join("")}
              </ul>
              <button type="button" class="nav-link" data-step-add>+ Add a step</button>
            </section>

            <section class="form-section">
              ${sectionLabel("Tips", '<span class="section-label__right">optional</span>')}
              <ul class="group__items" data-tips>
                ${draft.tips.map(tipMarkup).join("")}
              </ul>
              <button type="button" class="nav-link" data-tip-add>+ Add a tip</button>
            </section>

            <div class="form-actions">
              <button class="btn btn--primary" type="submit">
                ${mode === "edit" ? "Save changes" : "Save recipe"}
              </button>
              <a class="nav-link" href="${appUrl(
                existing
                  ? `/recipes/${encodeURIComponent(existing.slug)}`
                  : "/recipes",
              )}">Cancel</a>
            </div>
          </form>
        </section>`,
    });
    wire();
    window.scrollTo(0, scrollY);
  };

  function readDraftFromDom() {
    const $ = (selector) => root.querySelector(selector);
    const photoUrl = ($("[data-photo-url]")?.value || "").trim();
    const photoFileSrc = $("[data-photo-thumb]")?.dataset.src || "";
    const photoValue = photoFileSrc || photoUrl;
    return {
      title: $("#f-title").value.trim(),
      note: $("#f-note").value.trim(),
      intro: $("#f-intro").value.trim(),
      category:
        root.querySelector("[data-category][aria-checked='true']")?.dataset
          .category ?? draft.category,
      photoValue,
      photoAlt: ($("[data-photo-alt]")?.value || "").trim(),
      prep: $("#f-prep").value.trim() || "—",
      cook: $("#f-cook").value.trim() || "—",
      serves: $("#f-serves").value.trim() || "—",
      photos: [...root.querySelectorAll("[data-photo]")].map(
        (element) => element.dataset.photo,
      ),
      photoAddUrl: root.querySelector("[data-photo-add-url]")?.value ?? "",
      // Read raw so empty placeholder rows survive a re-render; values are
      // trimmed and empty ones dropped only when the recipe is saved.
      ingredients: [...root.querySelectorAll("[data-item]")].map(
        (input) => input.value,
      ),
      steps: [...root.querySelectorAll("[data-step]")].map(
        (area) => area.value,
      ),
      tips: [...root.querySelectorAll("[data-tip]")].map((area) => area.value),
    };
  }

  function wire() {
    const form = root.querySelector("[data-form]");

    // Category chips act as a radio group.
    root.querySelectorAll("[data-category]").forEach((chip) => {
      chip.addEventListener("click", () => {
        draft.category = chip.dataset.category;
        root.querySelectorAll("[data-category]").forEach((other) => {
          const on = other === chip;
          other.setAttribute("aria-checked", String(on));
          other.setAttribute("aria-pressed", String(on));
        });
      });
    });

    // Photo: preview thumb, file → data URL, live URL preview.
    const thumb = root.querySelector("[data-photo-thumb]");
    const showThumb = (src) => {
      if (!thumb) return;
      if (src) {
        thumb.src = src;
        thumb.hidden = false;
      } else {
        thumb.removeAttribute("src");
        thumb.hidden = true;
      }
    };
    showThumb(draft.photoValue);
    if (draft.photoValue) thumb.dataset.src = draft.photoValue;

    root
      .querySelector("[data-photo-url]")
      ?.addEventListener("input", (event) => {
        const photo = photoFromValue(event.target.value);
        if (photo) {
          thumb.dataset.src = photo.src;
          showThumb(photo.src);
        } else {
          delete thumb.dataset.src;
          showThumb("");
        }
      });

    root
      .querySelector("[data-photo-file]")
      ?.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 12_000_000) {
          toast("That photo is over 12 MB — pick a smaller one.", "error");
          return;
        }
        try {
          // Downscaled and re-encoded so big camera photos still fit localStorage.
          const dataUrl = await photoToDataUrl(file);
          thumb.dataset.src = dataUrl;
          showThumb(dataUrl);
          const urlInput = root.querySelector("[data-photo-url]");
          if (urlInput) urlInput.value = "";
        } catch {
          toast("Could not read that photo — try a different file.", "error");
        }
      });

    // Extra gallery photos: add from a link or an uploaded file.
    const addPhoto = (src) => {
      syncDraft();
      draft.photos.push(src);
      draft.photoAddUrl = "";
      render();
    };

    root.querySelector("[data-photo-add]")?.addEventListener("click", () => {
      const input = root.querySelector("[data-photo-add-url]");
      const photo = photoFromValue(input?.value);
      if (!photo) {
        if (input?.value.trim()) {
          toast("That does not look like an image link.", "error");
          input?.focus();
        }
        return;
      }
      addPhoto(photo.src);
    });

    root
      .querySelector("[data-photo-add-url]")
      ?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          root.querySelector("[data-photo-add]")?.click();
        }
      });

    root
      .querySelector("[data-photo-add-file]")
      ?.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 12_000_000) {
          toast("That photo is over 12 MB — pick a smaller one.", "error");
          return;
        }
        try {
          // Downscaled and re-encoded, like the cover, so gallery photos
          // still fit localStorage.
          addPhoto(await photoToDataUrl(file));
        } catch {
          toast("Could not read that photo — try a different file.", "error");
        }
      });

    root.querySelectorAll("[data-photo-remove]").forEach((button) =>
      button.addEventListener("click", () => {
        const index = Number(button.dataset.photoRemove);
        syncDraft();
        draft.photos.splice(index, 1);
        render();
      }),
    );

    // Pull everything currently typed into the draft. Mutations (adding or
    // removing a row) run *after* this — reading the DOM again afterwards
    // would throw away the row that was just added.
    const syncDraft = () => {
      const current = readDraftFromDom();
      draft.title = current.title;
      draft.note = current.note;
      draft.intro = current.intro;
      draft.category = current.category;
      draft.photoValue = current.photoValue;
      draft.photoAlt = current.photoAlt;
      draft.photos = current.photos;
      draft.photoAddUrl = current.photoAddUrl;
      draft.prep = current.prep === "—" ? "" : current.prep;
      draft.cook = current.cook === "—" ? "" : current.cook;
      draft.serves = current.serves === "—" ? "" : current.serves;
      draft.ingredients = current.ingredients;
      draft.steps = current.steps;
      draft.tips = current.tips;
    };

    root.querySelector("[data-item-add]")?.addEventListener("click", () => {
      syncDraft();
      draft.ingredients.push("");
      render();
      root
        .querySelectorAll("[data-item]")
        [draft.ingredients.length - 1]?.focus();
    });
    root.querySelectorAll("[data-item-remove]").forEach((button) =>
      button.addEventListener("click", () => {
        const index = Number(button.dataset.itemRemove);
        syncDraft();
        if (draft.ingredients.length > 1) {
          draft.ingredients.splice(index, 1);
          render();
        }
      }),
    );

    root.querySelector("[data-step-add]")?.addEventListener("click", () => {
      syncDraft();
      draft.steps.push("");
      render();
      root.querySelectorAll("[data-step]")[draft.steps.length - 1]?.focus();
    });
    root.querySelectorAll("[data-step-remove]").forEach((button) =>
      button.addEventListener("click", () => {
        const index = Number(button.dataset.stepRemove);
        syncDraft();
        if (draft.steps.length > 1) {
          draft.steps.splice(index, 1);
          render();
        }
      }),
    );

    root.querySelector("[data-tip-add]")?.addEventListener("click", () => {
      syncDraft();
      draft.tips.push("");
      render();
      root.querySelectorAll("[data-tip]")[draft.tips.length - 1]?.focus();
    });
    root.querySelectorAll("[data-tip-remove]").forEach((button) =>
      button.addEventListener("click", () => {
        const index = Number(button.dataset.tipRemove);
        syncDraft();
        if (draft.tips.length > 1) {
          draft.tips.splice(index, 1);
          render();
        }
      }),
    );

    // Save.
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const errorBox = root.querySelector("[data-error]");
      const data = readDraftFromDom();

      if (!data.title) {
        errorBox.hidden = false;
        errorBox.textContent = "A title is required — every page needs a name.";
        root.querySelector("#f-title").focus();
        return;
      }
      const photo = photoFromValue(data.photoValue);
      if (!photo) {
        errorBox.hidden = false;
        errorBox.textContent =
          "Every recipe needs a photograph — paste an image link or upload a file.";
        root.querySelector("#f-photo").focus();
        return;
      }
      const clean = (list) => list.map((value) => value.trim()).filter(Boolean);
      const ingredients = clean(data.ingredients);
      const steps = clean(data.steps);
      const tips = clean(data.tips);
      const photos = clean(data.photos);
      if (!ingredients.length || !steps.length) {
        errorBox.hidden = false;
        errorBox.textContent =
          "Add at least one ingredient and one method step before saving.";
        return;
      }

      const values = {
        title: data.title,
        category: data.category,
        note: data.note,
        intro: data.intro,
        photoSrc: photo.src,
        photoAlt: data.photoAlt,
        photos,
        prep: data.prep,
        cook: data.cook,
        serves: data.serves,
        ingredients,
        steps,
        tips,
      };

      try {
        const saved = existing
          ? updateRecipe(existing.slug, values)
          : createRecipe(values);
        toast(mode === "edit" ? "Recipe updated." : "Recipe saved.");
        window.history.pushState(
          {},
          "",
          appUrl(`/recipes/${encodeURIComponent(saved.slug)}`),
        );
        window.dispatchEvent(new PopStateEvent("popstate"));
      } catch (error) {
        errorBox.hidden = false;
        errorBox.textContent =
          error instanceof Error
            ? error.message
            : "Could not save on this device.";
      }
    });
  }

  render();
}
