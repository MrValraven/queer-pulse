import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { Icons } from "./MyEventsIcons";
import { routes } from "../../app/routeMap";
import { gatheringPath } from "../gatherings/data";
import { NewMessageModal } from "../messages/NewMessageModal";
import type { MyEvent } from "./myEvents.types";

interface Item {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function buildItems(
  ev: MyEvent,
  c: ReturnType<typeof useMyEvents>,
  nav: (
    path: string,
    options?: { state?: { to: { slug: string; name: string } } },
  ) => void,
  translate: TFunction,
  openInvitePicker: () => void,
): (Item | "sep")[] {
  const closeAndToast =
    (msg: string, type: "success" | "info" = "info") =>
    () => {
      c.closeMore();
      c.toast(msg, type);
    };
  const share = () => {
    c.closeMore();
    const url =
      (typeof window !== "undefined" ? window.location.origin : "") +
      (ev.slug ? gatheringPath(ev.slug) : routes.gatherings);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => c.toast(translate("myevents:moreMenu.shareToast"), "success"),
        () =>
          c.toast(translate("myevents:moreMenu.shareCopyFailToast"), "info"),
      );
    } else {
      c.toast(translate("myevents:moreMenu.shareToast"), "success");
    }
  };
  const items: (Item | "sep")[] = [
    {
      icon: Icons.share,
      label: translate("myevents:moreMenu.share"),
      onClick: share,
    },
  ];
  if (
    ev.category === "going" ||
    ev.category === "saved" ||
    ev.category === "hosting"
  )
    items.push({
      icon: Icons.invite,
      label: translate("myevents:moreMenu.inviteFriend"),
      onClick: () => {
        c.closeMore();
        openInvitePicker();
      },
    });
  // PRD-337: only offered with a real member host to message. An org-hosted
  // gathering carries no `hostSlug`, and landing on the bare inbox would be
  // worse than no CTA at all.
  if (
    ev.category !== "past" &&
    ev.category !== "hosting" &&
    ev.category !== "sent" &&
    ev.hostSlug
  )
    items.push({
      icon: Icons.message,
      label: translate("myevents:moreMenu.messageHost"),
      onClick: () => {
        c.closeMore();
        nav(routes.messages, {
          state: {
            to: { slug: ev.hostSlug!, name: ev.hostName ?? ev.title },
          },
        });
      },
    });
  // "Open group chat" is dropped rather than fixed with a recipient: no
  // gathering carries a group conversation id anywhere in the stack (the
  // messaging schema is multi-participant-capable, but group chats are not
  // built yet, per the messaging-craft map's genuine-gaps list), so the item
  // had nothing real to open and always landed on the inbox's first
  // auto-selected thread.
  if (ev.category === "going" && !ev.cancelled) {
    items.push(
      ev.maybe
        ? {
            icon: Icons.maybe,
            label: translate("myevents:moreMenu.changeToGoing"),
            onClick: () => c.setGoing(ev.id),
          }
        : {
            icon: Icons.maybe,
            label: translate("myevents:moreMenu.markAsMaybe"),
            onClick: () => c.setMaybe(ev.id),
          },
    );
  }
  if (ev.ticket) {
    items.push({
      icon: Icons.ticket,
      label: translate("myevents:moreMenu.transferTicket"),
      onClick: closeAndToast(translate("myevents:moreMenu.transferToast")),
    });
    items.push({
      icon: Icons.refund,
      label: translate("myevents:moreMenu.requestRefund"),
      onClick: closeAndToast(
        translate("myevents:moreMenu.refundToast"),
        "success",
      ),
    });
  }
  if (ev.category === "past" && ev.connect)
    items.push({
      icon: Icons.connect,
      label: translate("myevents:moreMenu.connectWithMet"),
      onClick: closeAndToast(
        translate("myevents:moreMenu.connectWithMetToast"),
      ),
    });
  if (ev.category !== "hosting" && ev.category !== "sent") {
    items.push("sep");
    items.push({
      icon: Icons.report,
      label: translate("myevents:moreMenu.reportEvent"),
      onClick: () => c.openReport(ev.id),
      danger: true,
    });
    // Only offered when there's a real member behind the event to block. An
    // org-hosted gathering carries no `hostSlug`, and the block primitive is
    // member-keyed — showing the item there could only ever fake a result.
    if (ev.hostSlug)
      items.push({
        icon: Icons.block,
        label: translate("myevents:moreMenu.blockHost"),
        onClick: () => c.openBlock(ev.id),
        danger: true,
      });
  }
  return items;
}

/** Gap between the trigger and the menu, and from the viewport edges. */
const ANCHOR_GAP = 6;
const VIEWPORT_MARGIN = 8;

