import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, LoadErrorState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPanel } from "./ui";
import { useAdminGovernanceProposalsList } from "./api/useAdminGovernanceProposals";
import { AdminGovernanceProposalForm } from "./AdminGovernanceProposalForm";
import { AdminGovernanceProposalRow } from "./AdminGovernanceProposalRow";
import styles from "./AdminGovernancePage.module.css";

export function AdminGovernanceProposals() {
  const { t } = useTranslation();
  const { proposals, loading, isError, refetch } =
    useAdminGovernanceProposalsList();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className={styles.tabBody}>
      <AdminPanel
        title={
          <Translation
            i18nKey="admin:governance.proposals.header.title"
            components={{ em: <em /> }}
          />
        }
        description={t("admin:governance.proposals.header.sub")}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <FiPlus aria-hidden /> {t("admin:governance.proposals.createCta")}
          </Button>
        }
        padding="flush"
      >
        {/* Checked before the empty line: a failed fetch used to say no
            proposal had ever been opened (DES-22). */}
        {loading ? (
          <p className={styles.govListNote}>…</p>
        ) : isError ? (
          <div className={styles.govListNote}>
            <LoadErrorState
              compact
              onRetry={refetch}
              title={t("admin:governance.proposals.loadError.title")}
              description={t("admin:governance.proposals.loadError.body")}
            />
          </div>
        ) : proposals.length === 0 ? (
          <p className={styles.govListNote}>
            {t("admin:governance.proposals.empty")}
          </p>
        ) : (
          proposals.map((proposal) => (
            <AdminGovernanceProposalRow key={proposal.id} proposal={proposal} />
          ))
        )}
      </AdminPanel>
      {showForm && (
        <AdminGovernanceProposalForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
