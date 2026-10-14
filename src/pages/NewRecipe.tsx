import { api } from "@/convex/_generated/api";
import { SiteFooter, SiteHeader, navLinkClass } from "@/components/RecipeUI";
import { RecipeForm, type RecipeFormValues } from "@/components/RecipeForm";
import { useMutation } from "convex/react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

/**
 * Add a recipe to the database. The form itself (photo, category shelf,
 * lists) lives in RecipeForm — this screen only wires it to the database.
 */
export default function NewRecipe() {
  const navigate = useNavigate();
  const addRecipe = useMutation(api.recipes.addRecipe);

  const handleSubmit = async (values: RecipeFormValues) => {
    const { slug } = await addRecipe({
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

    toast.success("Saved to the database");
    navigate(`/recipes/${slug}`, { replace: true });
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

        <RecipeForm
          submitLabel="Save to the database"
          onSubmit={handleSubmit}
          cancelTo="/recipes"
        />
      </main>

      <SiteFooter />
    </div>
  );
}
