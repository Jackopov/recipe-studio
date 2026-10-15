/**
 * The seed collection — the three recipes the studio opened with, now shipped
 * as plain static data. On first run the store copies them into
 * localStorage; after that the collection is whatever you have edited.
 */

/** The shelves in the recipe database. */
export const RECIPE_CATEGORIES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "snack", label: "Snack" },
  { id: "soup", label: "Soup" },
  { id: "dessert", label: "Dessert" },
];

export function categoryLabel(id) {
  return RECIPE_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

/** Newest first — same order the database returned them. */
export const SEED_RECIPES = [
  {
    id: "seed-lemony-chickpea-herb-salad",
    slug: "lemony-chickpea-herb-salad",
    title: "Lemony Chickpea & Herb Salad",
    category: "lunch",
    note: "The fridge-clearing bowl that stayed",
    intro:
      "Herbs by the fistful, feta in rubble, and enough lemon to wake up whatever else is in the crisper. It comes together in the time it takes the kettle to boil and keeps well for days.",
    photo: {
      src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
      alt: "Lemony Chickpea & Herb Salad",
      focus: "center",
      resize: true,
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
    rating: null,
    createdAt: 1792002252284,
  },
  {
    id: "seed-roasted-tomato-orzo",
    slug: "roasted-tomato-orzo",
    title: "Roasted Tomato Orzo",
    category: "lunch",
    note: "One tray, one pot",
    intro:
      "Cherry tomatoes collapse into something jammy and sweet, then get tossed through orzo that has cooked in stock until it turns creamy on its own. It tastes like an afternoon of work.",
    photo: {
      src: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601",
      alt: "Roasted Tomato Orzo",
      focus: "center",
      resize: true,
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
    rating: null,
    createdAt: 1792002251324,
  },
  {
    id: "seed-lemon-ricotta-pancakes",
    slug: "lemon-ricotta-pancakes",
    title: "Lemon Ricotta Pancakes",
    category: "breakfast",
    note: "For slow, bright mornings",
    intro:
      "Tall and tender with a faint lemon lift — these are the pancakes we make when the morning is slow enough to warrant it. The ricotta keeps them soft for a long time, so nobody has to eat standing at the stove.",
    photo: {
      src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
      alt: "Lemon Ricotta Pancakes",
      focus: "center",
      resize: true,
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
    rating: null,
    createdAt: 1792002250291,
  },
];

/** Small stable hash so the special of the day does not jump around. */
function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * The special of the day, picked from the whole collection. Deterministic on
 * the calendar date — the same recipe shows all day and it rotates at
 * midnight. Undefined for an empty collection.
 */
export function todaysRecipe(list, date = new Date()) {
  if (list.length === 0) return undefined;
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  return list[hashString(key) % list.length];
}

/** e.g. "Sunday, 12 October" in the user's locale. */
export function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/** Size a CDN photo for its context; other photos are used as-is. */
export function photoSrc(base, width) {
  return `${base}?q=80&w=${width}&auto=format&fit=crop`;
}

/** Photo URL at the requested width (CDN photos only are resized). */
export function resolvePhoto(photo, width) {
  return photo.resize ? photoSrc(photo.src, width) : photo.src;
}

/** "Lunch · One tray, one pot" — category first, subtitle when present. */
export function kickerLine(recipe) {
  return [categoryLabel(recipe.category), recipe.note]
    .filter(Boolean)
    .join(" · ");
}
