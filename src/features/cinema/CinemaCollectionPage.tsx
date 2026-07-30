import { Link, useParams } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { CinemaComingSoon } from "./CinemaComingSoon";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CinemaShell } from "./CinemaShell";
import { CinemaCollectionHeader } from "./CinemaCollectionHeader";
import { CinemaCollectionEssay } from "./CinemaCollectionEssay";
import { CinemaCollectionFilms } from "./CinemaCollectionFilms";
import { CinemaCollectionAside } from "./CinemaCollectionAside";
import { collectionDetails } from "./cinemaCollection.data";
import styles from "./CinemaCollectionPage.module.css";
import { routes } from "../../app/routeMap";

export function CinemaCollectionPage() {
  const { demoMode } = useDemoMode();
  if (!demoMode) return <CinemaComingSoon />;
  return <DemoCinemaCollectionPage />;
}

function DemoCinemaCollectionPage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const data = collectionDetails[slug];

  if (!data) {
    return (
      <CinemaShell>
        <section className={styles.notFound}>
          <div className="wrap">
            <div className="eb">{t("cinema:collection.notFound.eyebrow")}</div>
            <h1>
              <Translation
                i18nKey="cinema:collection.notFound.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p>{t("cinema:collection.notFound.body")}</p>
            <Button to={routes.cinemaBrowse}>
              {t("cinema:collection.notFound.browseCta")}
            </Button>
          </div>
        </section>
      </CinemaShell>
    );
  }

  return (
    <CinemaShell>
      <CinemaCollectionHeader data={data} />
      <CinemaCollectionEssay data={data} />

      <section className={styles.bodySection}>
        <div className="wrap">
          <div className={styles.bodyInner}>
            <CinemaCollectionFilms data={data} />
            <CinemaCollectionAside data={data} />
          </div>
        </div>
      </section>

      <section className={styles.outro}>
        <div className="wrap">
          <div className={styles.outroInner}>
            <h2>
              <Translation
                i18nKey="cinema:collection.outro.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.outroSub}>
              {t("cinema:collection.outro.sub")}
            </p>
            <Button to={routes.cinemaMembership} size="lg">
              {t("cinema:outro.sustainCta")}
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.backRow}>
        <div className="wrap">
          <Link to={routes.cinema} className={styles.back}>
            {t("cinema:collection.backCta")}
          </Link>
        </div>
      </div>
    </CinemaShell>
  );
}
