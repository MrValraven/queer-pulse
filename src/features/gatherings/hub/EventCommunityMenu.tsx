import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type RefObject,
} from "react";
import { FiEyeOff, FiMoreHorizontal } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useExitTransition } from "../../../shared/hooks/useExitTransition";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMenuNavigation } from "../../connect/useMenuNavigation";
import { useHiddenEventCommunityActions } from "../api/useHiddenEventCommunityActions";
import type { HiddenCommunityTarget } from "../hiddenEventCommunities";
import {
  focusAfterCardRemoval,
  markCardsLeaving,
} from "./focusAfterCardRemoval";
import styles from "./EventCommunityMenu.module.css";

/** How long the menu lingers to fade after it closes, ms. MUST match the
 *  `qpEventMenuOut` duration in EventCommunityMenu.module.css. */
const MENU_EXIT_MS = 140;

/** The gutter the open menu keeps from each viewport edge, px. MUST match
 *  `--menu-edge` in styles/tokens/spacing.css. */
const MENU_EDGE_PX = 16;

type MenuAlign = "end" | "start";

/**
 * Keeps the open menu inside the viewport. It opens on the `preferredAlign`
 * side of the trigger; when that runs past a viewport edge (a trigger at the
 * inline start of a wrapped row on a phone opens an end-anchored menu off
 * the screen) it tries the other side, and if neither fits it slides by the
 * overflow. Written to the element directly, so the fit lands before the
 * first paint without a second render.
 */
function fitMenuToViewport(menu: HTMLElement, preferredAlign: MenuAlign) {
  const viewportWidth = document.documentElement.clientWidth;
  const overflowOf = () => {
    const rect = menu.getBoundingClientRect();
    return {
      left: MENU_EDGE_PX - rect.left,
      right: rect.right - (viewportWidth - MENU_EDGE_PX),
    };
  };
  const worstOf = (overflow: { left: number; right: number }) =>
    Math.max(overflow.left, overflow.right, 0);

  menu.style.translate = "";
  menu.dataset.align = preferredAlign;
  const preferred = overflowOf();
  if (worstOf(preferred) === 0) return;

  menu.dataset.align = preferredAlign === "end" ? "start" : "end";
  const flipped = overflowOf();
  const isFlipBetter = worstOf(flipped) < worstOf(preferred);
  if (!isFlipBetter) menu.dataset.align = preferredAlign;
  const chosen = isFlipBetter ? flipped : preferred;
  const shift =
    chosen.left > 0 ? chosen.left : chosen.right > 0 ? -chosen.right : 0;
  if (shift !== 0) menu.style.translate = `${shift}px 0`;
}

/**
 * The small "more" menu on an event card, holding one action: hide every
 * event from the card's lead community.
 *
 * It renders as a sibling of the card's link (a button inside a link is
 * invalid), placed by the caller's `className` slot. The menu opens inside
 * the card's own box, under the trigger, or over it with
 * `placement="above"` for the featured card's action row, so it needs no
 * portal and scrolls with the card. `align` picks the trigger edge the menu
 * lines up with ("end" by default, opening toward the inline start); the
 * menu switches sides on its own when the preferred one leaves the screen.
 * Keyboard and dismissal follow the APG menu-button pattern through
 * `useMenuNavigation`.
 *
 * Choosing the item moves focus to the next card first, because the card that
 * holds focus is about to leave the list, and then hides the community. The
 * hook removes the cards optimistically and offers Undo in its toast. A
 * co-hosted event (`isCoHosted`) may stay, since a community the member still
 * sees also runs it, so focus returns to this trigger and the hook's toast
 * says why the card stayed. `eventSlug` names the card for that toast.
 */
