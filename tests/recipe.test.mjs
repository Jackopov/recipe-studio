/**
 * Delete-flow tests: a confirmation window must open before a recipe is
 * removed — with the exact copy — and only confirming deletes.
 * Run with `bun run test`.
 */
import assert from "node:assert/strict";
import { Window } from "happy-dom";

const window = new Window({ url: "https://host.test/" });
const document = window.document;
globalThis.window = window;
globalThis.document = document;
globalThis.localStorage = window.localStorage;
globalThis.history = window.history;
globalThis.location = window.location;
globalThis.PopStateEvent = window.PopStateEvent;
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);

const { listRecipes, getRecipe } = await import("../src/store.js");
const { renderRecipe } = await import("../src/views/recipe.js");

let checks = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  checks++;
};
const one = (selector) => document.querySelector(selector);
const click = (element) => {
  assert.ok(element, "element to click must exist");
  element.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
};
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const root = document.createElement("div");
root.id = "app";
document.body.appendChild(root);

const seed = listRecipes()[0]; // the first seed recipe
renderRecipe(root, { nav: "", slug: seed.slug });
check(Boolean(one("[data-delete-request]")), "detail page shows Delete recipe");

/* ---------- Escape declines ---------- */
click(one("[data-delete-request]"));
check(Boolean(one(".confirm-overlay")), "confirmation window opens");
check(
  one(".confirm__text")?.textContent ===
    "Do you want to delete this tasty recipe?",
  `exact copy, got: ${JSON.stringify(one(".confirm__text")?.textContent)}`,
);
document.dispatchEvent(
  new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
);
await tick();
check(!one(".confirm-overlay"), "Escape closes the window");
check(Boolean(getRecipe(seed.slug)), "Escape keeps the recipe");

/* ---------- "Keep it" declines ---------- */
click(one("[data-delete-request]"));
check(Boolean(one(".confirm-overlay")), "window opens again");
check(
  one("[data-confirm-no]") === document.activeElement,
  "the safe option holds focus",
);
click(one("[data-confirm-no]"));
check(!one(".confirm-overlay"), "Keep it closes the window");
check(Boolean(getRecipe(seed.slug)), "declining keeps the recipe");

/* ---------- "Delete" removes and leaves the page ---------- */
click(one("[data-delete-request]"));
check(Boolean(one(".confirm-overlay")), "window opens for the final try");
click(one("[data-confirm-yes]"));
await tick(); // the handler awaits the dialog's answer
check(!one(".confirm-overlay"), "window closes after confirming");
check(getRecipe(seed.slug) === null, "confirming removes the recipe");
check(
  window.location.pathname.endsWith("/recipes"),
  `navigated to the database, got ${window.location.pathname}`,
);

console.log(`OK — ${checks} assertions passed, 0 failed`);
