import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { FiMoreHorizontal, FiSlash, FiVolumeX, FiX } from "react-icons/fi";
import { useSocial } from "../../app/providers/useSocial";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { BlockOptions } from "../social/api/social.api";
import { BlockMemberModal } from "./BlockMemberModal";
import styles from "./ProfileSafetyMenu.module.css";

/**
 * Overflow "safety" menu shown on another member's profile hero (never your
 * own — the caller gates on the page's resolved `self`). Offers mute/unmute and
 * block/unblock, wired straight to `useSocial()` so demo and live both work.
 * Mute and unblock are immediate; blocking is destructive, so it confirms via
 * `BlockMemberModal` and forwards the optional `{ reason, alsoReport }`.
 */
export function ProfileSafetyMenu({
  slug,
  firstName,
  onWithdrawVouch,
}: {
  slug: string;
  firstName: string;
  onWithdrawVouch?: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isBlocked, isMuted, toggleBlock, toggleMute } = useSocial();
  const [open, setOpen] = useState(false);
  const [confirmingBlock, setConfirmingBlock] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const blocked = isBlocked(slug);
  const muted = isMuted(slug);

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

  const handleMute = () => {
    setOpen(false);
    const nowMuted = toggleMute(slug);
    showToast(
      t(
        nowMuted
          ? "safety:profileMenu.mutedToast"
          : "safety:profileMenu.unmutedToast",
        { name: firstName },
      ),
      "success",
    );
  };

  const handleWithdrawVouch = () => {
    setOpen(false);
    onWithdrawVouch?.();
  };

  const handleBlockClick = () => {
    if (blocked) {
      setOpen(false);
      toggleBlock(slug);
      showToast(
        t("safety:profileMenu.unblockedToast", { name: firstName }),
        "success",
      );
      return;
    }
    setOpen(false);
    setConfirmingBlock(true);
  };

  const confirmBlock = (options: BlockOptions) => {
    setConfirmingBlock(false);
    toggleBlock(slug, options);
    showToast(
      t(
        options.alsoReport
          ? "safety:profileMenu.blockedReportedToast"
          : "safety:profileMenu.blockedToast",
        { name: firstName },
      ),
      "success",
    );
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
    <div ref={containerRef} className={styles.container}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={t("safety:profileMenu.ariaLabel", { name: firstName })}
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
          {onWithdrawVouch && (
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={styles.item}
              onClick={handleWithdrawVouch}
            >
              <FiX aria-hidden />
              {t("members:profile.hero.withdrawVouchCta")}
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={styles.item}
            onClick={handleMute}
          >
            <FiVolumeX aria-hidden />
            {t(
              muted ? "safety:profileMenu.unmute" : "safety:profileMenu.mute",
              { name: firstName },
            )}
          </button>
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={`${styles.item} ${styles.danger}`}
            onClick={handleBlockClick}
          >
            <FiSlash aria-hidden />
            {t(
              blocked
                ? "safety:profileMenu.unblock"
                : "safety:profileMenu.block",
              { name: firstName },
            )}
          </button>
        </div>
      )}

      {confirmingBlock && (
        <BlockMemberModal
          firstName={firstName}
          onCancel={() => setConfirmingBlock(false)}
          onConfirm={confirmBlock}
        />
      )}
    </div>
  );
}
