import { useTranslation } from "../../shared/i18n/useTranslation";
import { tintForSlug } from "../../shared/api/refs";
import { initialsFromParts } from "../../shared/lib/initials";
import { directoryBlurb } from "../members/directoryBlurb";
import { MemberCardBody } from "../members/MemberCardBody";
import card from "../members/MemberDirectoryFilterPage.module.css";
import styles from "./OnboardingPage.module.css";

interface StepPhotoPreviewProps {
  firstName: string;
  lastName: string;
  fallbackInitials: string;
  slug?: string;
  photo?: string;
  pronouns: string;
  bio: string;
}

/**
 * A live preview of how this member's profile card will look to other
 * members, built from the same photo/name/pronouns/bio they're filling out on
 * this step. Renders the real `MemberCardBody` — the same primitive the
 * directory and Settings' own live-card preview use — so it can never drift
 * into a lookalike.
 */
export function StepPhotoPreview({
  firstName,
  lastName,
  fallbackInitials,
  slug,
  photo,
  pronouns,
  bio,
}: StepPhotoPreviewProps) {
  const { t } = useTranslation();
  const trimmedName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const initials =
    initialsFromParts(firstName.trim(), lastName.trim()) || fallbackInitials;
  const tint = slug ? tintForSlug(slug) : "plum";
  const blurb = directoryBlurb(undefined, bio);

  return (
    <div className={styles.previewWrap}>
      <span className={styles.previewCaption}>
        {t("auth:onboarding.stepPhoto.preview.caption")}
      </span>
      <div className={`${card.mCard} ${card.mCardMe} ${card.mCardStatic}`}>
        <MemberCardBody
          name={trimmedName}
          slug={slug}
          initials={initials}
          tint={tint}
          photo={photo}
          meta={pronouns}
          blurb={blurb}
          tags={[]}
          isMe
        />
      </div>
    </div>
  );
}
