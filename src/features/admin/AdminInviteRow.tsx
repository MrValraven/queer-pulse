import { useId, type KeyboardEvent } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { AdminChip } from "./ui";
import { AdminArrowSeparator } from "./ui/AdminInlineMarkers";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { ADMIN_INVITE_STATUS_TONE } from "./adminInviteStatusTone";
import type { AdminInviteDTO } from "./api/adminInvites.api";
import styles from "./AdminInvitesPage.module.css";

/** Same curve as the `--ease` token, for motion's JS-driven transitions. */
const EASE_CURVE = [0.22, 0.68, 0.16, 1] as const;

/** Day + month + year, locale-aware. */
function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Who the invite was addressed to: the member who accepted, a target email, or
 *  "anyone with the link". */
function recipientLine(invite: AdminInviteDTO, t: TFunction): string {
  if (invite.invitee) {
    return t("admin:adminInvites.row.toMember", { name: invite.invitee.name });
  }
  if (invite.email) {
    return t("admin:adminInvites.row.toEmail", { email: invite.email });
  }
  return t("admin:adminInvites.row.toAnyone");
}

/** Where a card stands in select mode. Absent outside it. */
export interface AdminInviteRowSelection {
  isSelected: boolean;
  /** True once the selection is at the bulk cap and this card is outside it;
   *  a selected card stays enabled so it can be let go. */
  isDisabled: boolean;
  onToggle: () => void;
}

/**
 * The select-mode checkbox at a card's top-left. The slot takes its full
 * width the moment select mode starts, so the card's text rewraps once, and
 * only the checkbox fades and scales in. Leaving select mode plays the same
 * in reverse and the slot goes when it ends. The slot carries the opacity and
 * the checkbox the scale: a transform on the slot would make it the
 * containing block for the label's stretched `::after`, shrinking the card's
 * hit area to the slot. It is `inert` while it fades away, so that label can
 * no longer catch a click meant for the card.
 */
function AdminInviteRowCheck({
  code,
  selection,
  isLeaving,
  describedById,
}: {
  code: string;
  selection: AdminInviteRowSelection;
  isLeaving: boolean;
  describedById: string;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  // The lint rule cannot see a motion input nested in the label, so the
  // label also names it by id.
  const checkboxId = useId();
  const transition = { duration: reducedMotion ? 0 : 0.2, ease: EASE_CURVE };
  return (
    <m.span
      className={styles.rowCheckSlot}
      inert={!isPresent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <label className={styles.rowCheckHit} htmlFor={checkboxId}>
        <m.input
          id={checkboxId}
          type="checkbox"
          className={styles.rowCheckbox}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.6 }}
          transition={transition}
          checked={selection.isSelected}
          disabled={selection.isDisabled}
          tabIndex={isLeaving ? -1 : undefined}
          aria-label={t("admin:adminInvites.select.rowAriaLabel", { code })}
          aria-describedby={describedById}
          onChange={selection.onToggle}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            selection.onToggle();
          }}
        />
      </label>
    </m.span>
  );
}

/**
 * One invite card in the oversight grid.
 *
 * Outside select mode the whole card is a button that opens the drawer. In
 * select mode it holds a real checkbox at its top-left, which fades and
 * scales in; the checkbox's label stretches over the card, so a
 * click anywhere on it toggles the box, Space toggles it natively and Enter
 * does too. The checkbox is described by the card's body, so a screen reader
 * hears the status, sender, recipient and dates along with the code.
 */
export function AdminInviteRow({
  invite,
  onOpen,
  isLeaving,
  selection,
}: {
  invite: AdminInviteDTO;
  onOpen: () => void;
  /** On its way out of the grid: no longer a Tab stop. */
  isLeaving: boolean;
  selection: AdminInviteRowSelection | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const detailsId = useId();
  const isSelectMode = selection !== null;
  const className = [
    styles.row,
    isSelectMode && styles.rowSelectable,
    selection?.isSelected && styles.rowSelected,
    selection?.isDisabled && styles.rowSelectDisabled,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      {...(isSelectMode
        ? {}
        : {
            role: "button",
            tabIndex: isLeaving ? -1 : 0,
            "aria-label": t("admin:adminInvites.row.open", {
              code: invite.code,
            }),
            onClick: onOpen,
            onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen();
              }
            },
          })}
    >
      <AnimatePresence initial={false}>
        {selection && (
          <AdminInviteRowCheck
            key="select"
            code={invite.code}
            selection={selection}
            isLeaving={isLeaving}
            describedById={detailsId}
          />
        )}
      </AnimatePresence>
      <div className={styles.rowMain} id={detailsId}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{invite.code}</span>
          <AdminChip tone={ADMIN_INVITE_STATUS_TONE[invite.status]} dot>
            {t(`admin:adminInvites.status.${invite.status}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminInvites.row.from", { name: invite.inviter.name })}
          <AdminArrowSeparator />
          {recipientLine(invite, t)}
        </div>
        <div className={styles.rowDates}>
          {t("admin:adminInvites.row.sent", {
            date: shortDate(fmt, invite.createdAt),
          })}
          {" · "}
          {t("admin:adminInvites.row.expires", {
            date: shortDate(fmt, invite.expiresAt),
          })}
        </div>
      </div>
    </div>
  );
}
