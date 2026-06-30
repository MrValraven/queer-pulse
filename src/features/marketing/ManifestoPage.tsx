import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  ManifestoBody,
  ManifestoSigners,
  ManifestoActions,
} from "./ManifestoSections";
import styles from "./ManifestoPage.module.css";

export function ManifestoPage() {
  const { showToast } = useToast();
  const sign = () => showToast("Signed — welcome to the long list", "success");

  return (
    <PageShell>
      <div className={styles.page}>
        <section className={styles.open}>
          <div className={styles.openInner}>
            <div className={styles.eyebrow}>
              The QueerPulse Manifesto · 2024 · revised 2025
            </div>
            <h1 className={styles.title}>
              A quiet network for <em>people worth knowing.</em>
            </h1>
            <p className={styles.attrib}>
              Written because the platforms we were handed were never built for
              us — the feeds that profit from our attention, the professional
              network that never connected us to anyone. First drafted in{" "}
              <b>2024</b>, revised in <b>2025</b>, and revised again whenever
              the community decides it should be. We re-read it each Pride.
            </p>
          </div>
        </section>

        <ManifestoBody />
        <ManifestoSigners onSign={sign} />
        <ManifestoActions onSign={sign} />
      </div>
    </PageShell>
  );
}
