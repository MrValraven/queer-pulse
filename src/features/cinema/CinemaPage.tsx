import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
