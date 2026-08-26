import { Button, Outro } from "../../shared/components/ui";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import {
  SecurityPolicyAcknowledgmentsSection,
  SecurityPolicyCommitmentSection,
  SecurityPolicyHero,
  SecurityPolicyProcessSection,
  SecurityPolicyScopeSection,
  SecurityPolicySidebar,
} from "./SecurityPolicySections";
import styles from "./SecurityPolicyPage.module.css";

/**
 * The responsible-disclosure policy, addressed to security researchers.
 *
 * It used to sit at `/account/security`, where a member looking for their own
 * devices and sign-ins landed on a bug-bounty document instead. It is a public
 * legal-ish page like Privacy or Terms, so it now lives with them under
 * `/policies` and stays reachable without an account. The member-facing hub
 * took over the old path (`src/features/settings/AccountSecurityPage.tsx`).
 */
export function SecurityPolicyPage() {
  const { t } = useTranslation();
  const pageTitle = t("marketing:securityPolicy.meta.title");
  const pageDescription = t("marketing:securityPolicy.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.policiesSecurity },
        ])}
      />
      <SecurityPolicyHero />

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <SecurityPolicyCommitmentSection />
              <SecurityPolicyScopeSection />
              <SecurityPolicyProcessSection />
              <SecurityPolicyAcknowledgmentsSection />
            </div>

            <SecurityPolicySidebar />
          </div>
        </div>
      </div>

      <Outro
        title={
          <>
            {t("marketing:securityPolicy.outro.titleTop")}
            <br />
            <em>{t("marketing:securityPolicy.outro.titleEm")}</em>
          </>
        }
        sub={t("marketing:securityPolicy.outro.sub")}
      >
        <Button variant="primary" size="lg" href="mailto:hello@queerpulse.com">
          {t("marketing:securityPolicy.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