export function EventCommunityMenu({
  community,
  eventTitle,
  className,
  placement = "below",
  align = "end",
  eventSlug,
  isCoHosted = false,
}: {
  community: { id: string; slug: string; name: string };
  eventTitle: string;
  className?: string;
  placement?: "below" | "above";
  align?: MenuAlign;
  eventSlug?: string;
  isCoHosted?: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [isOpen, setIsOpen] = useState(false);
  const { isMounted, isExiting } = useExitTransition(
    isOpen,
    reducedMotion ? 0 : MENU_EXIT_MS,
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  useMenuNavigation({ isOpen, close, wrapRef, menuRef, triggerRef });

  function closeBeforeHide() {
    setIsOpen(false);
    if (!reducedMotion) markCardsLeaving(wrapRef.current);
    if (isCoHosted) triggerRef.current?.focus({ preventScroll: true });
    else {
      focusAfterCardRemoval(wrapRef.current, {
        isReducedMotion: reducedMotion,
      });
    }
  }

  const hideTarget: HiddenCommunityTarget = {
    id: community.id,
    slug: community.slug,
    name: community.name,
    ...(eventSlug
      ? { fromEvent: { slug: eventSlug, title: eventTitle, isCoHosted } }
      : {}),
  };

  // Tab out of the open menu closes it, so a forgotten menu never keeps its
  // cell raised over the cards after it. A null `relatedTarget` (a pointer
  // press, or Safari's unfocused click on the trigger) is left to
  // `useMenuNavigation`'s outside press and the trigger's own toggle.
  function closeWhenFocusLeaves(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (!isOpen || !(nextTarget instanceof Node)) return;
    if (!wrapRef.current?.contains(nextTarget)) close();
  }

  return (
    <div
      ref={wrapRef}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      data-event-community-id={community.id}
      // Read by `focusAfterCardRemoval` and `markCardsLeaving`: this card
      // stays when its lead is hidden, so it neither fades nor loses focus.
      data-event-co-hosted={isCoHosted ? "true" : undefined}
      data-open={isOpen ? "true" : undefined}
      onBlur={closeWhenFocusLeaves}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("gatherings:hiddenCommunities.menu.trigger", {
          title: eventTitle,
        })}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      {isMounted ? (
        <EventCommunityMenuPanel
          community={community}
          hideTarget={hideTarget}
          placement={placement}
          align={align}
          isExiting={isExiting}
          menuRef={menuRef}
          onBeforeHide={closeBeforeHide}
        />
      ) : null}
    </div>
  );
}

/**
 * The open menu itself. It is the only part that reads the hide actions, so
 * a closed menu on every card holds no mutation observers and no card
 * re-renders when another card's community is hidden. The hook's callbacks
 * live on the mutation, so the hide still settles, toasts and offers Undo
 * after this panel has unmounted.
 */
function EventCommunityMenuPanel({
  community,
  hideTarget,
  placement,
  align,
  isExiting,
  menuRef,
  onBeforeHide,
}: {
  community: { id: string; slug: string; name: string };
  hideTarget: HiddenCommunityTarget;
  placement: "below" | "above";
  align: MenuAlign;
  isExiting: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onBeforeHide: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { hide } = useHiddenEventCommunityActions();

  useLayoutEffect(() => {
    if (menuRef.current) fitMenuToViewport(menuRef.current, align);
  }, [menuRef, align]);

  // The leaving cards start their fade first (`onBeforeHide`), and the
  // cache write waits two frames, so the fade's opening frames paint before
  // the list re-renders. Reduced motion has no fade to wait for.
  function hideCommunity() {
    onBeforeHide();
    if (reducedMotion) {
      hide(hideTarget);
      return;
    }
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => hide(hideTarget)),
    );
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      className={styles.menu}
      data-placement={placement}
      data-align={align}
      data-exiting={isExiting ? "true" : undefined}
      inert={isExiting}
    >
      <button
        type="button"
        role="menuitem"
        className={styles.menuItem}
        onClick={hideCommunity}
      >
        <FiEyeOff aria-hidden />
        <span className={styles.menuLabel}>
          {t("gatherings:hiddenCommunities.menu.hide", {
            name: community.name,
          })}
        </span>
      </button>
    </div>
  );
}
