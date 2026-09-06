import {
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type RefObject,
  type SetStateAction,
} from "react";
import {
  FiFlag,
  FiMoreHorizontal,
  FiSlash,
  FiVolumeX,
  FiX,
} from "react-icons/fi";
import { useSocial } from "../../app/providers/useSocial";
import { ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ConnectionReportModal } from "../connect/ConnectionReportModal";
import type { BlockOptions } from "../social/api/social.api";
import { BlockMemberModal } from "./BlockMemberModal";
import styles from "./ProfileSafetyMenu.module.css";

/**
 * Overflow "safety" menu shown on another member's profile hero (never your
 * own — the caller gates on the page's resolved `self`). Offers withdraw-vouch
 * (when currently vouched), report, mute/unmute, and block/unblock, wired
 * straight to `useSocial()` so demo and live both work. Mute and unblock are
 * immediate; withdrawing a vouch and blocking are destructive, so both confirm
 * first — withdraw-vouch via the shared `ConfirmDialog`, block via
 * `BlockMemberModal` (which also forwards the optional
 * `{ reason, alsoReport, reasonCode }`).
 *
 * "Report" is its own item rather than a checkbox inside Block (PRD-285). The
 * safety copy sends everyone to "always start from someone's profile", and
 * until this existed the only route from here was to BLOCK the person, which is
 * a different decision: somebody who wants a moderator to look at a member does
 * not necessarily want to sever the connection, and somebody who does want to
 * sever it should not have to in order to be heard. It opens
 * `ConnectionReportModal`, the app's existing `member`-subject report form,
 * which files through `POST /reports` and only shows its success panel once the
 * server has acknowledged.
 */
/**
 * Outside-click dismiss, first-item focus on open, and roving-tabindex
 * keyboard nav for the menu — split out so `ProfileSafetyMenu` itself stays
 * under the repo's 200-line-per-component rule.
 */
function useSafetyMenuDismiss(
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  containerRef: RefObject<HTMLDivElement | null>,
  menuRef: RefObject<HTMLDivElement | null>,
  triggerRef: RefObject<HTMLButtonElement | null>,
) {
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
  }, [open, containerRef, setOpen]);

  // APG menu-button contract: focus the first item when the menu opens.
  useEffect(() => {
    if (!open) return;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      ?.focus();
  }, [open, menuRef]);

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

  return { onMenuKeyDown };
}

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
  const [reporting, setReporting] = useState(false);
  const [confirmingWithdrawVouch, setConfirmingWithdrawVouch] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const blocked = isBlocked(slug);
  const muted = isMuted(slug);

  const { onMenuKeyDown } = useSafetyMenuDismiss(
    open,
    setOpen,
    containerRef,
    menuRef,
    triggerRef,
  );

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
    setConfirmingWithdrawVouch(true);
  };

  // No toast here: `ConnectionReportModal` confirms only in its own
  // `onSuccess`, the rule PRD-202 applied to block one menu item down.
  const handleReport = () => {
    setOpen(false);
    setReporting(true);
  };

  const confirmWithdrawVouch = () => {
    setConfirmingWithdrawVouch(false);
    onWithdrawVouch?.();
    showToast(
      t("safety:profileMenu.withdrawVouchToast", { name: firstName }),
      "success",
    );
  };

  // Block and unblock confirm only once the server has answered. `toggleBlock`
  // flips the store optimistically and rolls back with its own error toast if
  // the call fails, so toasting on the click showed "You blocked X" and the
  // rollback error together. Believing a block worked when it did not is the
  // one place a false success matters. `ConnectionMoreMenu` already waits for
  // `onSettled(didSucceed)`; this now matches it. In demo mode the local store
  // is the record and `onSettled(true)` fires synchronously. PRD-202.
  const handleBlockClick = () => {
    if (blocked) {
      setOpen(false);
      toggleBlock(slug, undefined, (didSucceed) => {
        if (didSucceed) {
          showToast(
            t("safety:profileMenu.unblockedToast", { name: firstName }),
            "success",
          );
        }
      });
      return;
    }
    setOpen(false);
    setConfirmingBlock(true);
  };

  const confirmBlock = (options: BlockOptions) => {
    setConfirmingBlock(false);
    toggleBlock(slug, options, (didSucceed) => {
      if (didSucceed) {
        showToast(
          t(
            options.alsoReport
              ? "safety:profileMenu.blockedReportedToast"
              : "safety:profileMenu.blockedToast",
            { name: firstName },
          ),
          "success",
        );
      }
    });
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
            onClick={handleReport}
          >
            <FiFlag aria-hidden />
            {t("safety:profileMenu.report", { name: firstName })}
          </button>
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

      <ProfileSafetyMenuDialogs
        slug={slug}
        firstName={firstName}
        confirmingBlock={confirmingBlock}
        onCancelBlock={() => setConfirmingBlock(false)}
        onConfirmBlock={confirmBlock}
        reporting={reporting}
        onCloseReport={() => setReporting(false)}
        confirmingWithdrawVouch={confirmingWithdrawVouch}
        onCloseWithdrawVouch={() => setConfirmingWithdrawVouch(false)}
        onConfirmWithdrawVouch={confirmWithdrawVouch}
      />
    </div>
  );
}

/** The dialogs this menu can open: the two destructive-action confirmations
 * plus the report form, kept out of the main component to stay under the
 * repo's 200-line-per-component rule. */
function ProfileSafetyMenuDialogs({
  slug,
  firstName,
  confirmingBlock,
  onCancelBlock,
  onConfirmBlock,
  reporting,
  onCloseReport,
  confirmingWithdrawVouch,
  onCloseWithdrawVouch,
  onConfirmWithdrawVouch,
}: {
  slug: string;
  firstName: string;
  confirmingBlock: boolean;
  onCancelBlock: () => void;
  onConfirmBlock: (options: BlockOptions) => void;
  reporting: boolean;
  onCloseReport: () => void;
  confirmingWithdrawVouch: boolean;
  onCloseWithdrawVouch: () => void;
  onConfirmWithdrawVouch: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      {confirmingBlock && (
        <BlockMemberModal
          firstName={firstName}
          onCancel={onCancelBlock}
          onConfirm={onConfirmBlock}
        />
      )}

      {/* `subjectId` is the member's slug: `CreateReportInput.subjectId` takes
          a slug or a uuid for a `member` subject, and the backend's subject
          resolver looks a member up either way. */}
      {reporting && (
        <ConnectionReportModal
          subjectId={slug}
          name={firstName}
          onClose={onCloseReport}
        />
      )}
      <ConfirmDialog
        open={confirmingWithdrawVouch}
        tone="destructive"
        onClose={onCloseWithdrawVouch}
        onConfirm={onConfirmWithdrawVouch}
        title={t("safety:profileMenu.withdrawVouchConfirmTitle", {
          name: firstName,
        })}
        description={t("safety:profileMenu.withdrawVouchConfirmBody", {
          name: firstName,
        })}
        confirmLabel={t("safety:profileMenu.withdrawVouchConfirmCta")}
      />
    </>
  );
}
