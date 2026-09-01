import { Button, Stars } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HousingReviewDTO } from "./api/housingReviews.api";
import styles from "./housingModals.module.css";
import panel from "./ReviewViewingModal.module.css";

/**
 * The review has gone public, so it stands as it was filed.
 *
 * This is the end of the edit window, and it is shown in three different
 * situations that a member experiences identically:
 *
 *  1. The pair said the review had already revealed because the counterparty
 *     submitted theirs, so no edit was offered in the first place.
 *  2. The pair said it had revealed because the anti-retaliation window ran out
 *     and the counterparty never wrote anything. Same field, same answer: this
 *     used to be the case nothing on the wire could describe, so the form was
 *     offered and the save came back 409.
 *  3. The member had the form open and the counterparty submitted underneath
 *     them, so `PATCH` came back 409.
 *
 * The last is not a mistake anybody made, and the copy does not treat it as
 * one. It says what happened and stops offering to save, rather than leaving a
 * form that would refuse the same words again. Their review is shown back to
 * them, read-only, because "you cannot change this" is a poor answer to somebody
 * who at that moment wants to know what it says.
 */
export function ReviewViewingPublicNotice({
  review,
  onClose,
}: {
  review: HousingReviewDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.eye}>
        {t("economy:housingViewing.review.gonePublicEyebrow")}
      </div>
      <div className={styles.title}>
        <Translation
          i18nKey="economy:housingViewing.review.gonePublicTitle"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.sub}>
        {t("economy:housingViewing.review.gonePublicBody")}
      </p>

      <div className={panel.standing}>
        <Stars
          value={review.rating}
          label={t("economy:housingViewing.reviews.ratingAria", {
            count: review.rating,
          })}
        />
        <p className={panel.standingText}>{review.text}</p>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" className={styles.full} onClick={onClose}>
          {t("economy:housingModal.done")}
        </Button>
      </div>
    </div>
  );
}
