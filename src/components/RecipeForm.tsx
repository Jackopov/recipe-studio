import { SectionLabel, navLinkClass } from "@/components/RecipeUI";
import {
  RECIPE_CATEGORIES,
  type IngredientGroup,
  type RecipeCategory,
} from "@/data/recipes";
import { prepareImage } from "@/lib/image";
import { lines, parseIngredients } from "@/lib/recipe-text";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { Link } from "react-router";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

const labelClass =
  "text-[10px] uppercase tracking-[0.22em] text-muted-foreground";
const inputClass =
  "mt-2 min-h-11 w-full border border-border bg-card px-3.5 text-[15px] leading-6 text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-foreground/50";
const textareaClass = `${inputClass} min-h-32 resize-y py-3`;

/** What the form sends back once validated — ready for a Convex mutation. */
export type RecipeFormValues = {
  title: string;
  category: RecipeCategory;
  note: string;
  intro: string;
  /** Set when a new photo was picked (already uploaded to storage). */
  photoStorageId?: string;
  /** Set when an external image link is used (or kept). */
  photoUrl?: string;
  prep: string;
  cook: string;
  serves: string;
  ingredients: IngredientGroup[];
  steps: string[];
  tips: string[];
};

/** Values used to prefill the form when editing an existing recipe. */
export type RecipeFormInitial = {
  title: string;
  category: RecipeCategory | null;
  note: string;
  intro: string;
  /** Resolved URL of the current photo, shown as a preview. */
  photoSrc?: string;
  /** True when the current photo is an external link (not an upload). */
  photoIsExternal: boolean;
  prep: string;
  cook: string;
  serves: string;
  ingredientsText: string;
  stepsText: string;
  tipsText: string;
};

/**
 * The one form behind "Add a recipe" and "Edit recipe": photo from the
 * phone's library (resized before upload), category shelf, then the lists.
 * Uploads the photo itself and hands validated values to `onSubmit`.
 */
export function RecipeForm({
  initial,
  submitLabel,
  photoRequired = true,
  onSubmit,
  cancelTo,
  footer,
}: {
  initial?: RecipeFormInitial;
  submitLabel: string;
  /** Creating requires a photo; editing can keep the current one. */
  photoRequired?: boolean;
  onSubmit: (values: RecipeFormValues) => Promise<void>;
  cancelTo: string;
  /** Extra content below the submit row (e.g. the delete block). */
  footer?: ReactNode;
}) {
  const generateUploadUrl = useMutation(api.recipes.generateUploadUrl);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<RecipeCategory | null>(
    initial?.category ?? null,
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [intro, setIntro] = useState(initial?.intro ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState(
    initial?.photoIsExternal ? (initial.photoSrc ?? "") : "",
  );
  const [prep, setPrep] = useState(initial?.prep ?? "");
  const [cook, setCook] = useState(initial?.cook ?? "");
  const [serves, setServes] = useState(initial?.serves ?? "");
  const [ingredientsText, setIngredientsText] = useState(
    initial?.ingredientsText ?? "",
  );
  const [stepsText, setStepsText] = useState(initial?.stepsText ?? "");
  const [tipsText, setTipsText] = useState(initial?.tipsText ?? "");

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
      } else if (photoRequired) {
        throw new Error("Add a photo — upload one or paste an image link.");
      }

      await onSubmit({
        title: title.trim(),
        category,
        note: note.trim(),
        intro: intro.trim(),
        photoStorageId,
        photoUrl: externalUrl,
        prep: prep.trim(),
        cook: cook.trim(),
        serves: serves.trim(),
        ingredients,
        steps,
        tips: lines(tipsText),
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
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
              <span className="normal-case tracking-normal">(optional)</span>
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
              <span className="normal-case tracking-normal">(optional)</span>
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
          {initial?.photoSrc && !file ? (
            <div className="flex items-center gap-4 border border-border/60 bg-secondary/40 p-3">
              <img
                src={initial.photoSrc}
                alt=""
                className="size-16 shrink-0 object-cover"
              />
              <p className="min-w-0 text-xs leading-5 text-muted-foreground">
                Current photo — choose a new one or paste a link to replace it.
              </p>
            </div>
          ) : null}

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
                {file
                  ? file.name
                  : initial?.photoSrc
                    ? "Choose a replacement photo"
                    : "Choose a photo"}
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                From your photo library — resized automatically before upload.
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
            submitLabel
          )}
        </button>
        <Link to={cancelTo} className={navLinkClass}>
          Cancel
        </Link>
      </div>

      {footer}
    </form>
  );
}
