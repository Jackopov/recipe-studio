import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Recipe database categories (breakfast, lunch, snack, soup, dessert).
export const categoryValidator = v.union(
  v.literal("breakfast"),
  v.literal("lunch"),
  v.literal("snack"),
  v.literal("soup"),
  v.literal("dessert"),
);
export type RecipeCategory = Infer<typeof categoryValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // The recipe database: recipes added from the app live here. The three
    // starter recipes ship in src/data/recipes.ts and are merged in on the
    // client, so no seeding is required.
    recipes: defineTable({
      title: v.string(),
      slug: v.string(),
      category: categoryValidator,
      note: v.optional(v.string()), // short italic subtitle
      intro: v.optional(v.string()), // one editorial paragraph
      photoStorageId: v.optional(v.string()), // uploaded photo (Convex storage)
      photoUrl: v.optional(v.string()), // or an external image link
      prep: v.optional(v.string()),
      cook: v.optional(v.string()),
      serves: v.optional(v.string()),
      ingredients: v.array(
        v.object({
          section: v.optional(v.string()),
          items: v.array(v.string()),
        }),
      ),
      steps: v.array(v.string()),
      tips: v.optional(v.array(v.string())),
      // The owner's 1–5 star review; null/absent means unrated so far.
      // The 1–5 range is enforced in the setRating mutation.
      rating: v.optional(v.nullable(v.number())),
      createdAt: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_created_at", ["createdAt"]),

    // tableName: defineTable({
    //   ...
    //   // table fields
    // }).index("by_field", ["field"])
  },
  {
    schemaValidation: false,
  },
);

export default schema;
