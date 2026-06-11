import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./CodeOfConductPage.module.css";
import { TOC } from "./codeOfConductPage.data";
import {
  CocPactSection,
  CocHarmSection,
  CocEnforceSection,
  CocReportCta,
  CocChangesSection,
} from "./CodeOfConductSections";

const REPORT = linkToPath("QueerPulse Report.html");
const EMERGENCY = linkToPath("QueerPulse Emergency.html");
const CHANGELOG = linkToPath("QueerPulse Changelog.html");

export function CodeOfConductPage() {
  const { showToast } = useToast();
  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Code of Conduct · binding · v2.1 · Jan 2026</div>
          <h1 className={styles.h1}>
            A short, <em>actually-followed</em> agreement.
          </h1>
          <p className={styles.dek}>
            Six things that are <b>not negotiable</b> on QueerPulse, and what happens if
            you break them. This isn't a list of every nice behaviour we'd like to see —
            that's the Community Guidelines. <em>This is the constitution.</em>
          </p>
        </div>
      </section>

      <div className={styles.distinction}>
        <div className={styles.distCol}>
          <h4>This page · Code of Conduct</h4>
          <p>
            <b>Binding.</b> Violating any of these results in a moderation action, up to
            permanent removal. Applies to all members in all spaces — DMs, gatherings,
            the magazine, off-platform conduct that affects members here.
          </p>
        </div>
        <div className={styles.distCol}>
          <h4>Sister page · Community Guidelines</h4>
          <p>
            <b>Aspirational.</b> How we'd like things to feel — tone, generosity, what to
            do when you disagree.
          </p>
        </div>
      </div>

      <nav className={styles.toc}>
        <div className={styles.tocInner}>
          {TOC.map((t) => (
            <a key={t.id} href={`#${t.id}`}>{t.label}</a>
          ))}
        </div>
      </nav>

      <article className={styles.body}>
        <CocPactSection />
        <CocHarmSection />
        <CocEnforceSection />
        <CocReportCta
          reportPath={REPORT}
          emergencyPath={EMERGENCY}
          onCrisisChat={() => showToast("Opening crisis chat…", "info")}
        />
        <CocChangesSection
          changelogPath={CHANGELOG}
          onDownload={() => showToast("Downloading code-of-conduct-v2.1.pdf", "success")}
        />
      </article>
    </PageShell>
  );
}
