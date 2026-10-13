import {
  FramedPhoto,
  MetaStrip,
  SectionLabel,
  SiteFooter,
  SiteHeader,
} from "@/components/RecipeUI";
import {
  formatDate,
  photoSrc,
  recipes,
  todaysRecipe,
  type Recipe,
} from "@/data/recipes";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router";

/**
 * The first screen. On a phone it opens straight onto today's special —
 * one photo, the story, the timings — with the rest of the collection
 * a short scroll below.
 */
export default function Today() {
  const reduceMotion = useReducedMotion();
  const today = todaysRecipe();
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

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        right={
          <a
            href="#collection"
            className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Collection
          </a>
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
              src={photoSrc(today.photo.src, 1600)}
              alt={today.photo.alt}
              focus={today.photo.focus}
              ratio="aspect-[4/5] sm:aspect-[3/2]"
              priority
            />
          </Link>

          <p className="mt-6 font-display text-sm italic text-muted-foreground">
            {today.kicker} · {today.note}
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
              Rotates daily · {recipes.length} recipes in the studio
            </p>
          </div>
        </motion.section>

        {/* The collection */}
        <motion.section
          {...rise(0.08)}
          id="collection"
          className="mt-16 scroll-mt-20 sm:mt-24"
        >
          <SectionLabel right={`${recipes.length} recipes`}>
            The collection
          </SectionLabel>
          <p className="mt-4 max-w-prose text-sm leading-6 text-muted-foreground">
            Everything that has been digitized so far, from the weekend table to
            the five-minute lunch.
          </p>

          <ul className="mt-7 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <CollectionCard
                  recipe={recipe}
                  isToday={recipe.id === today.id}
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

function CollectionCard({
  recipe,
  isToday,
}: {
  recipe: Recipe;
  isToday: boolean;
}) {
  return (
    <Link to={`/recipes/${recipe.slug}`} className="group block">
      <div className="border border-border/80 bg-card p-1.5 transition-colors group-hover:border-foreground/35">
        <div className="relative aspect-[3/2] overflow-hidden bg-secondary">
          <img
            src={photoSrc(recipe.photo.src, 800)}
            alt={recipe.photo.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            style={
              recipe.photo.focus
                ? { objectPosition: recipe.photo.focus }
                : undefined
            }
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {recipe.kicker}
        {isToday ? " · Today" : ""}
      </p>
      <h3 className="mt-1.5 font-display text-lg leading-snug tracking-tight">
        {recipe.title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {recipe.prep} prep · {recipe.cook} cook
      </p>
    </Link>
  );
}
