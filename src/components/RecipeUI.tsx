import { Link } from "react-router";

/**
 * Small editorial building blocks shared by the recipe screens: the masthead,
 * the gallery-style photo frame, section labels and the meta strip. Everything
 * is built on hairline rules and warm paper so the app reads like a folio.
 */

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex min-h-14 w-full max-w-3xl items-center justify-between gap-4 px-5 pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
        <Link to="/" className="group inline-flex items-center gap-2.5">
          <span className="flex size-5 items-center justify-center border border-foreground/40 transition-colors group-hover:border-foreground/70">
            <span className="size-1.5 rounded-full bg-foreground/70" />
          </span>
          <span className="font-display text-[15px] tracking-tight">
            Recipe Studio
          </span>
        </Link>
        {right}
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
