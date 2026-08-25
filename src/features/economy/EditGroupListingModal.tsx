import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUpdateGroupListing } from "./api/useGroupListingOwnerActions";
import type { GroupListing } from "./housingGroups.data";
import { ModalShell, Sending } from "./ModalKit";
import { GroupListingFields } from "./GroupListingFields";
import { useGroupListingForm } from "./useGroupListingForm";
import styles from "./ApplicationModals.module.css";

/**
 * The poster corrects a room they shared inside a vetted housing group
 * (BE-HSG-20). Until this existed the create was the only member write on a
 * group listing, so a wrong price could not be fixed and a let room stayed
 * advertised.
 *
 * Every field here is one the group page renders, so every field is moderated:
 * saving a change sends the listing back to `review` and it leaves the group
 * page until a moderator clears it. That is said plainly before submit, and
 * submit stays closed while nothing has actually changed, so nobody pays the
 * review cost for a no-op save. The success toast repeats it rather than
 * claiming a quiet save.
 *
 * A 403 means the signed-in member did not post this room. The API's own
 * message is surfaced through `describeError` rather than being flattened into
 * a generic failure.
 */
export function EditGroupListingModal({
  groupSlug,
  listing,
  onClose,
}: {
  groupSlug: string;
  listing: GroupListing;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const form = useGroupListingForm(listing);
  const updateListing = useUpdateGroupListing(groupSlug);

  function handleSubmit() {
    if (!form.isValid || !form.hasChanges) return;
    updateListing.mutate(
      { listingId: listing.id, body: form.buildBody() },
      {
        // Confirmed from the server's answer, never before it.
        onSuccess: () => {
          showToast(t("economy:groupListing.toast.backToReview"), "info");
          onClose();
        },
        onError: (error) => {
          showToast(
            describeError(
              t("economy:groupListing.toast.editFailed"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          );
        },
      },
    );
  }

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:groupListing.edit.ariaLabel", {
        title: listing.title,
      })}
    >
      <div className={styles.eyebrow}>
        {t("economy:groupListing.edit.eyebrow")}
      </div>
      <h2 className={styles.title}>
        <Translation
          i18nKey="economy:groupListing.edit.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>{t("economy:groupListing.edit.sub")}</p>

      <p className={styles.reviewWarning}>
        <FiAlertTriangle aria-hidden />
        {t("economy:groupListing.edit.backToReviewWarning")}
      </p>

      <GroupListingFields form={form} />

      <div className={`${styles.foot} ${styles.footEnd}`}>
        <button type="button" className={styles.back} onClick={onClose}>
          {t("economy:housingModal.cancel")}
        </button>
        <Button
          variant="primary"
          size="lg"
          disabled={
            !form.isValid || !form.hasChanges || updateListing.isPending
          }
          onClick={handleSubmit}
        >
          {updateListing.isPending ? (
            <Sending label={t("economy:groupListing.edit.submitting")} />
          ) : (
            t("economy:groupListing.edit.submitCta")
          )}
        </Button>
      </div>
    </ModalShell>
  );
}
