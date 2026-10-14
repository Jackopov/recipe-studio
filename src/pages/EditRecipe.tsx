import { api } from "@/convex/_generated/api";
import {
  PageSkeleton,
  SectionLabel,
  SiteFooter,
  SiteHeader,
  navLinkClass,
} from "@/components/RecipeUI";
import {
  RecipeForm,
  type RecipeFormInitial,
  type RecipeFormValues,
} from "@/components/RecipeForm";
import { serializeIngredients } from "@/lib/recipe-text";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

/**
 * Edit a recipe that lives in the database — same form as adding one, filled
 * in — with the removal option at the very bottom, behind a confirmation.
 */
export default function EditRecipe() {
  const { slug } = useParams();
  const stored = useQuery(api.recipes.getBySlug, { slug: slug ?? "" });
  const navigate = useNavigate();
  const updateRecipe = useMutation(api.recipes.updateRecipe);
  const deleteRecipe = useMutation(api.recipes.deleteRecipe);

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (stored === undefined) return <PageSkeleton />;

  if (!stored) {
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
            Nothing here to edit.
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-7 text-muted-foreground">
            The recipe may have been renamed or removed, or the link is slightly
            off.
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

  const initial: RecipeFormInitial = {
    title: stored.title,
    category: stored.category,
    note: stored.note ?? "",
    intro: stored.intro ?? "",
    photoSrc: stored.photoUrl ?? undefined,
    // When there is no uploaded file, photoUrl holds the external link.
    photoIsExternal: !stored.photoStorageId,
    prep: stored.prep ?? "",
    cook: stored.cook ?? "",
    serves: stored.serves ?? "",
    ingredientsText: serializeIngredients(stored.ingredients),
    stepsText: stored.steps.join("\n"),
    tipsText: (stored.tips ?? []).join("\n"),
  };

  const handleSubmit = async (values: RecipeFormValues) => {
    const { slug: keptSlug } = await updateRecipe({
      recipeId: stored._id,
      title: values.title,
      category: values.category,
      note: values.note || undefined,
      intro: values.intro || undefined,
      photoStorageId: values.photoStorageId,
      photoUrl: values.photoUrl,
      prep: values.prep || undefined,
      cook: values.cook || undefined,
      serves: values.serves || undefined,
      ingredients: values.ingredients,
      steps: values.steps,
      tips: values.tips.length > 0 ? values.tips : undefined,
    });

    toast.success("Changes saved");
    navigate(`/recipes/${keptSlug}`, { replace: true });
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteRecipe({ recipeId: stored._id });
      toast.success("Recipe removed from the database");
      navigate("/recipes", { replace: true });
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Something went wrong.",
      );
      setDeleting(false);
      setConfirming(false);
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
            to={`/recipes/${stored.slug}`}
            className={`inline-flex items-center gap-2 ${navLinkClass}`}
          >
            <span aria-hidden>←</span> {stored.title}
          </Link>
        </nav>

        <header className="mt-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Edit entry
          </p>
          <h1 className="mt-2 font-display text-[2.25rem] leading-[1.05] tracking-tight sm:text-5xl">
            {stored.title}
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-7 text-muted-foreground">
            Change anything that has drifted — the photo, the lists, the
            timings. The recipe keeps its link even if you rename it.
          </p>
        </header>

        <RecipeForm
          initial={initial}
          submitLabel="Save changes"
          photoRequired={false}
          onSubmit={handleSubmit}
          cancelTo={`/recipes/${stored.slug}`}
          footer={
            <section className="mt-14 border-t border-border/70 pt-8">
              <SectionLabel right="cannot be undone">
                Remove from the database
              </SectionLabel>
              <p className="mt-4 max-w-prose text-sm leading-6 text-muted-foreground">
                If this recipe is no longer needed, take it out of the
                collection — photo included.
              </p>
              {confirming ? (
                <div className="mt-5 border border-destructive/40 bg-destructive/5 p-4 sm:p-5">
                  <p className="font-display text-lg tracking-tight">
                    Remove &ldquo;{stored.title}&rdquo; for good?
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="inline-flex min-h-11 items-center justify-center bg-destructive px-6 text-[11px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {deleting ? "Removing…" : "Yes, delete it"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className={navLinkClass}
                    >
                      Keep it
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="mt-5 inline-flex min-h-11 items-center justify-center border border-destructive/50 px-6 text-[11px] uppercase tracking-[0.2em] text-destructive transition-colors hover:bg-destructive/10"
                >
                  Delete recipe
                </button>
              )}
            </section>
          }
        />
      </main>

      <SiteFooter />
    </div>
  );
}
