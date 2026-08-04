import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { CinemaComingSoon } from "./CinemaComingSoon";
import { FiArrowLeft, FiArrowRight, FiFilm } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { FILMMAKERS } from "./cinemaFilmmaker.data";
import { FilmmakerHero } from "./FilmmakerHero";
import { FilmmakerMain } from "./FilmmakerMain";
import { FilmmakerAside } from "./FilmmakerAside";
import styles from "./CinemaFilmmakerPage.module.css";

export function CinemaFilmmakerPage() {
  const { demoMode } = useDemoMode();
  if (!demoMode) return <CinemaComingSoon />;
  return <DemoCinemaFilmmakerPage />;
}

function DemoCinemaFilmmakerPage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const filmmaker = FILMMAKERS[slug];
  const tipRef = useRef<HTMLDivElement>(null);

  if (!filmmaker) {
    return (
      <PageShell>
        <div className={styles.body}>
          <EmptyState
            icon={<FiFilm />}
            title={t("cinema:filmmaker.notFound.title")}
            description={t("cinema:filmmaker.notFound.description")}
            action={{
              label: t("cinema:curator.notFound.backCta"),
              to: routes.cinema,
            }}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className={styles.crumb}>
        <div className="wrap">
          <div className={styles.crumbRow}>
            <Link to={routes.cinema}>{t("cinema:brand.tag")}</Link>
            <span className={styles.sep}>›</span>
            <span className={styles.cur}>
              {filmmaker.namePre}
              {filmmaker.nameEm}
            </span>
            <Link to={routes.cinema} className={styles.crumbBack}>
              <FiArrowLeft aria-hidden />{" "}
              {t("cinema:filmmaker.crumb.backCta")}
            </Link>
          </div>
        </div>
      </section>

      <FilmmakerHero
        filmmaker={filmmaker}
        onTip={() =>
          tipRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          })
        }
      />

      <section className={styles.body}>
        <div className={`wrap ${styles.bodyGrid}`}>
          <FilmmakerMain filmmaker={filmmaker} />
          <FilmmakerAside filmmaker={filmmaker} tipRef={tipRef} />
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="cinema:filmmaker.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("cinema:filmmaker.outro.sub")}
      >
        <Button size="lg" to={routes.studioUpload}>
          {t("cinema:ledger.submitCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </Outro>
    </PageShell>
  );
}
