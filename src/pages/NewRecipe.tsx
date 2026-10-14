import { api } from "@/convex/_generated/api";
import {
  SiteFooter,
  SiteHeader,
  SectionLabel,
  navLinkClass,
} from "@/components/RecipeUI";
import {
  RECIPE_CATEGORIES,
  type IngredientGroup,
  type RecipeCategory,
} from "@/data/recipes";
import { prepareImage } from "@/lib/image";
import { useMutation } from "convex/react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const labelClass =
  "text-[10px] uppercase tracking-[0.22em] text-muted-foreground";
const inputClass =
  "mt-2 min-h-11 w-full border border-border bg-card px-3.5 text-[15px] leading-6 text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-foreground/50";
const textareaClass = `${inputClass} min-h-32 resize-y py-3`;

/** Split a textarea into clean non-empty lines. */
function lines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Parse the ingredients textarea. Lines starting with "#" open a new group,
 * everything else is an ingredient — so groups match the starter recipes.
 */
function parseIngredients(text: string): IngredientGroup[] {
  const groups: IngredientGroup[] = [];
  let current: IngredientGroup | undefined;
  for (const line of lines(text)) {
    if (line.startsWith("#")) {
      current = { section: line.replace(/^#+\s*/, "") || undefined, items: [] };
      groups.push(current);
    } else {
      if (!current) {
        current = { items: [] };
        groups.push(current);
      }
      current.items.push(line);
    }
  }
  return groups;
}

/**
 * Add a recipe to the database. One screen, phone-first: photo from the
 * library (resized before upload), category shelf, then the lists.
 */
export default function NewRecipe() {
  const navigate = useNavigate();
  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);
  const addRecipe = useMutation(api.recipes.addRecipe);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<RecipeCategory | null>(null);
  const [note, setNote] = useState("");
  const [intro, setIntro] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [prep, setPrep] = useState("");
  const [cook, setCook] = useState("");
  const [serves, setServes] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [tipsText, setTipsText] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    // Revoke the previous preview when the file changes or the page unmounts.
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      if (!title.trim()) throw new Error("Give the recipe a title.");
      if (!category) throw new Error("Pick a category for it.");

      const ingredients = parseIngredients(ingredientsText);
      if (ingredients.length === 0) {
        throw new Error("Add at least one ingredient.");
      }
      const steps = lines(stepsText);
      if (steps.length === 0) {
        throw new Error("Add at least one instruction step.");
      }

      let photoStorageId: string | undefined;
      let externalUrl: string | undefined;
      if (file) {
        const uploadUrl = await generateUploadUrl();
        const blob = await prepareImage(file);
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type || "image/jpeg" },
          body: blob,
        });
        if (!response.ok) {
          throw new Error("The photo could not be uploaded. Please try again.");
        }
        const { storageId } = (await response.json()) as { storageId: string };
        photoStorageId = storageId;
      } else if (photoUrl.trim()) {
        externalUrl = photoUrl.trim();
      } else {
        throw new Error("Add a photo — upload one or paste an image link.");
      }

      const tips = lines(tipsText);
      const { slug } = await addRecipe({
        title: title.trim(),
        category,
        note: note.trim() || undefined,
        intro: intro.trim() || undefined,
        photoStorageId,
        photoUrl: externalUrl,
        prep: prep.trim() || undefined,
        cook: cook.trim() || undefined,
        serves: serves.trim() || undefined,
        ingredients,
        steps,
        tips: tips.length > 0 ? tips : undefined,
      });

      toast.success("Saved to the database");
      navigate(`/recipes/${slug}`, { replace: true });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
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

      <main className="mx-auto w-full max-w-2xl flex-1 px-5">
        <nav className="pt-6">
          <Link
            to="/recipes"
            className={`inline-flex items-center gap-2 ${navLinkClass}`}
          >
            <span aria-hidden>←</span> The database
          </Link>
        </nav>

        <header className="mt-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            New entry
          </p>
          <h1 className="mt-2 font-display text-[2.25rem] leading-[1.05] tracking-tight sm:text-5xl">
            Add a recipe
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-7 text-muted-foreground">
            One photo, the ingredients, the steps — and a shelf to file it on.
            Start an ingredient line with{" "}
            <span className="font-display italic">#</span> to give it a group
            heading.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-10 pb-4">
          {/* The dish */}
          <section>
            <SectionLabel>The dish</SectionLabel>
            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="title" className={labelClass}>
                  Title
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Grandma's apple cake"
                  className={inputClass}
                  autoComplete="off"
                />
              </div>

              <fieldset>
                <legend className={labelClass}>Category</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {RECIPE_CATEGORIES.map((option) => {
                    const active = category === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setCategory(option.id)}
                        className={`inline-flex min-h-11 items-center border px-4 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                          active
                            ? "border-foreground/70 bg-foreground text-background"
                            : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label htmlFor="note" className={labelClass}>
                  Subtitle{" "}
                  <span className="normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="For slow Sunday mornings"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="intro" className={labelClass}>
                  Short intro{" "}
                  <span className="normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="intro"
                  value={intro}
                  onChange={(event) => setIntro(event.target.value)}
                  placeholder="A sentence or two about why it earned its place."
                  className={`${textareaClass} min-h-24`}
                />
              </div>
            </div>
          </section>

          {/* Photo */}
          <section className="mt-12">
            <SectionLabel>Photo</SectionLabel>
            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-center gap-4 border border-border/80 bg-card p-3 transition-colors hover:border-foreground/40">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="size-16 shrink-0 object-cover"
                  />
                ) : (
                  <span className="flex size-16 shrink-0 items-center justify-center bg-secondary text-muted-foreground">
                    <ImageIcon className="size-5" aria-hidden />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-[14px]">
                    {file ? file.name : "Choose a photo"}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                    From your photo library — resized automatically before
                    upload.
                  </span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </label>

              <div>
                <label htmlFor="photoUrl" className={labelClass}>
                  …or paste an image link
                </label>
                <input
                  id="photoUrl"
                  value={photoUrl}
                  onChange={(event) => setPhotoUrl(event.target.value)}
                  placeholder="https://…"
                  inputMode="url"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Timings */}
          <section className="mt-12">
            <SectionLabel>Timings</SectionLabel>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <div>
                <label htmlFor="prep" className={labelClass}>
                  Prep
                </label>
                <input
                  id="prep"
                  value={prep}
                  onChange={(event) => setPrep(event.target.value)}
                  placeholder="10 min"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cook" className={labelClass}>
                  Cook
                </label>
                <input
                  id="cook"
                  value={cook}
                  onChange={(event) => setCook(event.target.value)}
                  placeholder="35 min"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="serves" className={labelClass}>
                  Yield
                </label>
                <input
                  id="serves"
                  value={serves}
                  onChange={(event) => setServes(event.target.value)}
                  placeholder="Serves 4"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Ingredients */}
          <section className="mt-12">
            <SectionLabel>Ingredients</SectionLabel>
            <textarea
              value={ingredientsText}
              onChange={(event) => setIngredientsText(event.target.value)}
              placeholder={"250 g ricotta\n3 eggs\n# To serve\n1 cup berries"}
              className={`${textareaClass} min-h-40 font-mono text-[13px]`}
              aria-label="Ingredients, one per line"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              One ingredient per line. A line starting with{" "}
              <span className="font-mono">#</span> opens a new group.
            </p>
          </section>

          {/* Method */}
          <section className="mt-12">
            <SectionLabel>Method</SectionLabel>
            <textarea
              value={stepsText}
              onChange={(event) => setStepsText(event.target.value)}
              placeholder={"Whisk everything together.\nBake for 35 minutes."}
              className={`${textareaClass} min-h-40`}
              aria-label="Method, one step per line"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              One step per line — they become the numbered method.
            </p>
          </section>

          {/* Tips */}
          <section className="mt-12">
            <SectionLabel right="optional">From the kitchen</SectionLabel>
            <textarea
              value={tipsText}
              onChange={(event) => setTipsText(event.target.value)}
              placeholder={"Best eaten warm.\nKeeps three days in a tin."}
              className={`${textareaClass} min-h-28`}
              aria-label="Tips, one per line"
            />
          </section>

          {error ? (
            <p
              role="alert"
              className="mt-8 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-8 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving
                </>
              ) : (
                "Save to the database"
              )}
            </button>
            <Link to="/recipes" className={navLinkClass}>
              Cancel
            </Link>
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
