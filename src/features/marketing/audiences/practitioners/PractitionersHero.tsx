import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AudienceHeroCopy } from "../shared/AudienceHeroCopy";
import type { AudienceMemberAction } from "../shared/audiences.data";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import {
  SampleChairCard,
  SampleTherapistTopics,
} from "./PractitionerFragments";
import { SampleFlashSheet } from "./SampleFlashSheet";
import styles from "./PractitionersHero.module.css";

/**
 * The practitioners hero: the copy beside three single blocks from three
 * practices, laid like cards on a quiet desk. A tattoo artist's flash, a
 * therapist's topics and a stylist's chair band. On phones the therapist's
 * topics lead, the flash follows and the chair band rests.
 */
export function PractitionersHero({
  memberActions,
}: {
  memberActions: readonly AudienceMemberAction[];
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.hero}>
      <div className={styles.inner}>
        <AudienceHeroCopy
          audience="practitioners"
          eyebrow={t("forPractitioners:hero.eyebrow")}
          titleKey="forPractitioners:hero.title"
          lede={t("forPractitioners:hero.lede")}
          memberActions={memberActions}
          className={styles.copy}
        />
        <div className={styles.collage}>
          <ShowcaseFrame
            label={t("forPractitioners:hero.frame.flash")}
            className={styles.flash}
          >
            <SampleFlashSheet />
          </ShowcaseFrame>
          <ShowcaseFrame
            label={t("forPractitioners:hero.frame.topics")}
            maxHeight="short"
            className={styles.topics}
          >
            <SampleTherapistTopics />
          </ShowcaseFrame>
          <ShowcaseFrame
            label={t("forPractitioners:hero.frame.chair")}
            className={styles.chair}
          >
            <SampleChairCard />
          </ShowcaseFrame>
        </div>
      </div>
    </div>
  );
}
