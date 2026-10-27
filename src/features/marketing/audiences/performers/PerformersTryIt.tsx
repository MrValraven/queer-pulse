import { useMemo } from "react";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { publicSubprofileToView } from "../../../subprofiles/api/subprofiles.adapters";
import { KIND_LABEL_KEYS } from "../../../subprofiles/subprofile-kinds";
import { AudienceSection } from "../shared/AudienceSection";
import type { TryItOption } from "../shared/audiences.data";
import { SamplePersonaPage } from "../shared/persona/SamplePersonaPage";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import { TryItSwitch } from "../shared/TryItSwitch";
import { TRY_KIND_ICONS } from "./performersLanding.data";
import {
  buildSamplePerformer,
  PERFORMER_TRY_KINDS,
  type PerformerTryKind,
} from "./performersSample.data";
import styles from "./PerformersTryIt.module.css";

/** Beside the phone: the sections this craft's page carries, and what stays
 *  the same whichever craft is picked. */
function CraftNotes({ sectionLabelKeys }: { sectionLabelKeys: string[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.notes}>
      <h3 className={styles.notesTitle}>
        {t("forPerformers:tryIt.sectionsTitle")}
      </h3>
      <ul className={styles.sectionChips}>
        {sectionLabelKeys.map((labelKey) => (
          <li key={labelKey} className={styles.sectionChip}>
            {t(labelKey)}
          </li>
        ))}
      </ul>
      <h3 className={styles.notesTitle}>
        {t("forPerformers:tryIt.staysTitle")}
      </h3>
      <p className={styles.notesBody}>
        <FiCheck aria-hidden className={styles.check} />
        {t("forPerformers:tryIt.staysBody")}
      </p>
    </div>
  );
}

/**
 * "Try it": the visitor switches the craft and the same sample persona page
 * redraws with that craft's sections, kind label and booking rider. The
 * choice lives on the page, so the member's "Create a persona" action
 * follows it. The persona page renders here and nowhere else on the page.
 */
export function PerformersTryIt({
  activeKind,
  onKindChange,
  today,
}: {
  activeKind: PerformerTryKind;
  onKindChange: (kind: PerformerTryKind) => void;
  today: Date;
}) {
  const { t } = useTranslation();
  const options: TryItOption<PerformerTryKind>[] = PERFORMER_TRY_KINDS.map(
    (kind) => ({
      id: kind,
      label: t(KIND_LABEL_KEYS[kind]),
      Icon: TRY_KIND_ICONS[kind],
    }),
  );
  const sampleDto = useMemo(
    () => buildSamplePerformer(t, activeKind, today),
    [t, activeKind, today],
  );
  const sectionLabelKeys = useMemo(
    () =>
      publicSubprofileToView(sampleDto).sections.map(
        (section) => section.labelKey,
      ),
    [sampleDto],
  );
  const kindLabel = t(KIND_LABEL_KEYS[activeKind]);

  return (
    <AudienceSection
      sectionId="try-it"
      eyebrow={t("audiences:tryIt.eyebrow")}
      title={t("forPerformers:tryIt.title")}
      lede={t("forPerformers:tryIt.lede")}
      tone="paper"
      className={styles.section}
    >
      <TryItSwitch
        label={t("forPerformers:tryIt.switchLabel")}
        options={options}
        activeId={activeKind}
        onChange={onKindChange}
      >
        <div className={styles.layout}>
          {/* The whole page, at the phone's true width: clipped to a phone
              screen, the Stage hero alone fills it and none of the sections
              that change with the craft would show. */}
          <ShowcaseFrame
            label={t("forPerformers:tryIt.frameLabel", { kind: kindLabel })}
            device="phone"
            className={styles.phone}
          >
            <SamplePersonaPage dto={sampleDto} />
          </ShowcaseFrame>
          <CraftNotes sectionLabelKeys={sectionLabelKeys} />
        </div>
      </TryItSwitch>
    </AudienceSection>
  );
}
