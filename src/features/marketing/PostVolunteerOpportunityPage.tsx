import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CreateOpportunityFlow } from "./CreateOpportunityFlow";
import { EditOpportunityFlow } from "./EditOpportunityFlow";
import styles from "./PostVolunteerOpportunityPage.module.css";

/**
 * The create/edit gate for a volunteering opportunity: no `:slug` → the
 * "Post an opportunity" create flow; `:slug` present → editing that
 * opportunity. Both flows render the exact same form (`PostVolunteerOpportunityForm`)
 * so the fields, layout, and validation stay centralized in one place.
 */
export function PostVolunteerOpportunityPage() {
  const { t } = useTranslation();
  const { slug } = useParams();

  return (
    <PageShell>
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eye}>
              {t(
                slug
                  ? "marketing:postOpportunity.edit.eyebrow"
                  : "marketing:postOpportunity.hero.eyebrow",
              )}
            </div>
            <h1 className={styles.title}>
              <Translation
                i18nKey={
                  slug
                    ? "marketing:postOpportunity.edit.title"
                    : "marketing:postOpportunity.hero.title"
                }
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.sub}>
              {t(
                slug
                  ? "marketing:postOpportunity.edit.sub"
                  : "marketing:postOpportunity.hero.sub",
              )}
            </p>
          </div>

          {slug ? <EditOpportunityFlow slug={slug} /> : <CreateOpportunityFlow />}
        </div>
      </section>
    </PageShell>
  );
}
