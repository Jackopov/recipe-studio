export type IngredientGroup = {
  /** Optional group heading, e.g. "For the batter". */
  section?: string;
  items: string[];
};

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  /** Small editorial label above the title, e.g. "Breakfast". */
  kicker: string;
  /** One-line italic subtitle. */
  note: string;
  /** Short editorial intro shown under the title. */
  intro: string;
  photo: {
    /** Base URL of the photo (Unsplash CDN, sized on render). */
    src: string;
    alt: string;
    /** CSS object-position for cropping. */
    focus?: string;
  };
  prep: string;
  cook: string;
  serves: string;
  ingredients: IngredientGroup[];
  steps: string[];
  tips?: string[];
};

export const recipes: Recipe[] = [
  {
    id: "1",
    slug: "lemon-ricotta-pancakes",
    title: "Lemon Ricotta Pancakes",
    kicker: "Breakfast",
    note: "For slow, bright mornings",
    intro:
      "Tall and tender with a faint lemon lift — these are the pancakes we make when the morning is slow enough to warrant it. The ricotta keeps them soft for a long time, so nobody has to eat standing at the stove.",
    photo: {
      src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
      alt: "A stack of pancakes with fresh berries on a plate",
      focus: "center",
    },
    prep: "10 min",
    cook: "15 min",
    serves: "Makes 12",
    ingredients: [
      {
        section: "For the batter",
        items: [
          "250 g whole-milk ricotta",
          "3 eggs, separated",
          "¾ cup (95 g) all-purpose flour",
          "1 tbsp baking powder",
          "2 tbsp caster sugar",
          "Zest of 1 lemon",
          "¼ tsp fine salt",
          "2 tbsp butter, melted, plus extra for the pan",
        ],
      },
      {
        section: "To serve",
        items: [
          "1 cup fresh berries",
          "2 tbsp maple syrup",
          "A spoonful of ricotta and more lemon zest",
        ],
      },
    ],
    steps: [
      "Whisk the ricotta, egg yolks, melted butter and lemon zest in a large bowl until smooth.",
      "Stir in the flour, sugar, baking powder and salt until just combined — a few lumps are fine.",
      "Beat the egg whites to soft peaks in a separate bowl, then fold them through in two additions. This is what makes them tall.",
      "Rest the batter for 5 minutes while the pan heats over medium-low heat.",
      "Butter the pan lightly. Drop ¼-cup mounds of batter and cook 2–3 minutes, until the edges look set and bubbles surface. Flip gently and cook 1–2 minutes more.",
      "Serve in a stack with berries, a spoon of ricotta and a slow pour of maple syrup.",
    ],
    tips: [
      "Drain the ricotta in a sieve if it looks watery — wet ricotta makes flat pancakes.",
      "Keep the heat at medium-low. Browned before cooked through is the classic mistake.",
      "The batter holds for an hour in the fridge; fold the whites in just before cooking.",
    ],
  },
  {
    id: "2",
    slug: "roasted-tomato-orzo",
    title: "Roasted Tomato Orzo",
    kicker: "Supper",
    note: "One tray, one pot",
    intro:
      "Cherry tomatoes collapse into something jammy and sweet, then get tossed through orzo that has cooked in stock until it turns creamy on its own. It tastes like an afternoon of work.",
    photo: {
      src: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
      alt: "A pan of orzo with roasted cherry tomatoes and basil",
      focus: "center",
    },
    prep: "10 min",
    cook: "35 min",
    serves: "Serves 4",
    ingredients: [
      {
        section: "For the tomatoes",
        items: [
          "500 g cherry tomatoes",
          "4 garlic cloves, skins on",
          "6 tbsp olive oil",
          "1 tsp flaky salt",
          "Black pepper",
        ],
      },
      {
        section: "For the orzo",
        items: [
          "300 g orzo",
          "1.2 L vegetable stock",
          "1 lemon, zest and juice",
          "50 g parmesan, grated",
          "A large handful of basil",
          "Chilli flakes, to finish (optional)",
        ],
      },
    ],
    steps: [
      "Heat the oven to 200°C (400°F). Tip the tomatoes into a roasting tray with the garlic, olive oil, salt and a grind of pepper.",
      "Roast for 25–30 minutes, until the tomatoes have burst and their skins have caught at the edges.",
      "Meanwhile, simmer the orzo in the stock, stirring often, until just tender and the liquid is nearly absorbed — 8–10 minutes.",
      "Squeeze the soft garlic from its skins into the tomatoes and crush everything together with a fork.",
      "Fold the orzo through the tomatoes with the lemon zest, juice and parmesan. Loosen with a splash of hot water if it tightens.",
      "Tear over the basil, add chilli flakes and one last thread of olive oil.",
    ],
    tips: [
      "Roast until truly blistered — pale tomatoes taste like plain tomatoes.",
      "The orzo keeps drinking the sauce as it sits; keep a kettle of hot water nearby when reheating.",
      "Leftovers make a fine cold lunch the next day, with extra lemon.",
    ],
  },
  {
    id: "3",
    slug: "lemony-chickpea-herb-salad",
    title: "Lemony Chickpea & Herb Salad",
    kicker: "Lunch",
    note: "The fridge-clearing bowl that stayed",
    intro:
      "Herbs by the fistful, feta in rubble, and enough lemon to wake up whatever else is in the crisper. It comes together in the time it takes the kettle to boil and keeps well for days.",
    photo: {
      src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
      alt: "A bowl of chickpea salad with fresh herbs and vegetables",
      focus: "center",
    },
    prep: "15 min",
    cook: "No cook",
    serves: "Serves 2–3",
    ingredients: [
      {
        section: "For the salad",
        items: [
          "2 cans chickpeas, drained and rinsed",
          "1 small cucumber",
          "200 g cherry tomatoes",
          "½ red onion",
          "A large bunch of parsley",
          "A large bunch of mint",
          "150 g feta",
        ],
      },
      {
        section: "For the dressing",
        items: [
          "3 tbsp olive oil",
          "Juice of 1 lemon",
          "1 tsp honey",
          "1 tsp Dijon mustard",
          "Salt and black pepper",
        ],
      },
    ],
    steps: [
      "Whisk the dressing in the bottom of a large bowl: olive oil, lemon juice, honey, Dijon, a good pinch of salt and plenty of pepper.",
      "Cut the cucumber and tomatoes into bite-size pieces and slice the onion as thinly as you can. Add them to the bowl with the chickpeas.",
      "Chop the herbs roughly — stems and all — and fold everything together with half the feta.",
      "Let it sit for 10 minutes so the chickpeas take on the dressing, then taste and correct the salt and lemon.",
      "Crumble the rest of the feta over the top, with one more thread of olive oil.",
    ],
    tips: [
      "Dry the chickpeas properly; wet chickpeas water down the dressing.",
      "Add the mint at the very end so it stays bright.",
      "Keeps two days covered in the fridge — add fresh herbs before serving again.",
    ],
  },
];

/** Resolve a recipe by its URL slug. */
export function recipeBySlug(slug?: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.slug === slug);
}

/**
 * The special of the day. Deterministic on the calendar date, so the same
 * recipe is shown all day and it rotates at midnight — no server needed.
 */
export function todaysRecipe(date: Date = new Date()): Recipe {
  const dayIndex = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return recipes[dayIndex % recipes.length] ?? recipes[0]!;
}

/** e.g. "Sunday, 12 October" in the user's locale. */
export function formatDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/** Size a CDN photo for its context. */
export function photoSrc(base: string, width: number): string {
  return `${base}?q=80&w=${width}&auto=format&fit=crop`;
}
