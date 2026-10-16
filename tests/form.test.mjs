/**
 * Interaction tests for the recipe form and the flat ingredient list, run in
 * a real DOM (happy-dom). Guards the reported bug: "+ Add ingredient",
 * "+ Add a step" and "+ Add a tip" must add the next row when clicked, and
 * the saved recipe must store one flat ingredient list.
 * Run with `bun run test`.
 */
import assert from "node:assert/strict";
import { Window } from "happy-dom";

const window = new Window({ url: "https://host.test/" });
const document = window.document;
globalThis.window = window;
globalThis.document = document;
globalThis.localStorage = window.localStorage;
globalThis.sessionStorage = window.sessionStorage;
globalThis.history = window.history;
globalThis.location = window.location;
globalThis.PopStateEvent = window.PopStateEvent;
globalThis.HTMLImageElement = window.HTMLImageElement;
globalThis.FileReader = window.FileReader;
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);

// Old-style stored recipe (grouped ingredients) to prove the migration.
window.localStorage.setItem(
  "recipe-studio:collection:v1",
  JSON.stringify([
    {
      id: "old-1",
      slug: "old-stew",
      title: "Old Stew",
      category: "lunch",
      note: "",
      intro: "",
      photo: {
        src: "https://images.unsplash.com/photo-123",
        alt: "Old Stew",
        focus: "center",
        resize: true,
      },
      prep: "—",
      cook: "—",
      serves: "—",
      ingredients: [
        { section: "For the base", items: ["1 onion"] },
        { items: ["2 carrots"] },
      ],
      steps: ["Chop and simmer."],
      tips: [],
      rating: null,
      createdAt: 1,
    },
  ]),
);

const { getRecipe } = await import("../src/store.js");
const { renderRecipeForm } = await import("../src/views/form.js");
const { renderRecipe } = await import("../src/views/recipe.js");

let checks = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  checks++;
};
const $$ = (selector) => [...root.querySelectorAll(selector)];
const one = (selector) => root.querySelector(selector);
const click = (element) => {
  assert.ok(element, "element to click must exist");
  element.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
};
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const root = document.createElement("div");
root.id = "app";
document.body.appendChild(root);

/* ---------- migration: old grouped data becomes a flat list ---------- */
{
  const migrated = getRecipe("old-stew");
  check(
    Array.isArray(migrated.ingredients) &&
      migrated.ingredients.every((entry) => typeof entry === "string"),
    "stored grouped ingredients are flattened on read",
  );
  check(
    JSON.stringify(migrated.ingredients) ===
      JSON.stringify(["1 onion", "2 carrots"]),
    "sections are dropped, items kept in order",
  );
  check(
    JSON.stringify(migrated.photos) === JSON.stringify([]),
    "saves without a gallery get an empty photos list",
  );
}

/* ---------- detail view: flat list, no group headings ---------- */
{
  renderRecipe(root, { nav: "", slug: "old-stew" });
  check(
    $$(".ingredient-list li").length === 2,
    "detail view renders both ingredients",
  );
  check(
    $$(".ingredient-section").length === 0,
    "detail view has no section headings",
  );
}

/* ---------- the form: groups are gone ---------- */
renderRecipeForm(root, { nav: "", mode: "new" });
check($$("[data-group-section]").length === 0, "no section inputs");
check($$("[data-group-add]").length === 0, "no add-group button");
check($$("[data-group-remove]").length === 0, "no remove-group buttons");

/* ---------- "+ Add ingredient" adds a row ---------- */
check($$("[data-item]").length === 1, "form starts with one ingredient row");
click(one("[data-item-add]"));
check($$("[data-item]").length === 2, "click add-ingredient → 2 rows");

$$("[data-item]")[0].value = "2 cups flour";
click(one("[data-item-add]"));
check($$("[data-item]").length === 3, "click add-ingredient again → 3 rows");
check($$("[data-item]")[0].value === "2 cups flour", "typed value survives");
check($$("[data-item]")[2].value === "", "new row starts empty");

