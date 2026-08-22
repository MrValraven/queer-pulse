import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { FiFlag, FiMoreHorizontal, FiShare2 } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { shareSubprofile } from "./shareSubprofile";
import type { PersonaAction } from "./personaSkinRender";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import styles from "./SubprofileMoreMenu.module.css";

/**
 * Overflow "more actions" menu on a public persona hero — the low-frequency
 * viewer actions (Share, Report) tucked behind a circular `⋯` trigger, freeing
 * the row for the primary controls. Mirrors the proven APG menu-button in
 * `members/ProfileSafetyMenu.tsx`: outside-pointerdown close, focus-first-item
 * on open, focus-return on close, and arrow/Home/End/Escape roving nav.
 * Share hands off to the shared `shareSubprofile` helper; Report routes back to
 * the page host via `onAction("report")`.
 */
export function SubprofileMoreMenu({
  view,
  onAction,
}: {
  view: PublicSubprofileView;
  onAction: (action: PersonaAction) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // APG menu-button contract: focus the first item when the menu opens.
  useEffect(() => {
    if (!open) return;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      ?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleShare = () => {
    setOpen(false);
    void shareSubprofile(view, t, showToast);
  };

  const handleReport = () => {
    setOpen(false);
    onAction("report");
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ??
        [],
    );
    if (items.length === 0) return;
    event.preventDefault();
    const currentIndex = items.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    let nextIndex: number;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = items.length - 1;
    else if (event.key === "ArrowDown")
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    else
      nextIndex =
        currentIndex < 0
          ? items.length - 1
          : (currentIndex - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  return (
    <div ref={containerRef} className={`pp-moreMenu ${styles.container}`}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={t("subprofiles:hero.more.ariaLabel", {
          name: view.displayName,
        })}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>

      {open && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className={`pp-moreMenuPanel ${styles.menu}`}
          onKeyDown={onMenuKeyDown}
        >
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={styles.item}
            onClick={handleShare}
          >
            <FiShare2 aria-hidden />
            {t("subprofiles:share.cta")}
          </button>
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={`${styles.item} ${styles.danger}`}
            onClick={handleReport}
          >
            <FiFlag aria-hidden />
            {t("subprofiles:hero.report.cta")}
          </button>
        </div>
      )}
    </div>
  );
}
