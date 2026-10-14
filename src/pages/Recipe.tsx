import { api } from "@/convex/_generated/api";
import {
  FramedPhoto,
  MetaStrip,
  PageSkeleton,
  SectionLabel,
  SiteFooter,
  SiteHeader,
  StarRating,
  navLinkClass,
} from "@/components/RecipeUI";
import { kickerLine, resolvePhoto } from "@/data/recipes";
import { docToRecipe } from "@/lib/recipe-doc";
import { useMutation, useQuery } from "convex/react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

/**
 * The recipe itself: photo, story, timings, your rating, then ingredients,
 * method and a few notes from the kitchen. One long, quiet scroll — sized
 * for a phone held in one hand at the stove.
 */
export default function RecipePage() {
  const { slug } = useParams();
  const stored = useQuery(api.recipes.getBySlug, { slug: slug ?? "" });
  const setRating = useMutation(api.recipes.setRating);

  if (stored === undefined) return <PageSkeleton />;

  const recipe = stored ? docToRecipe(stored) : undefined;

  if (!recipe || !stored) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader
          nav={
            <Link to="/recipes" className={navLinkClass}>
              Database
            </Link>
          }
        />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-5 py-24">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Not in the collection
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight">
            That recipe has wandered off.
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-7 text-muted-foreground">
            It may have been renamed or removed, or the link is slightly off.
          </p>
          <Link
            to="/recipes"
            className="mt-8 inline-flex min-h-11 items-center justify-center bg-primary px-7 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open the database
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const handleRating = async (rating: number | null) => {
    try {
      await setRating({ recipeId: stored._id, rating });
    } catch {
      toast.error("The rating could not be saved. Try again.");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        nav={
          <Link to="/recipes" className={navLinkClass}>
            Database
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5">
        <nav className="pt-6">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 ${navLinkClass}`}
          >
            <span aria-hidden>←</span> Today&apos;s special
          </Link>
        </nav>

        <article>
          <div className="mt-5">
            <FramedPhoto
              src={resolvePhoto(recipe.photo, 1600)}
              alt={recipe.photo.alt}
              focus={recipe.photo.focus}
              ratio="aspect-[4/5] sm:aspect-[3/2]"
              priority
            />
          </div>

          <header className="mt-7">
            <p className="font-display text-sm italic text-muted-foreground">
              {kickerLine(recipe)}
            </p>
            <h1 className="mt-2 font-display text-[2.25rem] leading-[1.05] tracking-tight sm:text-5xl">
              {recipe.title}
            </h1>
            {recipe.intro ? (
              <p className="mt-4 max-w-prose text-[15px] leading-7 text-muted-foreground">
                {recipe.intro}
              </p>
            ) : null}
            <MetaStrip
              className="mt-7"
              items={[
                { label: "Prep", value: recipe.prep },
                { label: "Cook", value: recipe.cook },
                { label: "Yield", value: recipe.serves },
              ]}
            />
          </header>

          {/* Rating and editing — the recipe's own page in the studio log */}
          <section className="mt-7 border-y border-border/70 py-5">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Your rating
                </p>
                <StarRating
                  value={recipe.rating}
                  onChange={(rating) => void handleRating(rating)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {recipe.rating
                    ? "Tap a star to change it — the ✕ clears it."
                    : "Tap a star to give it one to five."}
                </p>
              </div>
              <Link
                to={`/recipes/${recipe.slug}/edit`}
                className={`inline-flex min-h-11 items-center border border-foreground/25 px-4 text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-foreground/60 hover:bg-foreground/5 ${navLinkClass}`}
              >
                Edit this recipe
              </Link>
            </div>
          </section>

          {/* Ingredients */}
          <section className="mt-12">
            <SectionLabel>Ingredients</SectionLabel>
            <div className="mt-5 border border-border/80 bg-card p-5 sm:p-7">
              {recipe.ingredients.map((group, groupIndex) => (
                <div
                  key={group.section ?? "ingredients"}
                  className={groupIndex > 0 ? "mt-7" : undefined}
                >
                  {group.section ? (
                    <p className="font-display text-[15px] italic text-muted-foreground">
                      {group.section}
                    </p>
                  ) : null}
                  <ul className={group.section ? "mt-2" : undefined}>
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="border-t border-border/60 py-2.5 text-[15px] leading-6 first:border-t-0 first:pt-0"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Method */}
          <section className="mt-12">
            <SectionLabel>Method</SectionLabel>
            <ol className="mt-5">
              {recipe.steps.map((step, index) => (
                <li
                  key={step}
                  className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-t border-border/60 py-5 first:border-t-0 first:pt-4"
                >
                  <span
                    aria-hidden
                    className="font-display text-xl leading-6 text-muted-foreground"
                  >
                    {index + 1}
                  </span>
                  <p className="max-w-prose text-[15px] leading-7">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Tips */}
          {recipe.tips && recipe.tips.length > 0 ? (
            <section className="mt-12">
              <SectionLabel>From the kitchen</SectionLabel>
              <div className="mt-5 border border-border/80 bg-secondary/60 p-5 sm:p-6">
                <ul className="space-y-3.5">
                  {recipe.tips.map((tip) => (
                    <li key={tip} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-[0.6rem] size-1 shrink-0 rounded-full bg-foreground/30"
                      />
                      <p className="max-w-prose text-[14px] leading-6 text-foreground/85">
                        {tip}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 ${navLinkClass}`}
            >
              <span aria-hidden>←</span> Today&apos;s special
            </Link>
            <Link
              to="/recipes"
              className={`inline-flex items-center gap-2 ${navLinkClass}`}
            >
              The database <span aria-hidden>→</span>
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
