export type IngredientGroup = {
  /** Optional group heading, e.g. "For the batter". */
  section?: string;
  items: string[];
};

/** The shelves in the recipe database. */
export type RecipeCategory =
  | "breakfast"
  | "lunch"
  | "snack"
  | "soup"
  | "dessert";

export const RECIPE_CATEGORIES: { id: RecipeCategory; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "snack", label: "Snack" },
  { id: "soup", label: "Soup" },
  { id: "dessert", label: "Dessert" },
];

export function categoryLabel(id: RecipeCategory): string {
  return RECIPE_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  category: RecipeCategory;
  /** One-line italic subtitle. May be empty. */
  note: string;
  /** Short editorial intro shown under the title. May be empty. */
  intro: string;
  photo: {
    /** Base URL of the photo (CDN photos are sized on render). */
    src: string;
    alt: string;
    /** CSS object-position for cropping. */
    focus?: string;
    /** True for Unsplash CDN photos, which accept a width parameter. */
    resize?: boolean;
  };
  prep: string;
  cook: string;
  serves: string;
  ingredients: IngredientGroup[];
  steps: string[];
  tips?: string[];
  /** The owner's 1–5 star review; null while unrated. */
  rating: number | null;
};

/**
 * The whole collection lives in the Convex database — the three recipes the
 * studio opened with were seeded there, so every recipe can be edited,
 * rated and deleted the same way.
 */

/** Small stable hash so the special of the day does not jump around. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * The special of the day, picked from the whole collection. Deterministic on
 * the calendar date — the same recipe shows all day and it rotates at
 * midnight, no server round-trip needed. Undefined for an empty collection.
 */
export function todaysRecipe(
  list: Recipe[],
  date: Date = new Date(),
): Recipe | undefined {
  if (list.length === 0) return undefined;
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  return list[hashString(key) % list.length]!;
}

/** e.g. "Sunday, 12 October" in the user's locale. */
export function formatDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/** Size a CDN photo for its context; other photos are used as-is. */
export function photoSrc(base: string, width: number): string {
  return `${base}?q=80&w=${width}&auto=format&fit=crop`;
}

/** Photo URL at the requested width (CDN photos only are resized). */
export function resolvePhoto(photo: Recipe["photo"], width: number): string {
  return photo.resize ? photoSrc(photo.src, width) : photo.src;
}

/** "Lunch · One tray, one pot" — category first, subtitle when present. */
export function kickerLine(recipe: Recipe): string {
  return [categoryLabel(recipe.category), recipe.note]
    .filter(Boolean)
    .join(" · ");
}
