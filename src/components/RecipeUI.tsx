import { categoryLabel, resolvePhoto, type Recipe } from "@/data/recipes";
import { Plus } from "lucide-react";
import { Link } from "react-router";

/**
 * Small editorial building blocks shared by the recipe screens: the masthead,
 * the gallery-style photo frame, section labels, the meta strip and the card
 * used by both the homepage collection and the database.
 */

/** Shared style for quiet text links next to the Add button. */
export const navLinkClass =
  "text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground";

export function SiteHeader({ nav }: { nav?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex min-h-14 w-full max-w-3xl items-center justify-between gap-3 px-5 pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
        <Link to="/" className="group inline-flex items-center gap-2.5">
          <span className="flex size-5 items-center justify-center border border-foreground/40 transition-colors group-hover:border-foreground/70">
            <span className="size-1.5 rounded-full bg-foreground/70" />
          </span>
          <span className="font-display text-[15px] tracking-tight">
            Recipe Studio
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          {nav}
          <Link
            to="/recipes/new"
            aria-label="Add a recipe"
            className="inline-flex min-h-11 items-center gap-1.5 border border-foreground/25 px-3 text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground/60 hover:bg-foreground/5 sm:px-4"
          >
            <Plus className="size-3.5" aria-hidden />
            Add
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-3xl flex-col gap-1.5 px-5 py-8 pb-[calc(env(safe-area-inset-bottom)+2rem)] text-[11px] leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-[13px] italic">Kept close at hand.</p>
        <p>
          Photography via Unsplash · Add to your Home Screen for a full-screen
          view.
        </p>
      </div>
    </footer>
  );
}

/** A photo matted inside a thin frame, like a print on a gallery wall. */
export function FramedPhoto({
  src,
  alt,
  focus,
  ratio,
  priority = false,
}: {
  src: string;
  alt: string;
  focus?: string;
  /** Tailwind aspect utility, e.g. "aspect-[4/5]". */
  ratio: string;
  priority?: boolean;
}) {
  return (
    <figure className="border border-border/80 bg-card p-2 sm:p-2.5">
      <div className={`relative overflow-hidden bg-secondary ${ratio}`}>
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 size-full object-cover"
          style={focus ? { objectPosition: focus } : undefined}
          onError={(event) => {
            // If the photo fails to load, the warm mat remains and the frame
            // still reads as intentional.
            event.currentTarget.style.display = "none";
          }}
        />
      </div>
    </figure>
  );
}

/** A tracked-out label with a hairline rule — the app's section heading. */
export function SectionLabel({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {children}
      </span>
      <span className="h-px flex-1 bg-border" />
      {right ? (
        <span className="text-[11px] text-muted-foreground">{right}</span>
      ) : null}
    </div>
  );
}

/** Prep / cook / serves, split into equal columns with hairline dividers. */
export function MetaStrip({
  items,
  className = "",
}: {
  items: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <dl className={`grid grid-cols-3 border-y border-border/70 ${className}`}>
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`px-2 py-3 text-center ${index > 0 ? "border-l border-border/70" : ""}`}
        >
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 font-display text-[15px] leading-tight">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The card shared by the homepage collection and the database. */
export function RecipeCard({
  recipe,
  badge,
}: {
  recipe: Recipe;
  /** Small extra label after the category, e.g. "Today". */
  badge?: string;
}) {
  const times = [
    recipe.prep !== "—" ? `${recipe.prep} prep` : null,
    recipe.cook !== "—" ? `${recipe.cook} cook` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link to={`/recipes/${recipe.slug}`} className="group block">
      <div className="border border-border/80 bg-card p-1.5 transition-colors group-hover:border-foreground/35">
        <div className="relative aspect-[3/2] overflow-hidden bg-secondary">
          <img
            src={resolvePhoto(recipe.photo, 800)}
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
        {categoryLabel(recipe.category)}
        {badge ? ` · ${badge}` : ""}
      </p>
      <h3 className="mt-1.5 font-display text-lg leading-snug tracking-tight">
        {recipe.title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {times || "Open the recipe"}
      </p>
    </Link>
  );
}

/** Shown while the recipe database is loading — matches the page it stands in for. */
export function PageSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5">
        <div className="pt-7 sm:pt-12">
          <div className="aspect-[4/5] animate-pulse bg-secondary sm:aspect-[3/2]" />
          <div className="mt-6 h-4 w-40 animate-pulse bg-secondary" />
          <div className="mt-3 h-9 w-3/4 animate-pulse bg-secondary" />
          <div className="mt-5 space-y-2">
            <div className="h-4 w-full animate-pulse bg-secondary" />
            <div className="h-4 w-5/6 animate-pulse bg-secondary" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
