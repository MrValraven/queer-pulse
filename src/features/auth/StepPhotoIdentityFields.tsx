import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PRONOUNS } from "./onboardingPage.data";
import styles from "./OnboardingPage.module.css";

export const BIO_MAX_LENGTH = 160;

interface IdentityFieldsProps {
  firstName: string;
  onFirstNameChange: (value: string) => void;
  lastName: string;
  onLastNameChange: (value: string) => void;
  pronouns: string;
  onPronounsChange: (value: string) => void;
  bio: string;
  onBioChange: (value: string) => void;
}

/**
 * The name, pronouns and short-bio fields tacked onto `StepPhoto`. Name comes
 * prefilled from Google but is editable here, since not everyone wants members
 * to see their Google account name. Pronouns and bio are the one moment
 * onboarding asks a member to say a little about who they are — real signup
 * only collects what Google OAuth supplies (email, name, avatar). Pronouns and
 * bio are optional, mirroring the photo above them: `StepPhoto` only ever
 * writes what the member actually typed, so leaving either blank changes
 * nothing. Split into its own file to keep `StepPhoto` under the 200-line
 * component limit.
 */
export function IdentityFields({
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  pronouns,
  onPronounsChange,
  bio,
  onBioChange,
}: IdentityFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.identityFields}>
      <div className={styles.nameRow}>
        <FormField label={t("auth:onboarding.stepPhoto.firstName.label")}>
          <input
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => onFirstNameChange(event.target.value)}
          />
        </FormField>
        <FormField label={t("auth:onboarding.stepPhoto.lastName.label")}>
          <input
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => onLastNameChange(event.target.value)}
          />
        </FormField>
      </div>
      <p className={styles.nameHint}>
        {t("auth:onboarding.stepPhoto.name.helper")}
      </p>
      <FormField
        label={t("auth:onboarding.stepPhoto.pronouns.label")}
        helper={t("auth:onboarding.stepPhoto.pronouns.helper")}
      >
        <input
          type="text"
          autoComplete="off"
          value={pronouns}
          onChange={(event) => onPronounsChange(event.target.value)}
          placeholder={t("auth:onboarding.stepPhoto.pronouns.placeholder")}
        />
      </FormField>
      <div
        className={styles.pronounChips}
        role="group"
        aria-label={t("auth:onboarding.stepPhoto.pronouns.quickPickLabel")}
      >
        {PRONOUNS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={
              pronouns === preset
                ? `${styles.pronounChip} ${styles.pronounChipSelected}`
                : styles.pronounChip
            }
            aria-pressed={pronouns === preset}
            onClick={() => onPronounsChange(preset)}
          >
            {preset}
          </button>
        ))}
      </div>
      <FormField
        label={t("auth:onboarding.stepPhoto.bio.label")}
        helper={t("auth:onboarding.stepPhoto.bio.helper")}
        labelAside={`${bio.length}/${BIO_MAX_LENGTH}`}
      >
        <textarea
          maxLength={BIO_MAX_LENGTH}
          value={bio}
          onChange={(event) => onBioChange(event.target.value)}
          placeholder={t("auth:onboarding.stepPhoto.bio.placeholder")}
        />
      </FormField>
    </div>
  );
}
