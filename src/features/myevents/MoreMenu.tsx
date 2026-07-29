import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { Icons } from "./MyEventsIcons";
import { COMMITTED } from "./myEvents.helpers";
import { routes } from "../../app/routeMap";
import { gatheringPath } from "../gatherings/data";
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
      onClick: go(routes.invite),
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
    items.push({
      icon: Icons.wallet,
      label: translate("myevents:moreMenu.addToWallet"),
      onClick: closeAndToast(
        translate("myevents:moreMenu.walletToast"),
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

  return (
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
        buildItems(ev, c, (path) => void navigate(path), t).map((it, i) =>
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
    </div>
  );
}
