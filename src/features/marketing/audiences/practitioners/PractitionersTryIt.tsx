import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "../../../subprofiles/subprofile-kinds";
import { AudienceSection } from "../shared/AudienceSection";
import type { TryItOption } from "../shared/audiences.data";
import { SamplePersonaPage } from "../shared/persona/SamplePersonaPage";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import { TryItSwitch } from "../shared/TryItSwitch";
import {
  PRACTITIONER_KIND_ICONS,
  PRACTITIONER_TRY_KINDS,
  type PractitionerTryKind,
} from "./practitionersLanding.data";
import { SampleTherapistPage } from "./SampleTherapistPage";
import { useSamplePractitioner } from "./useSamplePractitioner";
import styles from "./PractitionersLanding.module.css";

/** The persona page for the chosen practice, drawn once on this page. */
function PractitionerPage({ kind }: { kind: PractitionerTryKind }) {
  const dto = useSamplePractitioner(kind);
  return kind === "therapist" ? (
    <SampleTherapistPage dto={dto} />
  ) : (
    <SamplePersonaPage dto={dto} />
  );
}

/**
 * "Try it": the visitor picks a practice and the same kind of page changes
 * shape with its real blocks. The tablist sits outside the inert frame; the
 * choice also sets the kind "Create a persona" starts with.
 */
export function PractitionersTryIt({
  activeKind,
  onKindChange,
}: {
  activeKind: PractitionerTryKind;
  onKindChange: (kind: PractitionerTryKind) => void;
}) {
  const { t } = useTranslation();
  const options: TryItOption<PractitionerTryKind>[] =
    PRACTITIONER_TRY_KINDS.map((kind) => ({
      id: kind,
      label: t(KIND_LABEL_KEYS[kind]),
      Icon: PRACTITIONER_KIND_ICONS[kind],
    }));
  return (
    <AudienceSection
      sectionId="try-it"
      eyebrow={t("audiences:tryIt.eyebrow")}
      title={t("forPractitioners:tryIt.title")}
      lede={t("forPractitioners:tryIt.lede")}
      tone="wash"
    >
      <TryItSwitch<PractitionerTryKind>
        label={t("forPractitioners:tryIt.switchLabel")}
        options={options}
        activeId={activeKind}
        onChange={onKindChange}
      >
        <div className={styles.tryItPanel}>
          <p className={styles.tryItCaption}>
            {t(`forPractitioners:tryIt.caption.${activeKind}`)}
          </p>
          <ShowcaseFrame
            label={t("forPractitioners:tryIt.frameLabel", {
              kind: t(KIND_LABEL_KEYS[activeKind]),
            })}
            device="browser"
            maxHeight="tall"
          >
            <PractitionerPage kind={activeKind} />
          </ShowcaseFrame>
        </div>
      </TryItSwitch>
    </AudienceSection>
  );
}
