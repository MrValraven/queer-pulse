import { useId } from "react";
import { FiEdit2, FiEye, FiLogOut, FiShare2, FiTrash2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PersonaOwnerAddress } from "./personaLinks.data";
import styles from "./SideCardFooter.module.css";

/** The destructive action this member is actually allowed to take on this
 *  persona: the creator deletes it, any other co-owner leaves it, and
 *  `"unknown"` is the brief window before the members roster answers. */
export type PersonaDangerAction = "delete" | "leave" | "unknown";

interface SideCardFooterProps {
  /** Opens the persona in the editor. */
  onEdit: () => void;
  /** Opens the persona's own public page. */
  onOpen: () => void;
  /** Opens the share card (QR + vCard + copy link). */
  onShare: () => void;
  /** Opens the type-to-confirm delete flow. Creator only. */
  onDelete: () => void;
  /** Opens the leave confirm. Every co-owner who did not create the persona. */
  onLeave: () => void;
  /** Whether this persona has a public address, and what it is. View and Share
   *  are the two actions that need one. */
  address: PersonaOwnerAddress;
  danger: PersonaDangerAction;
}

/**
 * The card's `.side-acts` action row (global class, ported in
 * `persona-dashboard.css`): equal-width Edit / View / Share, plus a compact
 * quiet Delete or Leave. `.side-acts-quiet` is this repo's stand-in for the
 * prototype's flex:none/compact `.btn-quiet`, applied via `Button`'s
 * `className` pass-through.
 *
 * Two states shape this row:
 *
 * **No public address.** An unlinked persona with no handle resolves nowhere,
 * so View and Share are DISABLED rather than hidden, with a line above saying
 * what to do about it. Hiding them would leave the owner with a card that has
 * fewer actions than the one beside it and no way to learn why, which reads as
 * a broken feature; the disabled pair plus one sentence says exactly what is
 * missing. The reason is reachable to a screen reader through
 * `aria-describedby` on both controls, and is on screen for everyone else.
 *
 * **Not the creator.** Deleting a persona is creator-only server-side, so a
 * co-owner is offered Leave in the slot where they went looking for Delete
 * instead of a confirmation that can only fail. Neither is rendered while the
 * roster is still resolving, which never shows the wrong one first.
 */
export function SideCardFooter({
  onEdit,
  onOpen,
  onShare,
  onDelete,
  onLeave,
  address,
  danger,
}: SideCardFooterProps) {
  const { t } = useTranslation();
  const noteId = useId();
  const hasNoAddress = address.status === "none";

  return (
    <>
      {hasNoAddress && (
        <p id={noteId} className={styles.addressNote}>
          {t("subprofiles:side.noAddressNote")}
        </p>
      )}

      <div className="side-acts">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <FiEdit2 aria-hidden /> {t("subprofiles:mine.rowEdit")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpen}
          disabled={hasNoAddress}
          aria-describedby={hasNoAddress ? noteId : undefined}
        >
          <FiEye aria-hidden /> {t("subprofiles:side.viewCta")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          disabled={hasNoAddress}
          aria-describedby={hasNoAddress ? noteId : undefined}
        >
          <FiShare2 aria-hidden /> {t("subprofiles:share.cta")}
        </Button>
        {danger === "delete" && (
          <Button
            variant="ghost"
            size="sm"
            className="side-acts-quiet"
            onClick={onDelete}
            aria-label={t("subprofiles:mine.rowDelete")}
            title={t("subprofiles:mine.rowDelete")}
          >
            <FiTrash2 aria-hidden />
          </Button>
        )}
        {danger === "leave" && (
          <Button
            variant="ghost"
            size="sm"
            className="side-acts-quiet"
            onClick={onLeave}
            aria-label={t("subprofiles:owners.leaveCta")}
            title={t("subprofiles:owners.leaveCta")}
          >
            <FiLogOut aria-hidden />
          </Button>
        )}
      </div>
    </>
  );
}
