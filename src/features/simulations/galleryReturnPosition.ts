/**
 * Where the member was on the `/simulations` gallery when they opened a card,
 * so leaving the player lands them back on the same spot with the same search.
 * ScrollManager resets every PUSH navigation to the top, and the player's exits
 * are PUSH navigations to the gallery. The player cannot use navigate(-1)
 * instead: its same-origin iframe runs a full app with its own BrowserRouter,
 * and those pushState calls share the joint session history, so a parent
 * history.back() would step the iframe back and keep the player open.
 * A module-level stash keeps this out of React context and the URL.
 */
type GalleryReturn = { scrollOffset: number; query: string };

let savedReturn: GalleryReturn | null = null;

/** Stores the current window scroll offset and search query before a card opens. */
export function rememberGalleryPosition(query: string): void {
  savedReturn = { scrollOffset: window.scrollY, query };
}

/** Reads the stash and leaves it in place (safe for StrictMode's double initializers). */
export function peekGalleryReturn(): GalleryReturn | null {
  return savedReturn;
}

/** Reads the stash and clears it, so a later fresh visit starts at the top. */
export function takeGalleryReturn(): GalleryReturn | null {
  const saved = savedReturn;
  savedReturn = null;
  return saved;
}
