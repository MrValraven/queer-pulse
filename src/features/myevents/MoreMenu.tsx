import {
  useEffect,
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
import { COMMITTED } from "./myEvents.helpers";
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
  nav: (path: string) => void,
  translate: TFunction,
  openInvitePicker: () => void,
): (Item | "sep")[] {
  const closeAndToast =
    (msg: string, type: "success" | "info" = "info") =>
    () => {
      c.closeMore();
      c.toast(msg, type);
    };
  const go = (path: string) => () => {
    c.closeMore();
    nav(path);
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
  if (ev.category === "going" || ev.category === "saved" || ev.category === "hosting")
    items.push({
      icon: Icons.invite,
      label: translate("myevents:moreMenu.inviteFriend"),
      onClick: () => {
        c.closeMore();
        openInvitePicker();
      },
    });
  if (ev.category !== "past" && ev.category !== "hosting" && ev.category !== "sent")
    items.push({
      icon: Icons.message,
      label: translate("myevents:moreMenu.messageHost"),
      onClick: go(routes.messages),
    });
  if (COMMITTED[ev.category])
    items.push({
      icon: Icons.chat,
      label: translate("myevents:moreMenu.openGroupChat"),
      onClick: go(routes.messages),
    });
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

/** Fixed-position overflow menu for an event card. */
export function MoreMenu() {
  const { t } = useTranslation();
  const c = useMyEvents();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  // The "⋯" trigger that opened the menu lives on the event card (outside this
  // component), so we capture it on open and restore focus to it on close.
  const openerRef = useRef<HTMLElement | null>(null);
  const { open, eventId, x, y } = c.moreMenu;
  const { closeMore } = c;
  // "Invite a friend" picks a connection here, then hands off to the messages
  // feature's own deep-link (`location.state.to`) to open/start that thread
  // with the event's link pre-filled — never sent silently, so the inviter can
  // still add a note before hitting send.
  const [invitingEvent, setInvitingEvent] = useState<MyEvent | null>(null);

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
      openerRef.current = document.activeElement as HTMLElement | null;
      ref.current
        ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
        ?.focus();
    } else {
      openerRef.current?.focus();
    }
  }, [open]);

  const ev = eventId ? c.byId(eventId) : undefined;
  const left = Math.min(
    x,
    (typeof window !== "undefined" ? window.innerWidth : 1200) - 220,
  );

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
          style={{ left, top: y }}
          onKeyDown={onMenuKeyDown}
        >
          {open &&
            ev &&
            buildItems(
              ev,
              c,
              (path) => void navigate(path),
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
              state: { to: { slug: recipient.slug, name: recipient.name, text } },
            });
          }}
        />
      )}
    </>
  );
}
