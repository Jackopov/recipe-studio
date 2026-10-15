/**
 * Tiny history-API router: real URLs with no server round-trip, the same
 * paths the app always had (/recipes/:slug and friends).
 */

let renderRoute = () => {};

/** Push a path and re-render. */
export function navigate(path, { replace = false } = {}) {
  const url = new URL(path, window.location.origin);
  const target = url.pathname + url.search + url.hash;
  const current =
    window.location.pathname + window.location.search + window.location.hash;
  if (target === current) return;
  if (replace) {
    window.history.replaceState({}, "", target);
  } else {
    window.history.pushState({}, "", target);
  }
  renderRoute();
}

function shouldIntercept(event, anchor) {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  const url = new URL(href, window.location.origin);
  if (url.origin !== window.location.origin) return false;
  return true;
}

/** Boot the router: link clicks, back/forward, and the parent-frame sync. */
export function startRouter(render) {
  renderRoute = render;

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest?.("a[href]");
    if (!anchor || !shouldIntercept(event, anchor)) return;
    event.preventDefault();
    navigate(anchor.getAttribute("href"));
  });

  window.addEventListener("popstate", () => renderRoute());

  // The preview frame likes to know which route is on screen.
  const notify = () => {
    try {
      window.parent.postMessage(
        { type: "iframe-route-change", path: window.location.pathname },
        "*",
      );
    } catch {
      // Not embedded — nothing to tell.
    }
  };
  window.addEventListener("popstate", notify);

  window.addEventListener("message", (event) => {
    if (event.data?.type === "navigate") {
      if (event.data.direction === "back") window.history.back();
      if (event.data.direction === "forward") window.history.forward();
    }
  });

  const originalRender = renderRoute;
  renderRoute = (path) => {
    originalRender(path);
    notify();
  };
}
