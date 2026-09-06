import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { UpdateHousingListingBody } from "./api/housingListing.api";
import { useMyHousingListingAction } from "./api/useHousingListingOwnerActions";
import type { MyHousingListingRow } from "./myHousingListings.data";
import { ModalShell, Sending } from "./ModalKit";
import { ListSpaceFields } from "./ListSpaceFields";
import { useListSpaceForm } from "./useListSpaceForm";
import styles from "./ApplicationModals.module.css";

/**
 * Edits one of the caller's own listings, reusing the create flow's exact
 * field set (`ListSpaceFields`/`useListSpaceForm`) seeded from the current
 * row. HSG-9 explicitly doesn't ask for a richer single-field editor, and
 * there is no step-up/pledge gate here (those only apply to first posting or
 * enquiring).
 *
 * A save is NOT always quiet any more. Every field this form exposes is a
 * moderated field (BE-HSG-02), so editing a listing that is currently `live`
 * sends it back to `review` server-side and it leaves public browse until a
 * moderator clears it again. The owner is warned before they submit and the
 * confirmation says what actually happened, taken from the status the PATCH
 * returns rather than assumed.
 */
export function EditHousingListingModal({
  listing,
  onClose,
}: {
  listing: MyHousingListingRow;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const form = useListSpaceForm({
    title: listing.title,
    area: listing.area,
    // The owner read carries their own stored address (absent when they never
    // added one). Seeding it matters twice over: the field would otherwise
    // render blank on a listing that HAS an address, and the form always sends
    // this field, so a blank would silently erase it.
    addressLine: listing.addressLine ?? "",
    rent: String(listing.rentEuros),
    // Null is "not stated", which seeds as a blank field. Do NOT seed a 0: it
    // would turn a deposit nobody stated into a stated zero on the next save.
    deposit: listing.depositEuros !== null ? String(listing.depositEuros) : "",
    type: listing.type,
    bedrooms: listing.bedrooms !== undefined ? String(listing.bedrooms) : "",
    accessibility: listing.accessibilityInfo,
    virtualTour: listing.virtualTourUrl ?? "",
    billsIncluded: listing.billsIncluded,
    isAgent: listing.listerKind === "agent",
    blurb: listing.blurb,
    description: listing.description,
    availableFrom: listing.availableFrom ?? "",
    minStayMonths:
      listing.minStayMonths !== null ? String(listing.minStayMonths) : "",
    features: listing.features,
    idealFor: listing.idealFor,
    // Already-stored photos come back as resolved `/files/<key>` URLs. Both
    // halves are that URL: it renders directly, and the backend normalises it
    // back to the storage key when this form re-sends it.
    photos: listing.gallery.map((photoUrl) => ({
      reference: photoUrl,
      previewUrl: photoUrl,
    })),
  });
  const action = useMyHousingListingAction();
  const isCurrentlyLive = listing.status === "live";

  const handleSubmit = () => {
    if (!form.isValid) return;
    const body: UpdateHousingListingBody = form.buildBody();
    action.mutate(
      { ref: listing.ref, action: "update", body },
      {
        onSuccess: (updated) => {
          // The server decides: an edit that changed a moderated field on a
          // live listing comes back as `review`, so read the outcome instead
          // of claiming a quiet save.
          const hasReturnedToReview =
            isCurrentlyLive && updated?.status === "review";
          showToast(
            hasReturnedToReview
              ? t("economy:myHousingListings.toast.backToReview")
              : t("economy:myHousingListings.toast.updated"),
            hasReturnedToReview ? "info" : "success",
          );
          onClose();
        },
        onError: () =>
          showToast(t("economy:myHousingListings.toast.error"), "error"),
      },
    );
  };

  return (
    <ModalShell onClose={onClose}>
      <div className={styles.eyebrow}>
        {t("economy:myHousingListings.edit.eyebrow")}
      </div>
      <h2 className={styles.title}>
        <Translation
          i18nKey="economy:myHousingListings.edit.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>{t("economy:myHousingListings.edit.sub")}</p>

      {isCurrentlyLive && (
        <p className={styles.reviewWarning}>
          <FiAlertTriangle aria-hidden />
          {t("economy:myHousingListings.edit.backToReviewWarning")}
        </p>
      )}

      <ListSpaceFields form={form} />

      <div className={`${styles.foot} ${styles.footEnd}`}>
        <button type="button" className={styles.back} onClick={onClose}>
          {t("economy:housingModal.cancel")}
        </button>
        <Button
          variant="primary"
          size="lg"
          disabled={!form.isValid || action.isPending}
          onClick={handleSubmit}
        >
          {action.isPending ? (
            <Sending label={t("economy:myHousingListings.edit.submitting")} />
          ) : (
            t("economy:myHousingListings.edit.submitCta")
          )}
        </Button>
      </div>
    </ModalShell>
  );
}
