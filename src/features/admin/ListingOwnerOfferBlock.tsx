import { useId, useState } from "react";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import {
  isDelegationConflictError,
  isDelegationNotFoundError,
  type ListingOwnerOfferDTO,
} from "./api/adminListingDelegation.api";
import {
  useOfferListingOwnership,
  useRevokeListingOwnershipOffer,
} from "./api/useAdminListingDelegation";
import { delegationMemberName } from "./listingDelegation.helpers";
import styles from "./ListingDelegationSection.module.css";

/**
 * The ownership offer on one listing: who it went to, what the admin wrote,
 * when it was sent, and how to withdraw it.
 *
 * Three rules the server enforces are said here in words, so an admin can
 * plan around them before a 409 arrives:
 *
 * - An offer can only be extended on a listing that has NO owner. On an owned
 *   listing this block states that and shows no control at all.
 * - A listing carries at most one open offer. Offering it to somebody else
 *   starts with withdrawing the one that is open.
 * - The offer is read from the server on every open, so an offer answered or
 *   withdrawn elsewhere is reflected here. A withdraw that comes back 404 has
 *   met exactly that, and says so.
 * - The member decides. Ownership moves on their accept, so an open offer
 *   is still a question waiting for an answer.
 */
export function ListingOwnerOfferBlock({
  listingRef,
  ownerSlug,
  openOffer,
}: {
  listingRef: string;
  /** The listing's owner, `null` while the house still holds it. */
  ownerSlug: string | null;
  openOffer: ListingOwnerOfferDTO | null;
}) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const slugFieldId = useId();
  const noteFieldId = useId();
  const [memberSlug, setMemberSlug] = useState("");
  const [note, setNote] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const offer = useOfferListingOwnership(listingRef);
  const revoke = useRevokeListingOwnershipOffer(listingRef);

  const offereeName = delegationMemberName(
    openOffer?.offeree ?? null,
    t("admin:listingDelegation.unknownMember"),
  );

  function send() {
    const trimmedSlug = memberSlug.trim();
    if (!trimmedSlug) return;
    setErrorKey(null);
    offer.mutate(
      { memberSlug: trimmedSlug, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setMemberSlug("");
          setNote("");
          showToast(
            t("admin:listingDelegation.offer.sentToast", {
              slug: trimmedSlug,
            }),
            "success",
          );
        },
        onError: (error) => setErrorKey(offerErrorKey(error)),
      },
    );
  }

  function withdraw() {
    setErrorKey(null);
    revoke.mutate(undefined, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        showToast(t("admin:listingDelegation.offer.revokedToast"), "success");
      },
      onError: (error) => {
        setIsConfirmOpen(false);
        setErrorKey(
          isDelegationNotFoundError(error)
            ? "admin:listingDelegation.offer.revokeGoneError"
            : "admin:listingDelegation.offer.revokeFailedError",
        );
      },
    });
  }

  return (
    <div className={styles.block}>
      <h5 className={styles.blockHeading}>
        {t("admin:listingDelegation.offer.heading")}
      </h5>

      {ownerSlug ? (
        <p className={styles.notice}>
          {t("admin:listingDelegation.offer.ownedNotice")}
        </p>
      ) : openOffer ? (
        <>
          <p className={styles.line}>
            {t("admin:listingDelegation.offer.offeredTo", {
              name: offereeName,
            })}
          </p>
          <p className={styles.meta}>
            {t("admin:listingDelegation.offer.sentOn", {
              date: formatDate(openOffer.offeredAt, language),
            })}{" "}
            · {t("admin:listingDelegation.offer.awaitingReply")}
          </p>
          {openOffer.note && <p className={styles.quote}>{openOffer.note}</p>}
          <p className={`${styles.notice} ${styles.noticeWarn}`}>
            {t("admin:listingDelegation.offer.oneAtATime")}
          </p>
          <div className={styles.formActions}>
            <Button
              variant="danger"
              size="sm"
              disabled={revoke.isPending}
              onClick={() => setIsConfirmOpen(true)}
            >
              {t("admin:listingDelegation.offer.revokeCta")}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.line}>
            {t("admin:listingDelegation.offer.none")}
          </p>
          <div className={styles.form}>
            <label className={styles.meta} htmlFor={slugFieldId}>
              {t("admin:listingDelegation.offer.slugLabel")}
            </label>
            <input
              id={slugFieldId}
              className={styles.input}
              value={memberSlug}
              autoComplete="off"
              placeholder={t("admin:listingDelegation.slugPlaceholder")}
              onChange={(event) => setMemberSlug(event.target.value)}
            />
            <label className={styles.meta} htmlFor={noteFieldId}>
              {t("admin:listingDelegation.offer.noteLabel")}
            </label>
            <textarea
              id={noteFieldId}
              className={styles.textarea}
              value={note}
              maxLength={1000}
              placeholder={t("admin:listingDelegation.offer.notePlaceholder")}
              onChange={(event) => setNote(event.target.value)}
            />
            <div className={styles.formActions}>
              <Button
                size="sm"
                disabled={memberSlug.trim().length === 0 || offer.isPending}
                onClick={send}
              >
                {t(
                  offer.isPending
                    ? "admin:listingDelegation.offer.sendingCta"
                    : "admin:listingDelegation.offer.sendCta",
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      {errorKey && (
        <p className={styles.error} role="alert">
          {t(errorKey)}
        </p>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={withdraw}
        tone="destructive"
        loading={revoke.isPending}
        title={t("admin:listingDelegation.offer.revokeConfirmTitle", {
          name: offereeName,
        })}
        confirmLabel={t("admin:listingDelegation.offer.revokeConfirmCta")}
      >
        <p>{t("admin:listingDelegation.offer.revokeConfirmBody")}</p>
      </ConfirmDialog>
    </div>
  );
}

/** Say what the server refused and why, in words an admin can act on. */
function offerErrorKey(error: unknown): string {
  if (isDelegationConflictError(error)) {
    return "admin:listingDelegation.offer.conflictError";
  }
  if (isDelegationNotFoundError(error)) {
    return "admin:listingDelegation.unknownSlugError";
  }
  return "admin:listingDelegation.offer.failedError";
}
