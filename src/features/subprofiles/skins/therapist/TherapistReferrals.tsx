import { Avatar } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  TherapistNote,
  TherapistSection,
  TherapistSubBlock,
} from "./TherapistSection";
import type { TherapistView } from "./therapistView";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import { initialsFor } from "./therapistView.helpers";
import styles from "./TherapistSections.module.css";
import sharedStyles from "./therapistShared.module.css";

/** Eyebrow keys for the "works alongside" kinds. A kind outside this map
 *  (free text on older data) shows no eyebrow. */
const ALONGSIDE_KIND_KEYS: Record<string, string> = {
  psychiatrist: "subprofiles:therapist.referrals.kind.psychiatrist",
  group: "subprofiles:therapist.referrals.kind.group",
  community: "subprofiles:therapist.referrals.kind.community",
  clinic: "subprofiles:therapist.referrals.kind.clinic",
  therapist: "subprofiles:therapist.referrals.kind.therapist",
};

/** "Who else is in the picture": the people the therapist recommends when
 *  full, then the people and services they work alongside. `null` when
 *  both lists are empty. */
export function TherapistReferrals({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const name = view.firstName;
  if (view.referrals.length === 0 && view.worksAlongside.length === 0) {
    return null;
  }

  return (
    <TherapistSection
      label={t("subprofiles:therapist.referrals.label")}
      heading={t("subprofiles:therapist.referrals.heading")}
      editTarget={THERAPIST_EDIT_TARGETS.referrals}
    >
      {view.referrals.length > 0 && (
        <>
          <p className={sharedStyles.label}>
            {t("subprofiles:therapist.referrals.recommendsLabel", { name })}
          </p>
          <ul className={styles.referralList}>
            {view.referrals.map((referral, referralIndex) => (
              <li
                key={`${referral.name}-${referralIndex}`}
                className={styles.referral}
              >
                <Avatar
                  initials={initialsFor(referral.name) || "?"}
                  tint="plum"
                  size={38}
                />
                <div>
                  <p className={styles.referralName}>{referral.name}</p>
                  {referral.note !== "" && (
                    <p className={styles.referralNote}>{referral.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <TherapistNote>
            {t("subprofiles:therapist.referrals.note", { name })}
          </TherapistNote>
        </>
      )}

      {view.worksAlongside.length > 0 && (
        <TherapistSubBlock
          label={t("subprofiles:therapist.referrals.alongsideLabel")}
          editTarget={THERAPIST_EDIT_TARGETS.worksAlongside}
        >
          <ul className={styles.alongside}>
            {view.worksAlongside.map((partner, partnerIndex) => {
              const kindKey = ALONGSIDE_KIND_KEYS[partner.kind.trim()];
              return (
                <li
                  key={`${partner.name}-${partnerIndex}`}
                  className={styles.alongsideItem}
                >
                  {kindKey && (
                    <span className={styles.alongsideKind}>{t(kindKey)}</span>
                  )}
                  <span className={styles.alongsideName}>{partner.name}</span>
                  {partner.note !== "" && (
                    <span className={styles.alongsideNote}>{partner.note}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </TherapistSubBlock>
      )}
    </TherapistSection>
  );
}
