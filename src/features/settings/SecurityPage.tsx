import { Button, Outro } from "../../shared/components/ui";
import { PageShell } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  SecurityAcknowledgmentsSection,
  SecurityCommitmentSection,
  SecurityHero,
  SecurityProcessSection,
  SecurityScopeSection,
  SecuritySidebar,
} from "./SecuritySections";
import styles from "./SecurityPage.module.css";

export function SecurityPage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <SecurityHero />

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <SecurityCommitmentSection />
              <SecurityScopeSection />
              <SecurityProcessSection />
              <SecurityAcknowledgmentsSection />
            </div>

            <SecuritySidebar />
          </div>
        </div>
      </div>

      <Outro
        title={
          <>
            {t("settings:security.outro.titleTop")}
            <br />
            <em>{t("settings:security.outro.titleEm")}</em>
          </>
        }
        sub={t("settings:security.outro.sub")}
      >
        <Button variant="primary" size="lg" href="mailto:hello@queerpulse.com">
          {t("settings:security.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
