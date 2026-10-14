import { api } from "@/convex/_generated/api";
import {
  PageSkeleton,
  RecipeCard,
  SectionLabel,
  SiteFooter,
  SiteHeader,
  navLinkClass,
} from "@/components/RecipeUI";
import {
  RECIPE_CATEGORIES,
  builtinRecipes,
  type Recipe,
  type RecipeCategory,
} from "@/data/recipes";
import { docToRecipe } from "@/lib/recipe-doc";
import { useQuery } from "convex/react";
import { useState } from "react";
import { Link } from "react-router";

type Filter = RecipeCategory | "all";

/**
 * The recipe database: everything in one place, sorted into the five shelves —
 * breakfast, lunch, snack, soup and dessert. The Add button in the masthead
 * is always one tap away.
 */
export default function RecipesDatabase() {
  const stored = useQuery(api.recipes.list);
  const [filter, setFilter] = useState<Filter>("all");

  const collection: Recipe[] | null =
    stored === undefined
      ? null
      : [...builtinRecipes, ...stored.map(docToRecipe)];

  if (!collection) return <PageSkeleton />;

  const counts = new Map<RecipeCategory, number>();
  for (const recipe of collection) {
    counts.set(recipe.category, (counts.get(recipe.category) ?? 0) + 1);
  }
  const shown =
    filter === "all"
      ? collection
      : collection.filter((recipe) => recipe.category === filter);
  const filterLabel =
    filter === "all"
      ? "Every shelf"
      : RECIPE_CATEGORIES.find((category) => category.id === filter)!.label;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        nav={
          <Link to="/" className={navLinkClass}>
            Today
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5">
        <header className="pt-7 sm:pt-12">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            The collection, complete
          </p>
          <h1 className="mt-2 font-display text-[2.4rem] leading-[1.04] tracking-tight sm:text-6xl">
            The database
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-7 text-muted-foreground">
            Every recipe kept in the studio, sorted into shelves. Add yours with
            the button in the corner — it stays there on every screen.
          </p>
        </header>

        {/* Category shelves */}
        <div className="-mx-5 mt-7 overflow-x-auto px-5 pb-1">
          <div className="flex w-max items-center gap-2">
            <FilterChip
              active={filter === "all"}
              label="All"
              count={collection.length}
              onClick={() => setFilter("all")}
            />
            {RECIPE_CATEGORIES.map((category) => (
              <FilterChip
                key={category.id}
                active={filter === category.id}
                label={category.label}
                count={counts.get(category.id) ?? 0}
                onClick={() => setFilter(category.id)}
              />
            ))}
          </div>
        </div>

        <section className="mt-9 pb-4">
          <SectionLabel
            right={`${shown.length} ${shown.length === 1 ? "recipe" : "recipes"}`}
          >
            {filterLabel}
          </SectionLabel>

          {shown.length > 0 ? (
            <ul className="mt-7 grid gap-8 sm:grid-cols-3 sm:gap-6">
              {shown.map((recipe) => (
                <li key={recipe.id}>
                  <RecipeCard recipe={recipe} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-7 border border-border/80 bg-card px-5 py-10 text-center sm:px-8">
              <p className="font-display text-xl tracking-tight">
                Nothing on this shelf yet.
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                The first recipe you add to {filterLabel.toLowerCase()} will
                live here.
              </p>
              <Link
                to="/recipes/new"
                className="mt-6 inline-flex min-h-11 items-center justify-center bg-primary px-7 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Add a recipe
              </Link>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 border px-4 text-[11px] uppercase tracking-[0.18em] transition-colors ${
        active
          ? "border-foreground/70 bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {label}
      <span
        className={active ? "text-background/60" : "text-muted-foreground/60"}
      >
        {count}
      </span>
    </button>
  );
}
