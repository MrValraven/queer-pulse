import { useEffect, useRef, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useListingModeration } from "./api/useListingModeration";
import { useSetQueerOwnedVerified } from "./api/useSetQueerOwnedVerified";
import { AskQuestionModal } from "./AskQuestionModal";
import { RemoveListingConfirmModal } from "./RemoveListingConfirmModal";
import { SendBackReasonModal } from "./SendBackReasonModal";
import type { ListingQueueRow } from "./api/adminListings.api";
import styles from "./AdminListingsPage.module.css";

/**
 * The one moderation-action cluster shared by the row and the drawer footer
 * (kills the row/drawer duplication and the inconsistent disabled-state
 * coverage the two used to have independently — see the
 * admin-listings-overhaul design doc). Driven entirely by
 * `useListingModeration`, whose unified `isPending` disables every button
 * here together. "Publish live" is the visually dominant action while the
 * listing isn't live yet; the destructive Remove lives inside an accessible
 * `⋯` overflow menu, never a bare inline button next to the safe actions.
 *
 * Renders an unwrapped button group — the row places it inside its own
 * `.rowActions` flex container alongside "View & preview"; the drawer passes
 * it straight as the `Modal` `footer`, which already lays out its children in
 * a flex row. `variant` keeps the row's buttons at the row's explicit `"md"`
 * size (matching the row's pre-refactor sizing) and is available for any
 * future row/drawer divergence.
 */
export function ListingModerationActions({
  variant,
  row,
  onDone,
}: {
  variant: "row" | "drawer";
  row: ListingQueueRow;
  onDone?: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [asking, setAsking] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [sendingBack, setSendingBack] = useState(false);
  const moderation = useListingModeration(row, {
    // `remove`/`sendBack` both resolve through this — close whichever local
    // confirm dialog is open so a moderator on a status tab that keeps
    // showing the row after the move (e.g. "All") doesn't see a stale,
    // re-enabled confirm dialog sitting open over it. Harmless no-op the rest
    // of the time (both start `false`); the drawer's own `onClose` still
    // fires after.
    onDone: () => {
      setConfirmingRemove(false);
      setSendingBack(false);
      onDone?.();
    },
  });
  const buttonSize = variant === "row" ? "md" : undefined;
  const setQueerOwnedVerified = useSetQueerOwnedVerified();
  const queerOwnedVerifiedPending =
    moderation.isPending || setQueerOwnedVerified.isPending;

  return (
    <>
      {row.status !== "live" && (
        <Button
          variant="jade"
          size={buttonSize}
          onClick={() => moderation.moveTo("live")}
          disabled={moderation.isPending}
        >
          {t("admin:adminListings.advance.live")}
        </Button>
      )}
      {row.status === "review" ? (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={() => setAsking(true)}
          disabled={moderation.isPending}
        >
          {t("admin:adminListings.advance.question")}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={() => setSendingBack(true)}
          disabled={moderation.isPending}
        >
          {t("admin:adminListings.sendBackCta")}
        </Button>
      )}
      {row.detail.linkToProfile && (
        <Button
          variant="ghost"
          size={buttonSize}
          disabled={queerOwnedVerifiedPending}
          onClick={() =>
            setQueerOwnedVerified.mutate(
              { row, verified: !row.detail.queerOwnedVerified },
              {
                onSuccess: () => {
                  showToast(
                    t(
                      row.detail.queerOwnedVerified
                        ? "admin:adminListings.queerOwned.toast.unverified"
                        : "admin:adminListings.queerOwned.toast.verified",
                      { name: row.name },
                    ),
                    "success",
                  );
                  onDone?.();
                },
              },
            )
          }
        >
          {t(
            row.detail.queerOwnedVerified
              ? "admin:adminListings.queerOwned.unverifyCta"
              : "admin:adminListings.queerOwned.verifyCta",
          )}
        </Button>
      )}
      <OverflowMenu
        ariaLabel={t("admin:adminListings.actions.moreAriaLabel", {
          name: row.name,
        })}
        disabled={moderation.isPending}
        onRemove={() => setConfirmingRemove(true)}
      />
      {asking && (
        <AskQuestionModal
          row={row}
          askQuestion={moderation.ask}
          onClose={() => setAsking(false)}
          onAsked={() => {
            setAsking(false);
            onDone?.();
          }}
        />
      )}
      {confirmingRemove && (
        <RemoveListingConfirmModal
          row={row}
          pending={moderation.isPending}
          onConfirm={(reason) => moderation.remove(reason)}
          onClose={() => setConfirmingRemove(false)}
        />
      )}
      {sendingBack && (
        <SendBackReasonModal
          row={row}
          pending={moderation.isPending}
          onConfirm={(reason) => moderation.sendBack(reason)}
          onClose={() => setSendingBack(false)}
        />
      )}
    </>
  );
}

/** Keyboard- and click-outside-accessible `⋯` menu holding the destructive
 *  Remove action, kept out of the primary button row (APG menu-button
 *  pattern — modeled on `AdminRoleSwitcher`). */
function OverflowMenu({
  ariaLabel,
  disabled,
  onRemove,
}: {
  ariaLabel: string;
  disabled: boolean;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    itemRef.current?.focus();
    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      className={styles.overflow}
      ref={containerRef}
      onBlur={(event) => {
        // Tabbing away moves focus somewhere React's synthetic `onBlur`
        // (native `focusout`, which bubbles) reports as `relatedTarget` —
        // close unless that target is still inside the menu.
        if (open && !containerRef.current?.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.overflowTrigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <FiMoreVertical aria-hidden />
      </button>
      {open && (
        <div className={styles.overflowMenu} role="menu">
          <button
            ref={itemRef}
            type="button"
            role="menuitem"
            className={styles.overflowItem}
            disabled={disabled}
            onClick={() => {
              setOpen(false);
              onRemove();
            }}
          >
            {t("admin:adminListings.remove.cta")}
          </button>
        </div>
      )}
    </div>
  );
}
