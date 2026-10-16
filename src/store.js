/**
 * The recipe collection, backed by localStorage. On the first load the seed
 * collection is copied in; every edit after that lives in this browser only —
 * the app makes no network requests at all.
 */

import { SEED_RECIPES } from "./data/recipes.js";

const STORAGE_KEY = "recipe-studio:collection:v1";

let cache = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Bring older saves up to the current shape on read: ingredients used to be
 * groups ({ section?, items: [...] }) and recipes had no photo gallery yet.
 */
function migrateRecipe(recipe) {
  const ingredients = recipe.ingredients;
  const grouped =
    Array.isArray(ingredients) &&
    ingredients.length > 0 &&
    !ingredients.every((entry) => typeof entry === "string");
  const flat = grouped
    ? ingredients.flatMap((group) =>
        Array.isArray(group?.items) ? group.items : [],
      )
    : ingredients;
  const photos = Array.isArray(recipe.photos) ? recipe.photos : [];
  if (flat === ingredients && photos === recipe.photos) return recipe;
  return { ...recipe, ingredients: flat, photos };
}

function read() {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cache = parsed.map(migrateRecipe);
        return cache;
      }
    }
  } catch (error) {
    console.warn("[Recipe Studio] Could not read storage:", error);
  }
  cache = clone(SEED_RECIPES).map(migrateRecipe);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    // Private browsing without storage — run from memory for this visit.
    console.warn("[Recipe Studio] Storage unavailable, using memory:", error);
  }
  return cache;
}

function commit(list) {
  // Persists first: if the quota is full the in-memory copy stays untouched,
  // so the rendered pages never drift from what is stored.
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // A few dozen uploaded photos can fill the small localStorage.
    throw new Error(
      "This device is out of storage for the notebook — remove a few photos or recipes and try again.",
    );
  }
  cache = list;
}

/** Every recipe, newest first. */
export function listRecipes() {
  return read().slice();
}

/** One recipe by its URL slug, or null. */
export function getRecipe(slug) {
  return read().find((recipe) => recipe.slug === slug) ?? null;
}

function slugify(title) {
  const base = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[łŁ]/g, "l") // ł has no NFKD decomposition, map it by hand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "recipe";
}

function uniqueSlug(title, list) {
  const base = slugify(title);
  let slug = base;
  for (let attempt = 2; attempt < 50; attempt++) {
    if (!list.some((recipe) => recipe.slug === slug)) break;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function photoEntry(title, src, alt) {
  return {
    src,
    alt: (alt || "").trim() || title,
    focus: "center",
    // Unsplash photos are sized on render, like the original starters.
    resize: src.includes("images.unsplash.com"),
  };
}

/**
 * Create a recipe. `photoSrc` is required (the form validates first) — either
 * a data URL from a picked file or an external image link.
 */
export function createRecipe(values) {
  const list = read();
  const slug = uniqueSlug(values.title, list);
  const recipe = {
    id: newId(),
    slug,
    title: values.title,
    category: values.category,
    note: values.note || "",
    intro: values.intro || "",
    photo: photoEntry(values.title, values.photoSrc, values.photoAlt),
    photos: values.photos ?? [],
    prep: values.prep || "—",
    cook: values.cook || "—",
    serves: values.serves || "—",
    ingredients: values.ingredients,
    steps: values.steps,
    tips: values.tips,
    rating: null,
    createdAt: Date.now(),
  };
  commit([recipe, ...list]);
  return { slug };
}

/**
 * Edit a recipe in place. A new `photoSrc` replaces the photo; leaving it out
 * keeps the current one. The slug never changes, so links keep working.
 */
export function updateRecipe(slug, values) {
  const list = read();
  const index = list.findIndex((recipe) => recipe.slug === slug);
  if (index === -1) {
    throw new Error("That recipe is no longer in the database.");
  }
  const existing = list[index];
  const updated = {
    ...existing,
    title: values.title,
    category: values.category,
    note: values.note || "",
    intro: values.intro || "",
    photo: values.photoSrc
      ? photoEntry(values.title, values.photoSrc, values.photoAlt)
      : existing.photo,
    photos: values.photos ?? existing.photos,
    prep: values.prep || "—",
    cook: values.cook || "—",
    serves: values.serves || "—",
    ingredients: values.ingredients,
    steps: values.steps,
    tips: values.tips,
  };
  const next = list.slice();
  next[index] = updated;
  commit(next);
  return { slug: existing.slug };
}

/** Remove a recipe from the collection. */
export function removeRecipe(slug) {
  const list = read();
  commit(list.filter((recipe) => recipe.slug !== slug));
}

/** Set the 1–5 star review on a recipe, or clear it with null. */
export function saveRating(slug, rating) {
  if (
    rating !== null &&
    (!Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    throw new Error("A rating is a whole number of stars, 1 to 5.");
  }
  const list = read();
  const index = list.findIndex((recipe) => recipe.slug === slug);
  if (index === -1) {
    throw new Error("That recipe is no longer in the database.");
  }
  const next = list.slice();
  next[index] = { ...next[index], rating };
  commit(next);
}
