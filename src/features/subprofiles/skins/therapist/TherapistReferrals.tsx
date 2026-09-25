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
import {
  RevealBlock,
  RevealList,
  RevealListItem,
  RevealPop,
} from "./TherapistReveal";
import { useStableRowKeys } from "./useStableRowKeys";
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

/** The reading column's flex gap (TherapistBody.module.css `.main`). */
const COLUMN_GAP = 16;

/** "Who else is in the picture": the people the therapist recommends when
 *  full, then the people and services they work alongside. Each part grows
 *  in and folds away with its list, and the whole section with the pair. */
export function TherapistReferrals({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const name = view.firstName;
  const hasReferrals = view.referrals.length > 0;
  const hasAlongside = view.worksAlongside.length > 0;
  const referralKeys = useStableRowKeys(
    view.referrals.map((referral) => referral.name),
  );
  const partnerKeys = useStableRowKeys(
    view.worksAlongside.map((partner) => partner.name),
  );

  return (
    <RevealBlock isShown={hasReferrals || hasAlongside} parentGap={COLUMN_GAP}>
      <TherapistSection
        label={t("subprofiles:therapist.referrals.label")}
        heading={t("subprofiles:therapist.referrals.heading")}
        editTarget={THERAPIST_EDIT_TARGETS.referrals}
      >
        <RevealBlock isShown={hasReferrals}>
          <p className={sharedStyles.label}>
            {t("subprofiles:therapist.referrals.recommendsLabel", { name })}
          </p>
          <ul className={styles.referralList}>
            <RevealList>
              {view.referrals.map((referral, referralIndex) => (
                <RevealListItem
                  key={referralKeys[referralIndex]}
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
                </RevealListItem>
              ))}
            </RevealList>
          </ul>
          <TherapistNote>
            {t("subprofiles:therapist.referrals.note", { name })}
          </TherapistNote>
        </RevealBlock>

        <RevealBlock isShown={hasAlongside}>
          <TherapistSubBlock
            label={t("subprofiles:therapist.referrals.alongsideLabel")}
            editTarget={THERAPIST_EDIT_TARGETS.worksAlongside}
          >
            <ul className={styles.alongside}>
              <RevealList>
                {view.worksAlongside.map((partner, partnerIndex) => {
                  const kindKey = ALONGSIDE_KIND_KEYS[partner.kind.trim()];
                  return (
                    // A grid cell cannot glide, so a tile pops in and out.
                    <RevealPop
                      key={partnerKeys[partnerIndex]}
                      as="li"
                      className={styles.alongsideItem}
                    >
                      {kindKey && (
                        <span className={styles.alongsideKind}>
                          {t(kindKey)}
                        </span>
                      )}
                      <span className={styles.alongsideName}>
                        {partner.name}
                      </span>
                      {partner.note !== "" && (
                        <span className={styles.alongsideNote}>
                          {partner.note}
                        </span>
                      )}
                    </RevealPop>
                  );
                })}
              </RevealList>
            </ul>
          </TherapistSubBlock>
        </RevealBlock>
      </TherapistSection>
    </RevealBlock>
  );
}
