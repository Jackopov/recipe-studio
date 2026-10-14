import type { Doc } from "@/convex/_generated/dataModel";
import type { Recipe } from "@/data/recipes";

/** A recipe document coming back from Convex, with its photo resolved. */
export type RecipeDoc = Omit<Doc<"recipes">, "photoUrl"> & {
  photoUrl: string | null;
};

/** Turn a database recipe into the shared UI recipe shape. */
export function docToRecipe(doc: RecipeDoc): Recipe {
  return {
    id: doc._id,
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    note: doc.note ?? "",
    intro: doc.intro ?? "",
    photo: {
      src: doc.photoUrl ?? "",
      alt: doc.title,
      focus: "center",
    },
    prep: doc.prep ?? "—",
    cook: doc.cook ?? "—",
    serves: doc.serves ?? "—",
    ingredients: doc.ingredients,
    steps: doc.steps,
    tips: doc.tips,
  };
}
