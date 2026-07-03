import type { ReactNode } from "react";
import type { DraftForm } from "./submitStory.data";
import { ISSUE, SECTIONS } from "./submitStory.data";
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
  return (
    <div className={styles.metaCard}>
      <div className={styles.metaHead}>
        <div className={styles.metaTitle}>
          Story <em>details</em>
        </div>
        {statusPill}
      </div>

      <div className={styles.issueRow}>
        <span className={styles.issueBadge}>{ISSUE.badge}</span>
        <div>
          <div className={styles.issueName}>{ISSUE.name}</div>
          <div className={styles.issueDeadline}>{ISSUE.deadline}</div>
        </div>
      </div>

      <label className={styles.fieldLabel} htmlFor="ss-section">
        Section
      </label>
      <select
        id="ss-section"
        className={styles.select}
        value={values.section}
        onChange={(e) => set({ section: e.target.value })}
      >
        <option value="">Choose a section…</option>
        {SECTIONS.map((section) => (
          <option key={section} value={section}>
            {section}
          </option>
        ))}
      </select>

      <div className={styles.fieldRow}>
        <div>
          <label className={styles.fieldLabel} htmlFor="ss-byline">
            Byline
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
            Byline note <span className={styles.optional}>optional</span>
          </label>
          <input
            id="ss-byline-note"
            className={styles.textInput}
            type="text"
            placeholder="e.g. writes about housing"
            value={values.bylineNote}
            onChange={(e) => set({ bylineNote: e.target.value })}
          />
        </div>
      </div>

      <label className={styles.fieldLabel} htmlFor="ss-tags">
        Tags <span className={styles.optional}>comma separated</span>
      </label>
      <input
        id="ss-tags"
        className={styles.textInput}
        type="text"
        placeholder="e.g. housing, identity, Lisbon"
        value={values.tags}
        onChange={(e) => set({ tags: e.target.value })}
      />
    </div>
  );
}
