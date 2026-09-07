import type {
  PolicyDraft,
  PolicySectionId,
} from "./adminGovernancePolicyDraft";
import {
  PreviewCouncil,
  PreviewDecisions,
  PreviewHealth,
  PreviewPrinciples,
  PreviewSteps,
} from "./AdminGovernancePolicyPreviewSections";
import styles from "./AdminGovernancePolicy.module.css";

/**
 * The public Governance page, drawn from the draft at the width members read it
 * (900px; the frame around it scales the whole thing down to fit the column).
 *
 * `aria-hidden`, following the small stat preview it replaces: every word in
 * here is already in the editor beside it, and a screen reader should not have
 * to hear the page twice to get through the console.
 */
export function AdminGovernancePolicyPreviewPage({
  draft,
  activeSectionId,
}: {
  draft: PolicyDraft;
  activeSectionId: PolicySectionId;
}) {
  const sectionClass = (sectionId: PolicySectionId): string =>
    [styles.pageSection, sectionId === activeSectionId && styles.pageSectionOn]
      .filter(Boolean)
      .join(" ");

  return (
    <div className={styles.page} aria-hidden>
      <section className={sectionClass("health")}>
        <PreviewHealth rows={draft.health} />
      </section>
      <section className={sectionClass("moderationSteps")}>
        <PreviewSteps rows={draft.moderationSteps} />
      </section>
      <section className={sectionClass("council")}>
        <PreviewCouncil rows={draft.council} />
      </section>
      <section className={sectionClass("principles")}>
        <PreviewPrinciples rows={draft.principles} />
      </section>
      <section className={sectionClass("decisions")}>
        <PreviewDecisions rows={draft.decisions} />
      </section>
    </div>
  );
}
