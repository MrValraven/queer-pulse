import { Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MyCardDTO } from "./api/cards.api";
import styles from "./MyCardsPage.module.css";

/**
 * The member's veto over their own face on one card they hold.
 *
 * Rendered only where the issuing community actually runs photo cards, so a
 * member of a community that does not is never asked a question that has no
 * effect.
 *
 * Phrased as "show", not "hide", even though the stored column is
 * `isPhotoHidden`: a control reading "Hide my photo" makes the safe answer
 * the one you have to switch ON, and this is a setting people reach for when
 * something about being visible already worries them.
 */
export function CardPhotoConsent({
  card,
  isPending,
  onChange,
}: {
  card: MyCardDTO;
  isPending: boolean;
  /** Receives the stored value: `true` means the photo is hidden. */
  onChange: (isPhotoHidden: boolean) => void;
}) {
  const { t } = useTranslation();
  const isShown = !card.isPhotoHidden;

  return (
    <div className={styles.photoConsent}>
      <span className={styles.photoConsentText} id={`card-photo-${card.id}`}>
        {t("cards:photo.consent", { community: card.communityName })}
      </span>
      <Toggle
        checked={isShown}
        onChange={(next) => {
          if (isPending) return;
          onChange(!next);
        }}
        label={t("cards:photo.consentAria", { community: card.communityName })}
      />
    </div>
  );
}
