import { Navigate } from "react-router-dom";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { CinemaShell } from "./CinemaShell";
import {
  AboutStrip,
  AskStrip,
  CinemaCover,
  CinemaMast,
  CinemaOutro,
  CollectionsSection,
  LedgerSection,
  LiveSection,
  MadeHereSection,
  OpenCallsStrip,
  ProgrammeSection,
} from "./CinemaSections";
import styles from "./CinemaPage.module.css";

export function CinemaPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  // The "This week" hub is a fabricated featured-films page. In live mode there
  // is no real programme to show, so land people on the working catalogue
  // (`/cinema/browse` → live `CinemaLiveCatalog`) instead of mock rails.
  if (!demoMode) return <Navigate to={routes.cinemaBrowse} replace />;

  return (
    <CinemaShell>
      <PageMeta
        title={t("cinema:meta.title")}
        description={t("cinema:meta.description")}
      />
      <CinemaMast />
      <AskStrip />
      <CinemaCover />

      <section className={styles.body}>
        <div className="wrap">
          <ProgrammeSection />
          <CollectionsSection />
          <MadeHereSection />
          <LiveSection />
          <LedgerSection />
          <OpenCallsStrip />
          <AboutStrip />
        </div>
      </section>

      <CinemaOutro />
    </CinemaShell>
  );
}
