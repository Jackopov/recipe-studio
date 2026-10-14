import type { IngredientGroup } from "@/data/recipes";

/** Split a textarea into clean non-empty lines. */
export function lines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Parse the ingredients textarea. Lines starting with "#" open a new group,
 * everything else is an ingredient — so groups match the recipe detail page.
 */
export function parseIngredients(text: string): IngredientGroup[] {
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

/** Turn ingredient groups back into the textarea format ("# heading" lines). */
export function serializeIngredients(groups: IngredientGroup[]): string {
  return groups
    .map((group) =>
      [group.section ? `# ${group.section}` : null, ...group.items]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");
}
