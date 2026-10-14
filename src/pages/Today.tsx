import { api } from "@/convex/_generated/api";
import {
  FramedPhoto,
  MetaStrip,
  PageSkeleton,
  RecipeCard,
  SectionLabel,
  SiteFooter,
  SiteHeader,
  navLinkClass,
} from "@/components/RecipeUI";
import {
  builtinRecipes,
  formatDate,
  kickerLine,
  resolvePhoto,
  todaysRecipe,
} from "@/data/recipes";
import { docToRecipe } from "@/lib/recipe-doc";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery } from "convex/react";
import { Link } from "react-router";

/**
 * The first screen. On a phone it opens straight onto today's special —
 * one photo, the story, the timings — with the rest of the collection
 * a short scroll below.
 */
export default function Today() {
  const reduceMotion = useReducedMotion();
  const stored = useQuery(api.recipes.list);
  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.55,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  if (stored === undefined) return <PageSkeleton />;

  const collection = [...builtinRecipes, ...stored.map(docToRecipe)];
  const today = todaysRecipe(collection);

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
        {/* Today's special */}
        <motion.section {...rise(0)} className="pt-7 sm:pt-12">
          <div className="flex items-baseline gap-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              The special today
            </p>
            <span className="h-px flex-1 bg-border" />
            <p className="text-[11px] text-muted-foreground">{formatDate()}</p>
          </div>

          <Link
            to={`/recipes/${today.slug}`}
            className="mt-5 block transition-opacity hover:opacity-95"
            aria-label={`Open the recipe for ${today.title}`}
          >
            <FramedPhoto
              src={resolvePhoto(today.photo, 1600)}
              alt={today.photo.alt}
              focus={today.photo.focus}
              ratio="aspect-[4/5] sm:aspect-[3/2]"
              priority
            />
          </Link>

          <p className="mt-6 font-display text-sm italic text-muted-foreground">
            {kickerLine(today)}
          </p>
          <h1 className="mt-2 font-display text-[2.4rem] leading-[1.04] tracking-tight sm:text-6xl">
            {today.title}
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-7 text-muted-foreground">
            {today.intro}
          </p>

          <MetaStrip
            className="mt-7"
            items={[
              { label: "Prep", value: today.prep },
              { label: "Cook", value: today.cook },
              { label: "Yield", value: today.serves },
            ]}
          />

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              to={`/recipes/${today.slug}`}
              className="inline-flex min-h-11 items-center justify-center bg-primary px-7 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Cook this today
            </Link>
            <p className="text-xs text-muted-foreground">
              Rotates daily · {collection.length} recipes in the studio
            </p>
          </div>
        </motion.section>

        {/* The collection */}
        <motion.section
          {...rise(0.08)}
          id="collection"
          className="mt-16 scroll-mt-20 sm:mt-24"
        >
          <SectionLabel
            right={
              <Link
                to="/recipes"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {collection.length} recipes →
              </Link>
            }
          >
            The collection
          </SectionLabel>
          <p className="mt-4 max-w-prose text-sm leading-6 text-muted-foreground">
            Everything that has been digitized so far, from the weekend table to
            the five-minute lunch.
          </p>

          <ul className="mt-7 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {collection.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  badge={recipe.id === today.id ? "Today" : undefined}
                />
              </li>
            ))}
          </ul>
        </motion.section>
      </main>

      <SiteFooter />
    </div>
  );
}
