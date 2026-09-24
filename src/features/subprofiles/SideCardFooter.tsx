import { useId } from "react";
import { FiEdit2, FiEye, FiLogOut, FiShare2, FiTrash2 } from "react-icons/fi";
import { Button, IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PersonaRowActionsMenu } from "./PersonaRowActionsMenu";
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
  /** `"card"` (the default) is the card's full-width `.side-acts` bar;
   *  `"row"` is the List view's compact icon-only cluster. */
  variant?: "card" | "row";
  /** The persona's display name, which the row variant's icon-only buttons
   *  put in their accessible names ("Edit Maya"), since a list of rows would
   *  otherwise read as a run of identical "Edit" buttons. */
  personaName?: string;
}

/**
 * The owner action set for one persona, in the shape its presenter needs:
 * `SideCard` takes the default `"card"` bar, `SideRow` takes `variant="row"`.
 * Both honour the same two rules (disabled View and Share with an on-screen
 * reason when there is no public address, and Delete or Leave by creator).
 */
export function SideCardFooter(props: SideCardFooterProps) {
  return props.variant === "row" ? (
    <SideRowActions {...props} />
  ) : (
    <SideCardActions {...props} />
  );
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
function SideCardActions({
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

/**
 * The List view's action cluster: the same actions as the card bar, quieter.
 * Edit keeps its word as the row's one outlined action; View, Share and the
 * Delete or Leave slot are borderless `IconButton`s. Every control carries
 * the persona's name in its `aria-label` and shows that same name in the
 * shared `Tooltip` on hover, focus and tap (no native `title`, which is slow,
 * OS styled and would double up with the bubble).
 *
 * The danger slot is always four controls wide: while the roster is still
 * resolving (`"unknown"`) an empty placeholder holds the place, so the
 * actions never shift sideways when Delete or Leave arrives, and the column
 * stays lined up with the rows around it.
 *
 * With no public address the reason sits as a small line under the buttons,
 * stays on screen, and is the `aria-describedby` target of the disabled View
 * and Share. Deliberately clear of the global `.side-acts` class, which is the
 * card's bordered bar.
 *
 * A narrow row (the row's own 680px container query, where the actions share
 * a bottom bar with the reorder controls) trades the whole cluster and its
 * note for one labelled `PersonaRowActionsMenu`, which lists the same actions
 * under the same rules. Both are rendered and the stylesheet shows one:
 * `display: none` takes the other out of the tab order and the accessibility
 * tree, so a keyboard or screen reader only ever meets the visible set.
 */
function SideRowActions({
  onEdit,
  onOpen,
  onShare,
  onDelete,
  onLeave,
  address,
  danger,
  personaName,
}: SideCardFooterProps) {
  const { t } = useTranslation();
  const noteId = useId();
  const hasNoAddress = address.status === "none";
  const describedBy = hasNoAddress ? noteId : undefined;
  const name = personaName || t("subprofiles:mine.untitled");
  const editLabel = t("subprofiles:mine.rowEditNamed", { name });
  const viewLabel = t("subprofiles:mine.rowViewNamed", { name });
  const shareLabel = t("subprofiles:mine.rowShareNamed", { name });
  const deleteLabel = t("subprofiles:mine.rowDeleteNamed", { name });
  const leaveLabel = t("subprofiles:mine.rowLeaveNamed", { name });

  return (
    <div className={styles.rowFoot}>
      <div className={styles.rowActs}>
        <Tooltip label={editLabel} placement="top">
          <Button
            variant="ghost"
            size="sm"
            className={styles.rowEdit}
            onClick={onEdit}
            aria-label={editLabel}
          >
            <FiEdit2 aria-hidden />
            {t("subprofiles:mine.rowEdit")}
          </Button>
        </Tooltip>
        <Tooltip label={viewLabel} placement="top">
          <IconButton
            size="sm"
            className={styles.rowIcon}
            onClick={onOpen}
            disabled={hasNoAddress}
            aria-describedby={describedBy}
            aria-label={viewLabel}
          >
            <FiEye aria-hidden />
          </IconButton>
        </Tooltip>
        <Tooltip label={shareLabel} placement="top">
          <IconButton
            size="sm"
            className={styles.rowIcon}
            onClick={onShare}
            disabled={hasNoAddress}
            aria-describedby={describedBy}
            aria-label={shareLabel}
          >
            <FiShare2 aria-hidden />
          </IconButton>
        </Tooltip>
        {danger === "delete" && (
          <Tooltip label={deleteLabel} placement="top">
            <IconButton
              size="sm"
              className={`${styles.rowIcon} ${styles.rowDanger}`}
              onClick={onDelete}
              aria-label={deleteLabel}
            >
              <FiTrash2 aria-hidden />
            </IconButton>
          </Tooltip>
        )}
        {danger === "leave" && (
          <Tooltip label={leaveLabel} placement="top">
            <IconButton
              size="sm"
              className={`${styles.rowIcon} ${styles.rowDanger}`}
              onClick={onLeave}
              aria-label={leaveLabel}
            >
              <FiLogOut aria-hidden />
            </IconButton>
          </Tooltip>
        )}
        {danger === "unknown" && (
          <span className={styles.rowIconSlot} aria-hidden />
        )}
      </div>
      {hasNoAddress && (
        <p id={noteId} className={styles.rowNote}>
          {t("subprofiles:side.noAddressNote")}
        </p>
      )}
      <PersonaRowActionsMenu
        className={styles.rowMenu}
        personaName={name}
        hasNoAddress={hasNoAddress}
        danger={danger}
        onEdit={onEdit}
        onOpen={onOpen}
        onShare={onShare}
        onDelete={onDelete}
        onLeave={onLeave}
      />
    </div>
  );
}
