import { PageMeta } from "../../shared/seo";
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
  return (
    <CinemaShell>
      <PageMeta
        title="QueerPulse Cinema — a community-owned queer film co-op"
        description="Stream queer cinema, discover curated collections, and back films made here — QueerPulse Cinema, a community-owned film co-op in Lisbon."
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
