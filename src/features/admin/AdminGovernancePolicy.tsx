import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminGovernanceHealthEditor } from "./AdminGovernanceHealthEditor";
import { AdminGovernanceModerationEditor } from "./AdminGovernanceModerationEditor";
import { AdminGovernanceCouncilEditor } from "./AdminGovernanceCouncilEditor";
import { AdminGovernancePrinciplesEditor } from "./AdminGovernancePrinciplesEditor";
import { AdminGovernanceDecisionsEditor } from "./AdminGovernanceDecisionsEditor";
import { useAdminGovernanceOverview } from "./api/useAdminGovernanceOverview";
import styles from "./AdminGovernancePage.module.css";

/**
 * The admin Policy tab: five independent section editors (Health, Moderation
 * steps, Council, Principles, Decisions), each saving on its own via
 * `PATCH /governance/admin/overview`. Every editor edits a full-array
 * replacement of its section and is catalog-constrained — no free-text
 * wording, only reordering/hiding/correcting what already has EN+PT
 * translations (see the design doc's "structure in the DB, words in i18n"
 * decision).
 */
export function AdminGovernancePolicy() {
  const { overview, loading } = useAdminGovernanceOverview();

  if (loading || !overview) {
    return (
      <FadeIn>
        <div className={styles.govGrid}>
          <div className={styles.card}>
            <SkeletonLine height={16} width="70%" style={{ marginBottom: 10 }} />
            <SkeletonLine height={16} width="85%" style={{ marginBottom: 10 }} />
            <SkeletonLine height={16} width="60%" />
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className={styles.ovSection}>
        <AdminGovernanceHealthEditor
          rows={overview.health}
          meta={overview.meta.health}
        />
        <AdminGovernanceModerationEditor
          rows={overview.moderationSteps}
          meta={overview.meta.moderationSteps}
        />
        <AdminGovernanceCouncilEditor
          rows={overview.council}
          meta={overview.meta.council}
        />
        <AdminGovernancePrinciplesEditor
          rows={overview.principles}
          meta={overview.meta.principles}
        />
        <AdminGovernanceDecisionsEditor
          rows={overview.decisions}
          meta={overview.meta.decisions}
        />
      </div>
    </FadeIn>
  );
}
