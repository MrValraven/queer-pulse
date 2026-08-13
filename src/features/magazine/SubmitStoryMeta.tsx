import type { ReactNode } from "react";
import { Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DraftForm } from "./submitStory.data";
import { ISSUE, SECTION_OPTIONS } from "./submitStory.data";
import styles from "./SubmitStoryPage.module.css";

export function SubmitStoryMeta({
  values,
  set,
  statusPill,
}: {
  values: DraftForm;
  set: (patch: Partial<DraftForm>) => void;
  statusPill: ReactNode;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.metaCard}>
      <div className={styles.metaHead}>
        <div className={styles.metaTitle}>
          <Translation
            i18nKey="magazine:submitStory.meta.heading"
            components={{ em: <em /> }}
          />
        </div>
        {statusPill}
      </div>

      <div className={styles.issueRow}>
        <span className={styles.issueBadge}>
          {t("magazine:submitStory.issue.badge", { number: ISSUE.number })}
        </span>
        <div>
          <div className={styles.issueName}>
            {t("magazine:submitStory.issue.name", {
              monthYear: fmt.date(ISSUE.openDate, {
                month: "long",
                year: "numeric",
              }),
            })}
          </div>
          <div className={styles.issueDeadline}>
            {t("magazine:submitStory.issue.deadline", {
              date: fmt.date(ISSUE.deadlineDate, {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            })}
          </div>
        </div>
      </div>

      <label className={styles.fieldLabel} htmlFor="ss-section">
        {t("magazine:submitStory.meta.sectionLabel")}
      </label>
      <Select
        id="ss-section"
        value={values.section || null}
        onChange={(value) => set({ section: value ?? "" })}
        placeholder={t("magazine:submitStory.meta.sectionPlaceholder")}
        options={SECTION_OPTIONS.map((option) => ({
          value: option.id,
          label: t(option.labelKey),
        }))}
      />

      <div className={styles.fieldRow}>
        <div>
          <label className={styles.fieldLabel} htmlFor="ss-byline">
            {t("magazine:submitStory.meta.bylineLabel")}
          </label>
          <input
            id="ss-byline"
            className={styles.textInput}
            type="text"
            value={values.byline}
            onChange={(e) => set({ byline: e.target.value })}
          />
        </div>
        <div>
          <label className={styles.fieldLabel} htmlFor="ss-byline-note">
            {t("magazine:submitStory.meta.bylineNoteLabel")}{" "}
            <span className={styles.optional}>
              {t("magazine:submitStory.meta.optional")}
            </span>
          </label>
          <input
            id="ss-byline-note"
            className={styles.textInput}
            type="text"
            placeholder={t("magazine:submitStory.meta.bylineNotePlaceholder")}
            value={values.bylineNote}
            onChange={(e) => set({ bylineNote: e.target.value })}
          />
        </div>
      </div>

      <label className={styles.fieldLabel} htmlFor="ss-tags">
        {t("magazine:submitStory.meta.tagsLabel")}{" "}
        <span className={styles.optional}>
          {t("magazine:submitStory.meta.commaSeparated")}
        </span>
      </label>
      <input
        id="ss-tags"
        className={styles.textInput}
        type="text"
        placeholder={t("magazine:submitStory.meta.tagsPlaceholder")}
        value={values.tags}
        onChange={(e) => set({ tags: e.target.value })}
      />
    </div>
  );
}