/* ---------- removing a row ---------- */
click($$("[data-item-remove]")[1]);
check($$("[data-item]").length === 2, "click remove → 2 rows");
click($$("[data-item-remove]")[1]);
check($$("[data-item]").length === 1, "remove → back to 1 row");
check(
  $$("[data-item-remove]")[0].disabled === true,
  "last remaining row cannot be removed",
);
check(
  $$("[data-item]")[0].value === "2 cups flour",
  "surviving row keeps its value",
);

/* ---------- "+ Add a step" adds a row ---------- */
check($$("[data-step]").length === 1, "form starts with one step row");
$$("[data-step]")[0].value = "Mix the dough.";
click(one("[data-step-add]"));
check($$("[data-step]").length === 2, "click add-step → 2 rows");
check($$("[data-step]")[0].value === "Mix the dough.", "step text survives");
check($$("[data-step]")[1].value === "", "new step row is empty");

/* ---------- "+ Add a tip" adds a row ---------- */
check($$("[data-tip]").length === 1, "form starts with one tip row");
click(one("[data-tip-add]"));
check($$("[data-tip]").length === 2, "click add-tip → 2 rows");

/* ---------- saving writes a flat recipe ---------- */
one("#f-title").value = "Test loaf";
one("[data-photo-url]").value = "https://images.unsplash.com/photo-999";
click(one("[data-item-add]"));
check($$("[data-item]").length === 2, "can add a row again after removing");
$$("[data-item]")[0].value = "300 g flour";
$$("[data-item]")[1].value = "250 ml water";
$$("[data-step]")[0].value = "Mix and bake.";
$$("[data-step]")[1].value = ""; // empty rows must not block saving
$$("[data-tip]")[0].value = "Rest overnight.";
$$("[data-tip]")[1].value = "";

one("[data-form]").dispatchEvent(
  new window.Event("submit", { bubbles: true, cancelable: true }),
);
check(one("[data-error]").hidden === true, "no validation error on save");

const saved = getRecipe("test-loaf");
check(Boolean(saved), "recipe was saved under its slug");
if (saved) {
  check(
    JSON.stringify(saved.ingredients) ===
      JSON.stringify(["300 g flour", "250 ml water"]),
    "saved ingredients are a flat string list (empties dropped)",
  );
  check(
    JSON.stringify(saved.steps) === JSON.stringify(["Mix and bake."]),
    "saved steps keep only filled rows",
  );
  check(
    JSON.stringify(saved.tips) === JSON.stringify(["Rest overnight."]),
    "saved tips keep only filled rows",
  );
}
check(
  window.location.pathname.endsWith("/recipes/test-loaf"),
  `navigated to the recipe page, got ${window.location.pathname}`,
);

/* ---------- editing an existing recipe: flat rows prefilled ---------- */
renderRecipeForm(root, { nav: "", slug: "old-stew", mode: "edit" });
check($$("[data-group-section]").length === 0, "edit form has no group UI");
check($$("[data-item]").length === 2, "edit form shows both ingredients");
check($$("[data-item]")[0].value === "1 onion", "first row prefilled");
check($$("[data-item]")[1].value === "2 carrots", "second row prefilled");
click(one("[data-item-add]"));
check($$("[data-item]").length === 3, "add ingredient works in edit mode");
check(
  $$("[data-item]")[0].value === "1 onion",
  "prefilled values survive the re-render",
);
$$("[data-item]")[2].value = "3 potatoes";

one("[data-form]").dispatchEvent(
  new window.Event("submit", { bubbles: true, cancelable: true }),
);
check(one("[data-error]").hidden === true, "edit saves without an error");
const edited = getRecipe("old-stew");
check(
  JSON.stringify(edited.ingredients) ===
    JSON.stringify(["1 onion", "2 carrots", "3 potatoes"]),
  "edited recipe keeps the flat list plus the new row",
);
check(
  window.location.pathname.endsWith("/recipes/old-stew"),
  `edit navigates back to the same recipe, got ${window.location.pathname}`,
);
check(
  JSON.stringify(getRecipe("old-stew").photos) === JSON.stringify([]),
  "editing without touching the gallery keeps it empty",
);

