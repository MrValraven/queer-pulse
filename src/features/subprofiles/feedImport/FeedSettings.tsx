import { useId } from "react";
import { SegmentedControl, Toggle } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { translateFeedError } from "../api/feedImportErrors";
import type {
  SubprofileFeedDTO,
  UpdateFeedInput,
} from "../api/subprofileFeeds.api";
import type { SubprofileSection } from "../api/subprofiles.api";
import { useSubprofileFeedMutations } from "../api/useSubprofileFeedMutations";
import { SECTION_META } from "../subprofile-kinds";
import styles from "./FeedCard.module.css";

/** What a settings change said, for the card's live region. */
export interface FeedSettingsResult {
  tone: "ok" | "error";
  text: string;
}

/**
 * A connected feed's two settings: the section its episodes publish into and
 * whether new ones publish themselves. Each change saves on its own (there is
 * no Save button to forget) and reports back through `onResult`.
 */
export function FeedSettings({
  feed,
  sections,
  onResult,
}: {
  feed: SubprofileFeedDTO;
  sections: SubprofileSection[];
  onResult: (result: FeedSettingsResult) => void;
}) {
  const { t } = useTranslation();
  const { update } = useSubprofileFeedMutations();
  const autoPublishId = useId();

  function save(input: UpdateFeedInput) {
    update.mutate(
      { subprofileId: feed.subprofileId, feedId: feed.id, input },
      {
        onSuccess: () =>
          onResult({
            tone: "ok",
            text: t("subprofiles:feedImport.settings.saved"),
          }),
        onError: (error) =>
          onResult({
            tone: "error",
            text: translateFeedError(t, error, "update"),
          }),
      },
    );
  }

  return (
    <div className={styles.settings}>
      {sections.length > 1 && (
        <div className={styles.settingGroup}>
          <p className={styles.settingLabel}>
            {t("subprofiles:feedImport.settings.section")}
          </p>
          <SegmentedControl
            options={sections.map((section) => ({
              value: section,
              label: t(SECTION_META[section].labelKey),
            }))}
            value={feed.section}
            onChange={(value) => {
              const section = sections.find((candidate) => candidate === value);
              if (section && section !== feed.section) save({ section });
            }}
            label={t("subprofiles:feedImport.settings.section")}
            disabledOptions={update.isPending ? [...sections] : undefined}
          />
        </div>
      )}
      <div className={styles.settingRow}>
        <div className={styles.settingText}>
          <label htmlFor={autoPublishId}>
            {t("subprofiles:feedImport.options.autoPublish")}
          </label>
          <small>
            {feed.autoPublish
              ? t("subprofiles:feedImport.options.autoPublishOn")
              : t("subprofiles:feedImport.options.autoPublishOff")}
          </small>
        </div>
        <Toggle
          id={autoPublishId}
          checked={
            update.isPending
              ? (update.variables.input.autoPublish ?? feed.autoPublish)
              : feed.autoPublish
          }
          onChange={(autoPublish) => {
            if (!update.isPending) save({ autoPublish });
          }}
          label={t("subprofiles:feedImport.options.autoPublish")}
        />
      </div>
    </div>
  );
}
