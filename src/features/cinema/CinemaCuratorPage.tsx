import { Link, useParams } from "react-router-dom";
import { FiFilm } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, FadeIn, Outro } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { CURATORS } from "./cinemaCurator.data";
import { CuratorHero } from "./CuratorHero";
import { CuratorMain } from "./CuratorMain";
import { CuratorAside } from "./CuratorAside";
import { CinemaCuratorSkeleton } from "./CinemaCuratorSkeleton";
import styles from "./CinemaCuratorPage.module.css";

export function CinemaCuratorPage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const curator = CURATORS[slug];
  const loading = useSimulatedLoad();

  if (!curator) {
    return (
      <PageShell>
        <div className={styles.body}>
          <EmptyState
            icon={<FiFilm />}
            title={t("cinema:curator.notFound.title")}
            description={t("cinema:curator.notFound.description")}
            action={{ label: t("cinema:curator.notFound.backCta"), to: routes.cinema }}
          />
        </div>
      </PageShell>
    );
  }

  const name = `${curator.namePre}${curator.nameEm}`;

  return (
    <PageShell>
      <section className={styles.crumb}>
        <div className="wrap">
          <div className={styles.crumbRow}>
            <Link to={routes.cinema}>{t("cinema:brand.tag")}</Link>
            <span className={styles.sep}>›</span>
            <Link to={routes.cinemaAbout}>{t("cinema:curator.crumb.council")}</Link>
            <span className={styles.sep}>›</span>
            <span className={styles.cur}>{name}</span>
            <Link to={routes.cinemaAbout} className={styles.crumbBack}>
              {t("cinema:curator.crumb.backCta")}
            </Link>
          </div>
        </div>
      </section>

      <CuratorHero curator={curator} />

      {loading ? (
        <CinemaCuratorSkeleton />
      ) : (
        <section className={styles.body}>
          <div className={`wrap ${styles.bodyGrid}`}>
            <FadeIn>
              <CuratorMain curator={curator} />
            </FadeIn>
            <FadeIn delay={120}>
              <CuratorAside curator={curator} />
            </FadeIn>
          </div>
        </section>
      )}

      <Outro
        title={
          <Translation
            i18nKey="cinema:about.principles.p2.title"
            components={{ em: <em /> }}
          />
        }
        sub={curator.outroSub}
      >
        <Button size="lg" to={curator.leadCollectionTo}>
          {t("cinema:curator.outro.openCollectionCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
