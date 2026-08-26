import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPageHeader } from "./ui";
import { AdminGovernanceMotionRow } from "./AdminGovernanceMotionRow";
import { useAdminGovernanceMotions } from "../governance/api/useGovernanceProposals";
import styles from "./AdminGovernancePage.module.css";

/**
 * The screening queue: member motions that cleared their co-signature
 * threshold and are waiting on a reviewer before they can open for voting.
 * An empty queue is the healthy state, so it says so rather than looking
 * broken.
 */
export function AdminGovernanceMotionQueue() {
  const { t } = useTranslation();
  const { motions, loading, error, retry } = useAdminGovernanceMotions();

  return (
    <div>
      <AdminPageHeader
        eyebrow={t("admin:governance.motions.header.eyebrow")}
        title={
          <Translation
            i18nKey="admin:governance.motions.header.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("admin:governance.motions.header.sub")}
      />
      <div className={styles.proposalAdminList}>
        {error ? (
          <div role="alert">
            <p className={styles.cardSub}>
              {t("admin:governance.motions.error")}
            </p>
            <Button variant="ghost" size="sm" type="button" onClick={retry}>
              {t("admin:governance.motions.retry")}
            </Button>
          </div>
        ) : loading ? (
          <p className={styles.cardSub}>
            {t("admin:governance.motions.loading")}
          </p>
        ) : motions.length === 0 ? (
          <p className={styles.cardSub}>
            {t("admin:governance.motions.empty")}
          </p>
        ) : (
          motions.map((motion) => (
            <AdminGovernanceMotionRow key={motion.id} motion={motion} />
          ))
        )}
      </div>
    </div>
  );
}