/* ---------- extra photos: add, remove, save ---------- */
renderRecipeForm(root, { nav: "", mode: "new" });
check($$("[data-photo-add]").length === 1, "form has an add-photo button");
check($$("[data-photo]").length === 0, "gallery starts empty");

one("[data-photo-add-url]").value = "https://images.unsplash.com/photo-111";
click(one("[data-photo-add]"));
check($$("[data-photo]").length === 1, "click add-photo → 1 row");
check(
  $$("[data-photo]")[0].dataset.photo ===
    "https://images.unsplash.com/photo-111",
  "row stores the link",
);
check(
  one("[data-photo-add-url]").value === "",
  "the link input clears after adding",
);

one("[data-photo-add-url]").value = "not a url";
click(one("[data-photo-add]"));
check($$("[data-photo]").length === 1, "an invalid link adds nothing");

one("[data-photo-add-url]").value = "https://images.unsplash.com/photo-222";
click(one("[data-photo-add]"));
check($$("[data-photo]").length === 2, "second photo added");

// Enter in the link field acts as the add button.
one("[data-photo-add-url]").value = "https://images.unsplash.com/photo-333";
one("[data-photo-add-url]").dispatchEvent(
  new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
);
check($$("[data-photo]").length === 3, "Enter adds the photo too");
click($$("[data-photo-remove]")[2]);
check($$("[data-photo]").length === 2, "the Enter-added row can be removed");

// Uploading a small jpeg appends a data-URL row — files this small skip the
// canvas re-encode in lib/photo.js, so the FileReader path is enough here.
const uploadInput = one("[data-photo-add-file]");
const upload = new window.File([new Uint8Array([255, 216, 255])], "shot.jpg", {
  type: "image/jpeg",
});
Object.defineProperty(uploadInput, "files", {
  value: [upload],
  configurable: true,
});
uploadInput.dispatchEvent(new window.Event("change", { bubbles: true }));
// The FileReader inside lib/photo.js resolves on its own task.
for (let i = 0; i < 20 && $$("[data-photo]").length < 3; i++) await tick();
check(
  $$("[data-photo]").length === 3,
  `uploaded photo lands as a row (toasts: ${[
    ...document.querySelectorAll(".toast"),
  ]
    .map((t) => t.textContent)
    .join(" | ")})`,
);
check(
  $$("[data-photo]")[2].dataset.photo.startsWith("data:image/jpeg"),
  "the row holds a data URL",
);

click($$("[data-photo-remove]")[0]);
check($$("[data-photo]").length === 2, "a row can be removed");
check(
  $$("[data-photo]")[0].dataset.photo ===
    "https://images.unsplash.com/photo-222",
  "the other photos stay",
);

/* ---------- saving persists the gallery ---------- */
one("#f-title").value = "Photo test";
one("[data-photo-url]").value = "https://images.unsplash.com/photo-999";
$$("[data-item]")[0].value = "1 pinch salt";
$$("[data-step]")[0].value = "Stir.";

one("[data-form]").dispatchEvent(
  new window.Event("submit", { bubbles: true, cancelable: true }),
);
check(one("[data-error]").hidden === true, "save with photos succeeds");
const withPhotos = getRecipe("photo-test");
check(Boolean(withPhotos), "recipe saved under its slug");
check(withPhotos?.photos?.length === 2, "both photos persisted");
check(
  withPhotos?.photos?.[0] === "https://images.unsplash.com/photo-222",
  "the link photo persisted",
);
check(
  withPhotos?.photos?.[1]?.startsWith("data:image/jpeg"),
  "the uploaded photo persisted",
);

/* ---------- detail view: scrollable gallery ---------- */
renderRecipe(root, { nav: "", slug: "photo-test" });
check($$(".gallery__item").length === 2, "detail page shows the gallery");
check(
  one(".gallery img")?.getAttribute("src") ===
    "https://images.unsplash.com/photo-222",
  "gallery image points at the saved photo",
);
renderRecipe(root, { nav: "", slug: "old-stew" });
check($$(".gallery").length === 0, "no gallery section without photos");

console.log(`OK — ${checks} assertions passed, 0 failed`);
