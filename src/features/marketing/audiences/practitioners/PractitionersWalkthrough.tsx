import { FiSearch } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "../../../subprofiles/subprofile-kinds";
import { AudienceSection } from "../shared/AudienceSection";
import { AudienceStep, AudienceStepList } from "../shared/AudienceStep";
import { AUDIENCE_WALKTHROUGH_ID } from "../shared/audiences.data";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import {
  PRACTITIONER_KIND_ICONS,
  PRACTITIONER_TRY_KINDS,
} from "./practitionersLanding.data";
import {
  SampleAvailability,
  SamplePhotoSeries,
  SampleTherapistFirstSession,
} from "./PractitionerFragments";
import styles from "./PractitionersLanding.module.css";

/** Four practices, four page shapes: one tile per kind, each on a hint of
 *  its own skin. */
function PracticeShapes() {
  const { t } = useTranslation();
  return (
    <ul className={styles.shapes}>
      {PRACTITIONER_TRY_KINDS.map((kind) => {
        const Icon = PRACTITIONER_KIND_ICONS[kind];
        return (
          <li key={kind} className={styles.shape} data-kind={kind}>
            <Icon aria-hidden className={styles.shapeIcon} />
            <span className={styles.shapeKind}>{t(KIND_LABEL_KEYS[kind])}</span>
            <span className={styles.shapeLine}>
              {t(`forPractitioners:walkthrough.shape.${kind}`)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Where members find a practice: the two lists, named as plain text (both
 *  sit behind sign-in). */
function FoundByMembers() {
  const { t } = useTranslation();
  return (
    <div className={styles.found}>
      <p className={styles.foundSearch}>
        <FiSearch aria-hidden />
        <span>{t("forPractitioners:walkthrough.found.search")}</span>
      </p>
      <ul className={styles.foundKinds}>
        {PRACTITIONER_TRY_KINDS.map((kind) => (
          <li key={kind}>{t(KIND_LABEL_KEYS[kind])}</li>
        ))}
      </ul>
    </div>
  );
}

/** "How it works here": five steps, each beside the block that does it. */
export function PractitionersWalkthrough() {
  const { t } = useTranslation();
  return (
    <AudienceSection
      sectionId={AUDIENCE_WALKTHROUGH_ID}
      eyebrow={t("audiences:walkthrough.eyebrow")}
      title={t("forPractitioners:walkthrough.title")}
      lede={t("forPractitioners:walkthrough.lede")}
      tone="cream"
    >
      <AudienceStepList>
        <AudienceStep
          stepNumber={1}
          title={t("forPractitioners:walkthrough.shape.title")}
          body={<p>{t("forPractitioners:walkthrough.shape.body")}</p>}
          visual={<PracticeShapes />}
        />
        <AudienceStep
          stepNumber={2}
          title={t("forPractitioners:walkthrough.work.title")}
          body={<p>{t("forPractitioners:walkthrough.work.body")}</p>}
          visual={
            <ShowcaseFrame label={t("forPractitioners:walkthrough.work.frame")}>
              <SamplePhotoSeries />
            </ShowcaseFrame>
          }
          isReversed
        />
        <AudienceStep
          stepNumber={3}
          title={t("forPractitioners:walkthrough.how.title")}
          body={<p>{t("forPractitioners:walkthrough.how.body")}</p>}
          visual={
            <ShowcaseFrame
              label={t("forPractitioners:walkthrough.how.frame")}
              maxHeight="short"
            >
              <SampleTherapistFirstSession />
            </ShowcaseFrame>
          }
        />
        <AudienceStep
          stepNumber={4}
          title={t("forPractitioners:walkthrough.when.title")}
          body={<p>{t("forPractitioners:walkthrough.when.body")}</p>}
          visual={
            <ShowcaseFrame label={t("forPractitioners:walkthrough.when.frame")}>
              <SampleAvailability />
            </ShowcaseFrame>
          }
          isReversed
        />
        <AudienceStep
          stepNumber={5}
          title={t("forPractitioners:walkthrough.found.title")}
          body={<p>{t("forPractitioners:walkthrough.found.body")}</p>}
          visual={<FoundByMembers />}
        />
      </AudienceStepList>
    </AudienceSection>
  );
}
