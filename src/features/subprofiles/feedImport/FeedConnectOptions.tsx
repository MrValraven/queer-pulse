import { useId } from "react";
import {
  RadioCardGroup,
  SegmentedControl,
  Toggle,
  type RadioCardOption,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { FeedBackfill } from "../api/subprofileFeeds.api";
import type { SubprofileSection } from "../api/subprofiles.api";
import { SECTION_META } from "../subprofile-kinds";
import styles from "./FeedConnect.module.css";

/** What the member picks before connecting. */
export interface FeedConnectChoices {
  section: SubprofileSection;
  backfill: FeedBackfill;
  autoPublish: boolean;
}

/**
 * The three choices that shape a connection: which section the episodes go
 * to, whether the existing episodes come in for review, and whether new ones
 * publish themselves. Auto-publish is off unless the member turns it on, and
 * the line under it says what each state means in plain words.
 */
export function FeedConnectOptions({
  sections,
  episodeCount,
  choices,
  onChange,
}: {
  sections: SubprofileSection[];
  episodeCount: number;
  choices: FeedConnectChoices;
  onChange: (next: FeedConnectChoices) => void;
}) {
  const { t } = useTranslation();
  const backfillGroupId = useId();
  const autoPublishId = useId();
  const sectionLabel = (section: SubprofileSection) =>
    t(SECTION_META[section].labelKey);

  const backfillOptions: RadioCardOption<FeedBackfill>[] = [
    {
      id: "all",
      render: (
        <>
          <b>
            {t("subprofiles:feedImport.options.backfillAll", {
              count: episodeCount,
            })}
          </b>
          <small>{t("subprofiles:feedImport.options.backfillAllBody")}</small>
        </>
      ),
    },
    {
      id: "none",
      render: (
        <>
          <b>{t("subprofiles:feedImport.options.backfillNone")}</b>
          <small>{t("subprofiles:feedImport.options.backfillNoneBody")}</small>
        </>
      ),
    },
  ];

  return (
    <div className={styles.options}>
      {sections.length > 1 ? (
        <div className={styles.optionGroup}>
          <p className={styles.optionLabel}>
            {t("subprofiles:feedImport.options.section")}
          </p>
          <SegmentedControl
            options={sections.map((section) => ({
              value: section,
              label: sectionLabel(section),
            }))}
            value={choices.section}
            onChange={(value) => {
              const section = sections.find((candidate) => candidate === value);
              if (section) onChange({ ...choices, section });
            }}
            label={t("subprofiles:feedImport.options.section")}
          />
        </div>
      ) : (
        <p className={styles.optionNote}>
          {t("subprofiles:feedImport.options.sectionOnly", {
            section: sectionLabel(choices.section),
          })}
        </p>
      )}

      <div className={styles.optionGroup}>
        <p id={backfillGroupId} className={styles.optionLabel}>
          {t("subprofiles:feedImport.options.backfill")}
        </p>
        <RadioCardGroup<FeedBackfill>
          value={choices.backfill}
          onChange={(backfill) => onChange({ ...choices, backfill })}
          options={backfillOptions}
          ariaLabel={t("subprofiles:feedImport.options.backfill")}
          ariaLabelledBy={backfillGroupId}
          className={styles.backfillGroup}
          optionClassName={styles.backfillOption}
          checkedClassName={styles.backfillOptionOn}
        />
      </div>

      <div className={styles.autoPublish}>
        <div className={styles.autoPublishText}>
          <label htmlFor={autoPublishId}>
            {t("subprofiles:feedImport.options.autoPublish")}
          </label>
          <small>
            {choices.autoPublish
              ? t("subprofiles:feedImport.options.autoPublishOn")
              : t("subprofiles:feedImport.options.autoPublishOff")}
          </small>
        </div>
        <Toggle
          id={autoPublishId}
          checked={choices.autoPublish}
          onChange={(autoPublish) => onChange({ ...choices, autoPublish })}
          label={t("subprofiles:feedImport.options.autoPublish")}
        />
      </div>
    </div>
  );
}
