import { Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MyCardDTO } from "./api/cards.api";
import styles from "./MyCardsPage.module.css";

/**
 * The member's veto over their own pronouns on one card they hold.
 *
 * Rendered only where the issuing community actually prints pronouns, so a
 * member of a community that does not is never asked a question that has no
 * effect. Phrased as "show", not "hide", for the same reason
 * `CardPhotoConsent` is: a control reading "Hide my pronouns" makes the safe
 * answer the one you have to switch ON, and this is a setting people reach for
 * when handing the card to a stranger is already the worrying part.
 *
 * A member who has no pronouns on their profile gets a line explaining that
 * instead of a toggle, because switching this on would otherwise appear to do
 * nothing. The card reads the profile rather than storing its own copy, so
 * that is where the pronouns have to be set.
 */
export function CardPronounConsent({
  card,
  hasProfilePronouns,
  isPending,
  onChange,
}: {
  card: MyCardDTO;
  /** Whether the holder has any pronouns set on their profile at all. */
  hasProfilePronouns: boolean;
  isPending: boolean;
  /** Receives the stored value: `true` means the pronouns are hidden. */
  onChange: (isPronounsHidden: boolean) => void;
}) {
  const { t } = useTranslation();
  const isShown = !card.isPronounsHidden;

  if (!hasProfilePronouns) {
    return (
      <p className={styles.photoConsentText}>
        {t("cards:pronouns.noneSet", { community: card.communityName })}
      </p>
    );
  }

  return (
    <div className={styles.photoConsent}>
      <span className={styles.photoConsentText} id={`card-pronouns-${card.id}`}>
        {t("cards:pronouns.consent", { community: card.communityName })}
      </span>
      <Toggle
        checked={isShown}
        onChange={(next) => {
          if (isPending) return;
          onChange(!next);
        }}
        label={t("cards:pronouns.consentAria", {
          community: card.communityName,
        })}
      />
    </div>
  );
}
