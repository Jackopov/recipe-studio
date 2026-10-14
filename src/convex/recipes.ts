import { v } from "convex/values";
import { categoryValidator } from "./schema";
import type { Doc } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

const ingredientGroupValidator = v.object({
  section: v.optional(v.string()),
  items: v.array(v.string()),
});

/** A recipe document with its photo URL resolved (storage link or external). */
export type RecipeDocWithPhoto = Omit<Doc<"recipes">, "photoUrl"> & {
  photoUrl: string | null;
};

async function withPhoto(
  ctx: QueryCtx | MutationCtx,
  doc: Doc<"recipes">,
): Promise<RecipeDocWithPhoto> {
  const storageUrl = doc.photoStorageId
    ? await ctx.storage.getUrl(doc.photoStorageId)
    : null;
  return { ...doc, photoUrl: storageUrl ?? doc.photoUrl ?? null };
}

/** Every recipe in the database, newest first, with photos resolved. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db
      .query("recipes")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    return await Promise.all(docs.map((doc) => withPhoto(ctx, doc)));
  },
});

/** A single recipe by its URL slug, or null if it is not in the database. */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const doc = await ctx.db
      .query("recipes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!doc) return null;
    return await withPhoto(ctx, doc);
  },
});

/** Returns an upload URL for a photo picked on the phone. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

function slugify(title: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[łŁ]/g, "l") // ł has no NFKD decomposition, map it by hand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "recipe";
}

/** Add a recipe to the database; returns the slug to navigate to. */
export const addRecipe = mutation({
  args: {
    title: v.string(),
    category: categoryValidator,
    note: v.optional(v.string()),
    intro: v.optional(v.string()),
    photoStorageId: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    prep: v.optional(v.string()),
    cook: v.optional(v.string()),
    serves: v.optional(v.string()),
    ingredients: v.array(ingredientGroupValidator),
    steps: v.array(v.string()),
    tips: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (!title) throw new Error("A recipe needs a title.");
    if (!args.photoStorageId && !args.photoUrl?.trim()) {
      throw new Error("Add a photo — upload one or paste an image link.");
    }
    const ingredients = args.ingredients.filter(
      (group) => group.items.length > 0,
    );
    if (ingredients.length === 0) {
      throw new Error("Add at least one ingredient.");
    }
    const steps = args.steps.map((step) => step.trim()).filter(Boolean);
    if (steps.length === 0) {
      throw new Error("Add at least one instruction step.");
    }

    // Keep slugs unique so links never collide.
    const base = slugify(title);
    let slug = base;
    for (let attempt = 2; attempt < 50; attempt++) {
      const existing = await ctx.db
        .query("recipes")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!existing) break;
      slug = `${base}-${attempt}`;
    }

    const id = await ctx.db.insert("recipes", {
      title,
      slug,
      category: args.category,
      note: args.note?.trim() || undefined,
      intro: args.intro?.trim() || undefined,
      photoStorageId: args.photoStorageId,
      photoUrl: args.photoUrl?.trim() || undefined,
      prep: args.prep?.trim() || undefined,
      cook: args.cook?.trim() || undefined,
      serves: args.serves?.trim() || undefined,
      ingredients,
      steps,
      tips: args.tips?.map((tip) => tip.trim()).filter(Boolean),
      createdAt: Date.now(),
    });

    return { id, slug };
  },
});
