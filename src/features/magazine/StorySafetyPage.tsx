import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { StorySafetyArticle } from "./StorySafetyArticle";
import styles from "./StorySafetyPage.module.css";

export function StorySafetyPage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          {/* Content: category tag, headline, byline, read time and date are
              this piece's own editorial fields — kept in English. */}
          <div className={styles.cat}>On Building</div>
          <h1>
            Why we stayed <em>invite-only:</em> safety as a feature, not a gate.
          </h1>
          <div className={styles.byline}>
            <span>The QueerPulse team</span>
            <span className={styles.sep} />
            <span>3 min read</span>
            <span className={styles.sep} />
            <span>April 2026</span>
          </div>
        </div>
      </div>

      <StorySafetyArticle />

      <Outro
        title={
          <Translation
            i18nKey="magazine:story.outro.safety.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("magazine:story.outro.safety.sub")}
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          {t("common:cta.requestInvite")}
        </Button>
      </Outro>
    </PageShell>
  );
}
