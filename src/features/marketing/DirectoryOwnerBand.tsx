import { FiEdit3 } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { parseListingDate, type DirectoryPlace } from "./directoryPlaces";
import { useConfirmListingDetails } from "./listBusiness/api/useListingOwnerState";
import { listingFreshnessOf, type ListingFreshness } from "./listingFreshness";
import styles from "./DirectoryOwnerBand.module.css";

/**
 * The one sentence under the title, addressed to the owner.
 *
 * The visitor-facing stamp lower on the page states who confirmed the details
 * and when. This says the same fact back to the person who can change it, so
 * each state is worded as something they might do about it.
 */
function OwnerBandFreshnessLine({
  freshness,
  detailsConfirmedAt,
}: {
  freshness: ListingFreshness;
  detailsConfirmedAt: string | null | undefined;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  const confirmedAt = parseListingDate(detailsConfirmedAt);
  if (freshness === "unconfirmed" || !confirmedAt) {
    return (
      <p className={styles.freshness}>
        {t("marketing:directory.detail.ownerBand.freshness.unconfirmed")}
      </p>
    );
  }

  const date = fmt.date(confirmedAt);
  return (
    <p className={styles.freshness}>
      {freshness === "stale"
        ? t("marketing:directory.detail.ownerBand.freshness.stale", { date })
        : t("marketing:directory.detail.ownerBand.freshness.fresh", { date })}
    </p>
  );
}

/**
 * The owner's console strip, rendered above the public listing they own.
 *
 * `ownerRef` is the listing's owner-side reference, present only when the
 * viewer owns this entry, so its absence is the whole permission check: no
 * ref, no band.
 */
export function DirectoryOwnerBand({
  place,
  ownerRef,
}: {
  place: DirectoryPlace;
  ownerRef?: string;
}) {
  if (!ownerRef) return null;
  return <OwnedListingBand place={place} ownerRef={ownerRef} />;
}

/**
 * The band itself, split out so every hook below runs unconditionally once we
 * know the viewer owns the listing.
 *
 * The confirm button appears only while it would do something: a listing
 * confirmed within the last six months already reads as current, and a button
 * offered then is a permanent nag. The press goes through
 * `useConfirmListingDetails`, which fakes its own success in demo mode, so the
 * band behaves the same in both modes without a branch here.
 */
function OwnedListingBand({
  place,
  ownerRef,
}: {
  place: DirectoryPlace;
  ownerRef: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const confirmDetails = useConfirmListingDetails(ownerRef);

  const freshness = listingFreshnessOf(place.detailsConfirmedAt, new Date());
  const shouldOfferConfirm =
    freshness === "stale" || freshness === "unconfirmed";

  const handleConfirm = () => {
    confirmDetails.mutate(undefined, {
      onSuccess: () =>
        showToast(
          t("marketing:directory.detail.ownerBand.confirmToast"),
          "success",
        ),
      onError: () =>
        showToast(
          t("marketing:directory.detail.ownerBand.confirmError"),
          "error",
        ),
    });
  };

  return (
    <section
      className={styles.band}
      aria-labelledby="directory-owner-band-title"
    >
      <div className={styles.card}>
        <div className={styles.heading}>
          <FiEdit3 className={styles.icon} aria-hidden />
          <div>
            <p id="directory-owner-band-title" className={styles.title}>
              {t("marketing:directory.detail.ownerBand.title")}
            </p>
            <OwnerBandFreshnessLine
              freshness={freshness}
              detailsConfirmedAt={place.detailsConfirmedAt}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            to={routes.listBusinessEdit.replace(":ref", ownerRef)}
          >
            {t("marketing:directory.editThisListing")}
          </Button>
          {shouldOfferConfirm && (
            <Button
              variant="ghost"
              onClick={handleConfirm}
              disabled={confirmDetails.isPending}
            >
              {t("marketing:directory.detail.ownerBand.confirm")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
