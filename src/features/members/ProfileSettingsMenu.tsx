import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FiDownload, FiEye, FiEyeOff, FiMoreHorizontal } from "react-icons/fi";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ProfileSettingsMenu.module.css";

interface ProfileSettingsMenuProps {
  onOpenWhoSeesWhat: () => void;
  onOpenAccountData: () => void;
  onToggleHidden: () => void;
  hiddenUntil: string | null;
}

/**
 * Overflow "profile settings" menu shown on your OWN profile hero — the
 * self-view counterpart to `ProfileSafetyMenu` (which shows on everyone
 * else's, in the same `ctaRow`). Gathers the three owner-only actions that
 * used to live in an always-visible card in `ProfileRail` (now removed):
 * visibility ("Who sees what"), the 24h hide toggle, and the account-data
 * sheet — one top-of-profile menu instead of a permanent block taking up
 * rail space.
 *
 * Same APG menu-button contract as `ProfileSafetyMenu` (roving-tabindex
 * `role="menu"`, first-item focus on open, focus-return on close), but uses
 * the shared `useOutsideDismiss` hook for the outside-click half instead of
 * re-inlining that listener a 16th time.
 */
export function ProfileSettingsMenu({
  onOpenWhoSeesWhat,
  onOpenAccountData,
  onToggleHidden,
  hiddenUntil,
}: ProfileSettingsMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const isHidden = !!hiddenUntil && new Date(hiddenUntil) > new Date();

  useOutsideDismiss(open, containerRef, () => setOpen(false));

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

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]',
      ) ?? [],
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
    <div ref={containerRef} className={styles.container}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={t("members:profile.rail.settingsMenuAria")}
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
          className={styles.menu}
          onKeyDown={onMenuKeyDown}
        >
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={styles.item}
            onClick={() => {
              setOpen(false);
              onOpenWhoSeesWhat();
            }}
          >
            <FiEye aria-hidden />
            {t("members:profile.rail.whoSeesWhat")}
          </button>
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={styles.item}
            onClick={() => {
              setOpen(false);
              onToggleHidden();
            }}
          >
            <FiEyeOff aria-hidden />
            {isHidden
              ? t("members:profile.rail.bringMeBack")
              : t("members:profile.rail.hideMe24h")}
          </button>
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={styles.item}
            onClick={() => {
              setOpen(false);
              onOpenAccountData();
            }}
          >
            <FiDownload aria-hidden />
            {t("members:profile.rail.yourData")}
          </button>
        </div>
      )}
    </div>
  );
}
