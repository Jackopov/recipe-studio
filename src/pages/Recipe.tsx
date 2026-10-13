import {
  FramedPhoto,
  MetaStrip,
  SectionLabel,
  SiteFooter,
  SiteHeader,
} from "@/components/RecipeUI";
import { photoSrc, recipeBySlug } from "@/data/recipes";
import { Link, useParams } from "react-router";

/**
 * The recipe itself: photo, story, timings, then ingredients, method and a
 * few notes from the kitchen. One long, quiet scroll — sized for a phone
 * held in one hand at the stove.
 */
export default function RecipePage() {
  const { slug } = useParams();
  const recipe = recipeBySlug(slug);

  if (!recipe) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-5 py-24">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Not in the collection
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight">
            That recipe has wandered off.
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-7 text-muted-foreground">
            It may have been renamed, or the link is slightly off.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex min-h-11 items-center justify-center bg-primary px-7 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back to today&apos;s special
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        right={
          <Link
            to="/"
            className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            All recipes
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5">
        <nav className="pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden>←</span> The collection
          </Link>
        </nav>

        <article>
          <div className="mt-5">
            <FramedPhoto
              src={photoSrc(recipe.photo.src, 1600)}
              alt={recipe.photo.alt}
              focus={recipe.photo.focus}
              ratio="aspect-[4/5] sm:aspect-[3/2]"
              priority
            />
          </div>

          <header className="mt-7">
            <p className="font-display text-sm italic text-muted-foreground">
              {recipe.kicker} · {recipe.note}
            </p>
            <h1 className="mt-2 font-display text-[2.25rem] leading-[1.05] tracking-tight sm:text-5xl">
              {recipe.title}
            </h1>
            <p className="mt-4 max-w-prose text-[15px] leading-7 text-muted-foreground">
              {recipe.intro}
            </p>
            <MetaStrip
              className="mt-7"
              items={[
                { label: "Prep", value: recipe.prep },
                { label: "Cook", value: recipe.cook },
                { label: "Yield", value: recipe.serves },
              ]}
            />
          </header>

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

          <div className="mt-14 border-t border-border/70 pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <span aria-hidden>←</span> Back to all recipes
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
