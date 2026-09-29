import { useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { businessPath } from "../../app/routeMap";
import { useListingModeration } from "./api/useListingModeration";
import { useQueerOwnedToggle } from "./useQueerOwnedToggle";
import { AskQuestionModal } from "./AskQuestionModal";
import {
  ListingOverflowMenu,
  type OverflowMenuItem,
} from "./ListingOverflowMenu";
import { RemoveListingConfirmModal } from "./RemoveListingConfirmModal";
import { SendBackReasonModal } from "./SendBackReasonModal";
import type { ListingQueueRow } from "./api/adminListings.api";
import menuStyles from "./ListingOverflowMenu.module.css";

/**
 * The one moderation-action cluster shared by the queue row and the drawer
 * footer, driven entirely by `useListingModeration`, whose unified `isPending`
 * disables every control here together.
 *
 * The row shows a single primary action ("Publish live" while the listing
 * waits, "View live" once it is live) and carries the rest in the `⋮` menu:
 * Ask a question or Back to review, the queer-owned toggle, then Delete under
 * a divider. The drawer keeps the full button set, with only Delete in its
 * menu.
 *
 * Renders an unwrapped fragment: the row's actions cell and the drawer's
 * `Modal` footer both lay the controls out as a flex row.
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
  const [asking, setAsking] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [sendingBack, setSendingBack] = useState(false);
  const moderation = useListingModeration(row, {
    // `remove`/`sendBack` both resolve through this: close whichever local
    // confirm dialog is open so a moderator on a status tab that keeps
    // showing the row after the move (e.g. "All") sees the dialog go away.
    // Both start `false`, so the rest of the time this changes nothing; the
    // drawer's own `onClose` still fires after.
    onDone: () => {
      setConfirmingRemove(false);
      setSendingBack(false);
      onDone?.();
    },
  });
  const queerOwned = useQueerOwnedToggle(row, onDone);
  const queerOwnedVerifiedPending =
    moderation.isPending || queerOwned.isPending;
  const isRow = variant === "row";
  const isLive = row.status === "live";
  const isInReview = row.status === "review";

  const askItem: OverflowMenuItem = {
    key: "ask",
    label: t("admin:adminListings.advance.question"),
    disabled: moderation.isPending,
    onSelect: () => setAsking(true),
  };
  const sendBackItem: OverflowMenuItem = {
    key: "sendBack",
    label: t("admin:adminListings.sendBackCta"),
    disabled: moderation.isPending,
    onSelect: () => setSendingBack(true),
  };
  const queerOwnedItems: OverflowMenuItem[] = queerOwned.isAvailable
    ? [
        {
          key: "queerOwned",
          label: queerOwned.label,
          disabled: queerOwnedVerifiedPending,
          onSelect: queerOwned.toggle,
        },
      ]
    : [];
  const removeItem: OverflowMenuItem = {
    key: "remove",
    label: t("admin:adminListings.remove.cta"),
    tone: "danger",
    disabled: moderation.isPending,
    onSelect: () => setConfirmingRemove(true),
  };
  const menuItems = isRow
    ? [isInReview ? askItem : sendBackItem, ...queerOwnedItems, removeItem]
    : [removeItem];
  const buttonSize = isRow ? "sm" : undefined;
  const primaryClassName = isRow ? menuStyles.primaryAction : undefined;
  // In a row, "Publish live" is a quiet tonal pill so the listing names lead.
  const publishClassName = isRow
    ? `${menuStyles.primaryAction} ${menuStyles.primaryTonal}`
    : undefined;

  return (
    <>
      {!isLive && (
        <Button
          variant="jade"
          size={buttonSize}
          className={publishClassName}
          onClick={() => moderation.moveTo("live")}
          disabled={moderation.isPending}
        >
          {t("admin:adminListings.advance.live")}
        </Button>
      )}
      {!isRow && (
        <Button
          variant="ghost"
          onClick={() => (isInReview ? setAsking(true) : setSendingBack(true))}
          disabled={moderation.isPending}
        >
          {t(
            isInReview
              ? "admin:adminListings.advance.question"
              : "admin:adminListings.sendBackCta",
          )}
        </Button>
      )}
      {isLive && (
        // A new tab, so the moderator keeps their place in the queue.
        <Button
          variant="ghost"
          size={buttonSize}
          className={primaryClassName}
          to={businessPath(row.slug)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("admin:adminListings.viewLiveCta")}
          {isRow && <FiExternalLink aria-hidden />}
        </Button>
      )}
      {!isRow && queerOwned.isAvailable && (
        <Button
          variant="ghost"
          disabled={queerOwnedVerifiedPending}
          onClick={queerOwned.toggle}
        >
          {queerOwned.label}
        </Button>
      )}
      <ListingOverflowMenu
        items={menuItems}
        ariaLabel={t("admin:adminListings.actions.moreAriaLabel", {
          name: row.name,
        })}
        disabled={moderation.isPending}
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
          onConfirm={moderation.remove}
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
