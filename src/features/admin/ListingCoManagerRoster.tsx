import { useId, useState } from "react";
import { Badge, Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { CO_MANAGER_SEAT_CAP } from "../marketing/listBusiness/api/listingCoManagers.api";
import {
  isDelegationConflictError,
  isDelegationNotFoundError,
  type ListingCoManagerDTO,
} from "./api/adminListingDelegation.api";
import {
  useInviteListingCoManager,
  useRevokeListingCoManager,
} from "./api/useAdminListingDelegation";
import { delegationMemberName } from "./listingDelegation.helpers";
import styles from "./ListingDelegationSection.module.css";

/**
 * The co-manager roster for one listing, with a seat-by-slug control.
 *
 * Two things the seats do NOT all do alike are said out loud, so an admin
 * reads them here:
 *
 * - An `invited` seat grants nothing. The member has been asked and has not
 *   answered, so the row says so and never reads as though they are already
 *   running the page.
 * - A seat opened while the house still holds the listing is stamped
 *   staff-attached server-side and survives the handover to a new owner. A
 *   seat opened on a listing that already has an owner leaves with that owner.
 *   The seat DTO carries no provenance flag, so an owned listing's roster is
 *   a MIX that cannot be labelled row by row. The notice therefore sits by
 *   the invite control, describing the seat that control would create.
 */
export function ListingCoManagerRoster({
  listingRef,
  coManagers,
  isListingUnowned,
}: {
  listingRef: string;
  coManagers: ListingCoManagerDTO[];
  /** True while the house still holds the listing, which is what decides
   *  whether a seat opened now survives a later handover. */
  isListingUnowned: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const slugFieldId = useId();
  const [memberSlug, setMemberSlug] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const invite = useInviteListingCoManager(listingRef);
  const isSeatCapReached = coManagers.length >= CO_MANAGER_SEAT_CAP;

  function send() {
    const trimmedSlug = memberSlug.trim();
    if (!trimmedSlug) return;
    setErrorKey(null);
    invite.mutate(trimmedSlug, {
      onSuccess: () => {
        setMemberSlug("");
        showToast(
          t("admin:listingDelegation.roster.invitedToast", {
            slug: trimmedSlug,
          }),
          "success",
        );
      },
      onError: (error) => setErrorKey(inviteErrorKey(error)),
    });
  }

  return (
    <div className={styles.block}>
      <h5 className={styles.blockHeading}>
        {t("admin:listingDelegation.roster.heading")}
      </h5>
      <p className={styles.meta}>
        {t("admin:listingDelegation.roster.seats", {
          used: coManagers.length,
          cap: CO_MANAGER_SEAT_CAP,
        })}
      </p>

      {coManagers.length === 0 ? (
        <p className={styles.line}>
          {t("admin:listingDelegation.roster.empty")}
        </p>
      ) : (
        <ul className={styles.rows}>
          {coManagers.map((seat) => (
            <CoManagerSeatRow
              key={seat.id}
              listingRef={listingRef}
              seat={seat}
            />
          ))}
        </ul>
      )}

      {isSeatCapReached ? (
        <p className={`${styles.notice} ${styles.noticeWarn}`} role="status">
          {t("admin:listingDelegation.roster.seatsFullNotice")}
        </p>
      ) : (
        <div className={styles.form}>
          {/* Sits beside the control, describing the seat this invite would
              create. Above the list it would have read as a claim about the
              seats already there, and an owned listing's roster is a MIX: a
              seat stamped `isStaffAttached` while the listing was unowned
              survives a handover, and an owner's own appointees leave with
              them. */}
          <p className={styles.notice}>
            {t(
              isListingUnowned
                ? "admin:listingDelegation.roster.staffSeatNotice"
                : "admin:listingDelegation.roster.ownerSeatNotice",
            )}
          </p>
          <label className={styles.meta} htmlFor={slugFieldId}>
            {t("admin:listingDelegation.roster.inviteLabel")}
          </label>
          <input
            id={slugFieldId}
            className={styles.input}
            value={memberSlug}
            autoComplete="off"
            placeholder={t("admin:listingDelegation.slugPlaceholder")}
            onChange={(event) => setMemberSlug(event.target.value)}
          />
          <div className={styles.formActions}>
            <Button
              size="sm"
              disabled={memberSlug.trim().length === 0 || invite.isPending}
              onClick={send}
            >
              {t(
                invite.isPending
                  ? "admin:listingDelegation.roster.invitingCta"
                  : "admin:listingDelegation.roster.inviteCta",
              )}
            </Button>
          </div>
        </div>
      )}

      {errorKey && (
        <p className={styles.error} role="alert">
          {t(errorKey)}
        </p>
      )}
    </div>
  );
}

/** One seat: who holds it, how far along it is, and a confirmed way back. */
function CoManagerSeatRow({
  listingRef,
  seat,
}: {
  listingRef: string;
  seat: ListingCoManagerDTO;
}) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const revoke = useRevokeListingCoManager(listingRef);

  const isInvited = seat.status === "invited";
  // `listSeatsForListing` filters to LIVE_LISTING_CO_MANAGER_STATUSES, so the
  // server sends `invited` and `active` only. A demo fixture or a widened
  // filter could still hand over an ended seat, and painting one jade with
  // "Editing since" would say the person is running the page. It reads as
  // ended, and the remove action drops away with the seat it would target.
  const isEnded = seat.status !== "invited" && seat.status !== "active";
  const memberName = delegationMemberName(
    seat.member,
    t("admin:listingDelegation.unknownMember"),
  );
  const removeKey = isInvited
    ? "admin:listingDelegation.roster.cancelInviteCta"
    : "admin:listingDelegation.roster.removeCta";
  const whenKey = isEnded
    ? "admin:listingDelegation.roster.endedOn"
    : isInvited
      ? "admin:listingDelegation.roster.invitedOn"
      : "admin:listingDelegation.roster.acceptedOn";
  const whenDate = isEnded
    ? (seat.endedAt ?? seat.invitedAt)
    : (seat.acceptedAt ?? seat.invitedAt);
  const badgeTone = isEnded ? "ghost" : isInvited ? "amber" : "jade";

  function remove() {
    if (!seat.member) return;
    revoke.mutate(seat.member.slug, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        showToast(t("admin:listingDelegation.roster.removedToast"), "success");
      },
      onError: () => {
        setIsConfirmOpen(false);
        showToast(
          t("admin:listingDelegation.roster.removeFailedError"),
          "error",
        );
      },
    });
  }

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        <span className={styles.rowName}>{memberName}</span>
        <span className={styles.meta}>
          {t(whenKey, { date: formatDate(whenDate, language) })}
        </span>
      </div>
      <Badge tone={badgeTone}>
        {t(`admin:listingDelegation.roster.status.${seat.status}`)}
      </Badge>
      {seat.member && !isEnded && (
        <div className={styles.rowActions}>
          <Button
            variant="ghost"
            size="sm"
            disabled={revoke.isPending}
            onClick={() => setIsConfirmOpen(true)}
          >
            {t(removeKey)}
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={remove}
        tone="destructive"
        loading={revoke.isPending}
        title={t("admin:listingDelegation.roster.removeConfirmTitle", {
          name: memberName,
        })}
        confirmLabel={t("admin:listingDelegation.roster.removeConfirmCta")}
      >
        <p>
          {t(
            isInvited
              ? "admin:listingDelegation.roster.cancelInviteConfirmBody"
              : "admin:listingDelegation.roster.removeConfirmBody",
          )}
        </p>
      </ConfirmDialog>
    </li>
  );
}

/** Say what the server refused, in words an admin can act on. */
function inviteErrorKey(error: unknown): string {
  if (isDelegationConflictError(error)) {
    return "admin:listingDelegation.roster.conflictError";
  }
  if (isDelegationNotFoundError(error)) {
    return "admin:listingDelegation.unknownSlugError";
  }
  return "admin:listingDelegation.roster.failedError";
}
