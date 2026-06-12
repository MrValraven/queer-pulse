import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import {
  SECTIONS,
  AFTER,
  SOBER,
  SERVICES,
  NALOXONE_STEPS,
  type HrSection,
} from "./harmReduction.data";
import styles from "./HarmReductionPage.module.css";

function SectionCard({ section }: { section: HrSection }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <div className={styles.hrsLabel}>{section.label}</div>
        <div className={styles.hrsTitle}>{section.title}</div>
      </div>
      <div className={styles.sectionBody}>
        {section.alert && (
          <div className={styles.alert}>
            <div className={styles.alertHead}>{section.alert.head}</div>
            <div className={styles.alertBody}>{section.alert.body}</div>
          </div>
        )}
        {section.items.map((it) => (
          <div className={styles.item} key={it.title}>
            <div className={styles.itemTitle}>{it.title}</div>
            <div className={styles.itemBody}>{it.body}</div>
          </div>
        ))}
        {section.link && (
          <Button to={section.link.href} variant="ghost" className={styles.sectionBtn}>
            {section.link.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export function HarmReductionEmergencyStrip() {
  return (
    <div className={styles.emergencyStrip}>
      <div className={`wrap ${styles.esInner}`}>
        <div className={styles.esItem}>
          <span>Emergency:</span>
          <span className={styles.esNum}>112</span>
        </div>
        <div className={styles.esItem}>
          <span>SNS 24 (non-emergency):</span>
          <span className={styles.esNum}>808 24 24 24</span>
        </div>
        <div className={styles.esItem}>
          <span>Linha de Apoio (mental health):</span>
          <span className={styles.esNum}>800 202 296</span>
        </div>
      </div>
    </div>
  );
}

export function HarmReductionHero() {
  return (
    <header className={styles.hero}>
      <div className="wrap">
        <div className={styles.eye}>Harm Reduction · Community guide</div>
        <h1 className={styles.title}>
          No judgment.
          <br />
          <em>Just information.</em>
        </h1>
        <p className={styles.sub}>
          If you are going to use substances — at a club, at a party, at home —
          this guide is for you. Not to stop you. To help you stay safe.
        </p>
        <div className={styles.sos}>
          <span>
            <strong>If someone stops breathing:</strong> call 112 immediately.
            Portugal has a good samaritan law — you will not be prosecuted for
            calling for help.
          </span>
        </div>
      </div>
    </header>
  );
}

export function NaloxoneCard() {
  return (
    <div className={styles.naloxoneCard}>
      <div>
        <div className={styles.ncTitle}>
          Naloxone <em>saves lives.</em>
        </div>
        <p className={styles.ncBody}>
          Naloxone (Narcan) reverses an opioid overdose in minutes. It is
          available free of charge in Portugal through harm reduction
          services and some pharmacies. It is safe, easy to use, and
          non-prescription. Carry it if you or anyone around you uses
          opioids — including fentanyl, heroin, or strong prescription
          painkillers.
        </p>
        <p className={styles.ncBody}>
          In Lisbon: GAT Lisboa, APDES, and the Ares do Pinhal harm
          reduction team distribute naloxone free of charge. Ask at your
          nearest harm reduction service or contact GAT directly.
        </p>
      </div>
      <div className={styles.ncSteps}>
        <div className={styles.ncStepsLabel}>If someone overdoses</div>
        {NALOXONE_STEPS.map((s) => (
          <div className={styles.ncStep} key={s.n}>
            <div className={styles.ncN}>{s.n}</div>
            <div className={styles.ncStepBody}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HarmReductionGrid() {
  return (
    <main className={styles.body}>
      <div className="wrap">
        <div className={styles.grid}>
          <SectionCard section={SECTIONS[0]} />
          <SectionCard section={SECTIONS[1]} />
          <NaloxoneCard />
          <SectionCard section={AFTER} />
          <SectionCard section={SOBER} />
          <SectionCard section={SERVICES} />
        </div>
      </div>
    </main>
  );
}

export function HarmReductionOutro() {
  return (
    <Outro
      title={<>Take care of <em>each other.</em></>}
      sub="Harm reduction is a community practice. The more people who know this, the safer our nights are."
    >
      <Button to={routes.sexualHealth} variant="primary" size="lg">
        Sexual health resources
      </Button>
    </Outro>
  );
}
