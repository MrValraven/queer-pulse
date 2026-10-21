import { useId } from "react";
import { AnimatePresence } from "motion/react";
import {
  Avatar,
  Button,
  Collapse,
  CollapseListItem,
} from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RsvpInviteView } from "./api/memberInvites.adapters";
import styles from "./RsvpConnectionInvites.module.css";

/** Statuses that mean the invitee is coming, drawn in jade beside the text.
 *  A waitlisted invitee may still not get a seat, so that answer stays in
 *  neutral ink. */
const POSITIVE_STATUSES = new Set<RsvpInviteView["status"]>(["going"]);

/**
 * The connections the member invited from their RSVP, one row each with the
 * invitee's answer so far. Rows grow in as invites go out and fold away when
 * one is withdrawn; the whole block folds away once the list is empty.
 */
export function RsvpInvitedList({
  invites,
  onWithdraw,
  withdrawingId,
}: {
  invites: RsvpInviteView[];
  onWithdraw: (id: string) => void;
  /** The invite whose withdraw is in flight, so only its button holds. */
  withdrawingId: string | null;
}) {
  const { t } = useTranslation();
  const listLabelId = useId();

  return (
    <Collapse isOpen={invites.length > 0}>
      <div className={styles.invited}>
        <p id={listLabelId} className={styles.listLabel}>
          {t("gatherings:rsvpInvites.listLabel")}
        </p>
        <ul className={styles.list} aria-labelledby={listLabelId}>
          <AnimatePresence initial={false}>
            {invites.map((invite) => (
              <CollapseListItem key={invite.id}>
                <RsvpInvitedRow
                  invite={invite}
                  isWithdrawing={withdrawingId === invite.id}
                  onWithdraw={onWithdraw}
                />
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </Collapse>
  );
}

/** One invitee: avatar, name, their answer, and the withdraw button while
 *  the invite is still open. */
function RsvpInvitedRow({
  invite,
  isWithdrawing,
  onWithdraw,
}: {
  invite: RsvpInviteView;
  isWithdrawing: boolean;
  onWithdraw: (id: string) => void;
}) {
  const { t } = useTranslation();
  const nameId = useId();
  // An invitee whose account is gone comes back with no name.
  const displayName = invite.name || t("gatherings:common.hostRemoved");
  const isPositive = POSITIVE_STATUSES.has(invite.status);

  return (
    <div className={styles.row}>
      {/* The name sits beside the avatar, so the image stays decorative. */}
      <Avatar
        initials={initialsFromName(displayName)}
        src={invite.avatarUrl}
        size={36}
      />
      <div className={styles.identity}>
        <span id={nameId} className={styles.name}>
          {displayName}
        </span>
        <span
          className={[styles.status, isPositive && styles.statusPositive]
            .filter(Boolean)
            .join(" ")}
        >
          {t(`gatherings:rsvpInvites.status.${invite.status}`)}
        </span>
      </div>
      {invite.canWithdraw ? (
        <Button
          variant="ghost"
          size="sm"
          className={styles.withdraw}
          aria-describedby={nameId}
          disabled={isWithdrawing}
          onClick={() => onWithdraw(invite.id)}
        >
          {t("gatherings:rsvpInvites.withdrawCta")}
        </Button>
      ) : null}
    </div>
  );
}
