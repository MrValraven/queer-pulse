export const MENU_ITEM_SELECTOR = '[role="menuitem"]';
const ROVING_KEYS = ["ArrowDown", "ArrowUp", "Home", "End"];

/** Arrow/Home/End roving across the open menu's items, wrapping at the ends.
 *  `HTMLElement`, since the WhatsApp item is a link. False for other keys. */
export function moveMenuFocus(menu: HTMLElement | null, key: string): boolean {
  if (!ROVING_KEYS.includes(key)) return false;
  const items = Array.from(
    menu?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? [],
  );
  const lastIndex = items.length - 1;
  const currentIndex = items.indexOf(document.activeElement as HTMLElement);
  let nextIndex = 0;
  if (key === "End") nextIndex = lastIndex;
  if (key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
  if (key === "ArrowUp") {
    nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1;
  }
  items[nextIndex]?.focus();
  return true;
}
