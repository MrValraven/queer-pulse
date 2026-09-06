import type { ReactNode } from "react";
import { Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { useOpenIssue } from "./api/useSubmissionWindow";
import type { DraftForm } from "./submitStory.data";
import { SECTION_OPTIONS } from "./submitStory.data";
import styles from "./SubmitStoryPage.module.css";

/**
 * The "Issue N · Month Year · Submission deadline D" strip above the form
 * (PRD-106).
 *
 * Every line here is backed by a real issue row. `publishedOn` is null while
 * the desk has opened a number without dating it, and `submissionDeadline` is
 * null until an editor sets one, and each null DROPS ITS LINE rather than
 * falling back to a constant. While the read is in flight, or if it fails,
 * the strip renders nothing at all and the form works exactly as it does with
 * it: naming an issue is the one thing this component must not guess at.
 */
function OpenIssueStrip() {
  const { t, language } = useTranslation();
  const { openIssue, isLoading, isError } = useOpenIssue();

  if (isLoading || isError) return null;

  if (openIssue === null) {
    return (
      <div className={styles.issueRow}>
        <div className={styles.issueName}>
          {t("magazine:submitStory.issue.noneOpen")}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.issueRow}>
      <span className={styles.issueBadge}>
        {t("magazine:submitStory.issue.badge", { number: openIssue.number })}
      </span>
      <div>
        <div className={styles.issueName}>
          {openIssue.publishedOn
            ? t("magazine:submitStory.issue.name", {
                monthYear: formatDate(openIssue.publishedOn, language, {
                  month: "long",
                  year: "numeric",
                }),
              })
            : t("magazine:submitStory.issue.nameUndated")}
        </div>
        {openIssue.submissionDeadline ? (
          <div className={styles.issueDeadline}>
            {t("magazine:submitStory.issue.deadline", {
              date: formatDate(openIssue.submissionDeadline, language),
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

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

      <OpenIssueStrip />

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
