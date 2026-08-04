import { FiBookOpen } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import { StorySafetyArticle } from "./StorySafetyArticle";
import styles from "./StorySafetyPage.module.css";

export function StorySafetyPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  // The article below is fabricated editorial content. Live mode has no
  // published story yet, so it shows the same honest "coming soon" the magazine
  // front uses — the demo mock stays the demo-mode branch.
  if (!demoMode) {
    return (
      <PageShell>
        <MagazineMasthead active="stories" />
        <div className="wrap">
          <EmptyState
            icon={<FiBookOpen />}
            title={t("magazine:sections.emptyLive.title")}
            description={t("magazine:sections.emptyLive.description")}
            action={{
              label: t("magazine:sections.submit.cta"),
              to: routes.submitStory,
            }}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          {/* Content: category tag, headline, read time and date are this
              piece's own editorial fields — kept in English. The byline names
              the platform team (not an individual writer), so it is chrome. */}
          <div className={styles.cat}>On Building</div>
          <h1>
            Why we stayed <em>invite-only:</em> safety as a feature, not a gate.
          </h1>
          <div className={styles.byline}>
            <span>{t("magazine:story.safety.byline")}</span>
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
