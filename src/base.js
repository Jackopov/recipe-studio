/**
 * Where the app is published.
 *
 * The dev server roots everything at "/", but the same files can also be
 * served from a sub-path (a GitHub Pages project site, for example), so the
 * base is derived from where this app's own modules were loaded: they always
 * live in a src/ folder next to index.html.
 */

/** The deploy directory for a module URL — "/src/base.js" → "/". */
export function basePathFrom(moduleUrl) {
  const directory = new URL("../", moduleUrl).pathname;
  return directory.endsWith("/") ? directory : `${directory}/`;
}

/**
 * Turn an app route ("/recipes") into a URL under `base`. Idempotent, and
 * passes fragment/query-only links and external URLs through untouched.
 */
export function withBase(route, base) {
  const value = String(route);
  const isExternal =
    value.startsWith("//") ||
    value.startsWith("#") ||
    value.startsWith("?") ||
    /^[a-z][a-z0-9+.-]*:/i.test(value);
  if (isExternal || value.startsWith(base)) return value;
  return `${base}${value.startsWith("/") ? value.slice(1) : value}`;
}

/** The current path without the base — what the router matches routes on. */
export function routeFrom(pathname, base) {
  if (!pathname.startsWith(base)) {
    // "/recipe-studio" without the trailing slash still means the root.
    return `${pathname}/` === base ? "/" : pathname;
  }
  const rest = pathname.slice(base.length);
  return rest ? `/${rest}` : "/";
}

export const BASE = basePathFrom(import.meta.url);

/** An app route as a URL under the current deploy base. */
export function appUrl(route) {
  return withBase(route, BASE);
}

/** The current URL as an app route (base stripped). */
export function routePath(pathname = window.location.pathname) {
  return routeFrom(pathname, BASE);
}