/** Fixed-position overflow menu for an event card. */
export function MoreMenu() {
  const { t } = useTranslation();
  const c = useMyEvents();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  // The "⋯" trigger that opened the menu lives on the event card (outside this
  // component), so we capture it on open and restore focus to it on close.
  const openerRef = useRef<HTMLElement | null>(null);
  const { open, eventId, anchor } = c.moreMenu;
  const { closeMore } = c;
  // "Invite a friend" picks a connection here, then hands off to the messages
  // feature's own deep-link (`location.state.to`) to open/start that thread
  // with the event's link pre-filled — never sent silently, so the inviter can
  // still add a note before hitting send.
  const [invitingEvent, setInvitingEvent] = useState<MyEvent | null>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  // The menu is fixed to the viewport, so it re-measures its trigger on every
  // scroll (capture phase catches nested scroll containers too) and resize;
  // otherwise it stays where the button was when it opened. It opens below the
  // trigger and flips above it when the viewport has no room underneath.
  useLayoutEffect(() => {
    if (!open || !anchor) return;
    let frame = 0;
    const place = () => {
      const anchorRect = anchor.getBoundingClientRect();
      const menuWidth = ref.current?.offsetWidth ?? 0;
      const menuHeight = ref.current?.offsetHeight ?? 0;
      const below = anchorRect.bottom + ANCHOR_GAP;
      const above = anchorRect.top - ANCHOR_GAP - menuHeight;
      const isFlippedAbove =
        below + menuHeight > window.innerHeight - VIEWPORT_MARGIN &&
        above >= VIEWPORT_MARGIN;
      setPosition({
        left: Math.max(
          VIEWPORT_MARGIN,
          Math.min(
            anchorRect.left,
            window.innerWidth - menuWidth - VIEWPORT_MARGIN,
          ),
        ),
        top: isFlippedAbove ? above : below,
      });
    };
    const schedulePlace = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", schedulePlace, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", schedulePlace);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedulePlace, { capture: true });
      window.removeEventListener("resize", schedulePlace);
    };
  }, [open, anchor, eventId]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) closeMore();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMore();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMore]);

  // APG menu-button contract: on open, remember the trigger and move focus to
  // the first item; on close, restore focus to the trigger.
  useEffect(() => {
    if (open) {
      // Safari never focuses a clicked button, so the anchor is the reliable
      // trigger; activeElement covers a keyboard-opened menu either way.
      openerRef.current =
        anchor ?? (document.activeElement as HTMLElement | null);
      ref.current
        ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
        ?.focus();
    } else {
      openerRef.current?.focus();
    }
  }, [open, anchor]);

  const ev = eventId ? c.byId(eventId) : undefined;

  // Up/Down roving between items, Home/End to the ends. (Escape close +
  // focus-restore is handled by the document listener + the effect above.)
  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ??
        [],
    );
    if (items.length === 0) return;
    event.preventDefault();
    const currentIndex = items.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    let nextIndex: number;
    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    } else if (event.key === "ArrowDown") {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    } else {
      nextIndex =
        currentIndex < 0
          ? items.length - 1
          : (currentIndex - 1 + items.length) % items.length;
    }
    items[nextIndex]?.focus();
  };

  // Portal to <body> so the fixed-position menu is anchored to the viewport,
  // never to a transformed ancestor. RouteTransition (and SwipeBackShell on
  // mobile) keeps an inline `transform` on its wrapping `m.div` around every
  // routed page, which establishes a containing block for `position: fixed`
  // descendants — without the portal, `left`/`top` (computed from
  // getBoundingClientRect, viewport-relative) resolve against that wrapper's
  // box instead of the viewport, detaching the menu from its trigger button.
  return (
    <>
      {createPortal(
        <div
          ref={ref}
          className={`${sx("more-menu")} ${open ? sx("show") : ""}`}
          role="menu"
          tabIndex={-1}
          style={position}
          onKeyDown={onMenuKeyDown}
        >
          {open &&
            ev &&
            buildItems(
              ev,
              c,
              (path, options) => void navigate(path, options),
              t,
              () => setInvitingEvent(ev),
            ).map((it, i) =>
              it === "sep" ? (
                <div key={`s${i}`} className={sx("mm-sep")} />
              ) : (
                <button
                  key={it.label}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={sx(`mm-item${it.danger ? " danger" : ""}`)}
                  onClick={it.onClick}
                >
                  {it.icon}
                  {it.label}
                </button>
              ),
            )}
        </div>,
        document.body,
      )}
      {invitingEvent && (
        <NewMessageModal
          title={t("myevents:moreMenu.invitePickerTitle")}
          sub={t("myevents:moreMenu.invitePickerSub")}
          onClose={() => setInvitingEvent(null)}
          onPick={(recipient) => {
            const ev = invitingEvent;
            setInvitingEvent(null);
            if (!recipient.slug) return;
            const origin =
              typeof window !== "undefined" ? window.location.origin : "";
            const link =
              origin + (ev.slug ? gatheringPath(ev.slug) : routes.gatherings);
            const text = t("myevents:moreMenu.inviteMessageText", {
              title: ev.title,
              link,
            });
            void navigate(routes.messages, {
              state: {
                to: { slug: recipient.slug, name: recipient.name, text },
              },
            });
          }}
        />
      )}
    </>
  );
}
