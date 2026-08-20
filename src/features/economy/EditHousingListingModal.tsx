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
 * row — HSG-9 explicitly doesn't ask for a richer single-field editor. No
 * step-up/pledge gate here (those only apply to first posting/enquiring), and
 * no success panel — a save is a quiet PATCH, not a new submission.
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
    rent: String(listing.rentEuros),
    type: listing.type,
    bedrooms: listing.bedrooms !== undefined ? String(listing.bedrooms) : "",
    accessibility: listing.accessibilityInfo,
    virtualTour: listing.virtualTourUrl ?? "",
    billsIncluded: listing.billsIncluded,
    isAgent: listing.listerKind === "agent",
  });
  const action = useMyHousingListingAction();

  const handleSubmit = () => {
    if (!form.valid) return;
    const body: UpdateHousingListingBody = form.buildBody();
    action.mutate(
      { ref: listing.ref, action: "update", body },
      {
        onSuccess: () => {
          showToast(t("economy:myHousingListings.toast.updated"), "success");
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

      <ListSpaceFields form={form} />

      <div className={`${styles.foot} ${styles.footEnd}`}>
        <button type="button" className={styles.back} onClick={onClose}>
          {t("economy:housingModal.cancel")}
        </button>
        <Button
          variant="primary"
          size="lg"
          disabled={!form.valid || action.isPending}
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
