import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { memberName } from "../members/data/members";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { StoryTomasArticle } from "./StoryTomasArticle";
import styles from "./StoryTomasPage.module.css";

export function StoryTomasPage() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroLabel}>
          <div className="wrap">
            {/* Content: category tag, headline, read time and date are this
                piece's own editorial fields — kept in English. */}
            <div className={styles.cat}>Profiles</div>
            <h1>
              Leaving the startup grind for a supper club <em>in Mouraria</em>
            </h1>
            <div className={styles.heroByline}>
              <span className={styles.bylineAv}>SA</span>
              <span>
                {t("magazine:story.wordsBy")}{" "}
                <Link to={routes.members}>{memberName("sofia")}</Link>
              </span>
              <span className={styles.bDot} />
              <span>4 min read</span>
              <span className={styles.bDot} />
              <span>May 2026</span>
            </div>
          </div>
        </div>
      </div>

      <StoryTomasArticle />

      <Outro
        title={
          <Translation
            i18nKey="magazine:story.outro.tomas.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("magazine:story.outro.tomas.sub")}
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          {t("common:cta.requestInvite")}
        </Button>
      </Outro>
    </PageShell>
  );
}
