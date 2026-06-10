import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { linkToPath } from "../../app/routeMap";
import styles from "./HarmReductionPage.module.css";
import { Button } from '../../shared/components/ui'

interface Item {
  title: string;
  body: string;
}
interface Section {
  label: string;
  title: string;
  alert?: { head: string; body: string };
  items: Item[];
  link?: { label: string; href: string };
}

const SECTIONS: Section[] = [
  {
    label: "Before the night",
    title: "Know before you go",
    items: [
      { title: "Eat beforehand", body: "Alcohol and MDMA both hit harder on an empty stomach. Eat a proper meal 2–3 hours before, not immediately before." },
      { title: "Test your substances", body: "Drug checking services operate in Lisbon — KOSMICARE at festivals, and the DICAD-supported service. Reagent test kits are legal in Portugal and available online. Never assume a pill is what you were told." },
      { title: "Know your medications", body: "SSRIs, MAOIs, antiretrovirals, and many other medications interact dangerously with MDMA, stimulants, and some psychedelics. Check interactions at TripSit or DrugsData before you go." },
      { title: "Tell someone where you are", body: "Share your location with a trusted person who is not going out. Agree on a check-in time. This is not paranoia — it is standard care for yourself." },
      { title: "Budget your doses", body: "Decide what you are taking before you go. It is much harder to make good decisions at 3am in a loud room. Write it down if it helps." },
    ],
  },
  {
    label: "At the party",
    title: "During the night",
    alert: { head: "Water: not too little, not too much", body: "MDMA can cause both dehydration and hyponatraemia (too much water). If dancing heavily: ~500ml per hour. If not dancing: ~250ml per hour. Sports drinks help with salt." },
    items: [
      { title: "Start low, wait longer than you think", body: "MDMA takes 45–90 minutes to peak. Cocaine's effect is shorter. Many hospitalisations happen because someone redosed before the first dose peaked. Wait at least 90 minutes." },
      { title: "Take breaks from dancing", body: "Overheating is a genuine risk. Go outside, sit down, cool off regularly. If you feel very hot and stop sweating, get help immediately." },
      { title: "Mixing substances", body: "Alcohol + MDMA: harder on your body, increases dehydration. MDMA + cocaine: significant cardiac stress. MDMA + ketamine: unpredictable. Never mix with opioids unless you have naloxone present." },
      { title: "Look after each other", body: "If your friend seems confused, overly hot, or unresponsive to your voice — get them out of the crowd, give water, and if no improvement in 5 minutes, call 112." },
    ],
  },
];

const AFTER: Section = {
  label: "The next day",
  title: "Recovery",
  items: [
    { title: "MDMA comedown is real", body: "MDMA temporarily depletes serotonin. Days 2–4 after use can involve low mood, anxiety, and fatigue. This is neurological, not a reflection of your life. It passes. Eating, sleeping, and light activity help." },
    { title: "Sleep and food first", body: "Before anything else. Your body has worked hard. The urge to redose to chase the good feeling almost always makes the comedown worse." },
    { title: "If you feel worried about your use", body: "CAT (Centro de Atendimento a Toxicodependentes) offers free, confidential support — no judgment, no obligation. You do not have to be dependent to ask for support. Call 800 20 40 60." },
    { title: "Chemsex and follow-up testing", body: "If you have had sex while using substances, consider an STI test within 72 hours if you want PEP (HIV post-exposure prophylaxis). Checkpoint and GAT both offer rapid testing. No appointment needed." },
  ],
};

const SOBER: Section = {
  label: "Not using",
  title: "Sober at the party",
  items: [
    { title: "You belong there", body: "Queer nightlife can feel substance-centric. You are allowed to be there without drinking or using — and you do not owe anyone an explanation." },
    { title: "Non-alcoholic options", body: "Most Lisbon venues serve water and soft drinks. Ask for sparkling water with lime if you do not want it to look like you are not drinking — it is no one else's business." },
    { title: "QueerPulse Sober community", body: "The Sober page connects community members who are sober or sober-curious. You are not alone in wanting to be part of the night without the substances." },
  ],
  link: { label: "Visit the Sober page →", href: linkToPath("QueerPulse Sober.html") },
};

const SERVICES: Section = {
  label: "Support & services",
  title: "Where to go",
  items: [
    { title: "GAT Lisboa", body: "Free HIV/STI testing, naloxone, condoms, harm reduction support. Rua de São Lázaro 58 · gat.org.pt" },
    { title: "Checkpoint Lisboa", body: "Rapid HIV and STI testing, PrEP support, walk-ins welcome. Rua do Crucifixo 100 · checkpointlx.com" },
    { title: "CAT (drug support)", body: "Free and confidential support for anyone concerned about their substance use. 800 20 40 60 · no appointment needed." },
    { title: "KOSMICARE", body: "Psychedelic crisis support and integration. Active at Boom Festival and available for consultations year-round. kosmicare.org" },
    { title: "TripSit & DrugsData", body: "Drug interaction checker, dosage guides, and substance information. tripsit.me · drugsdata.org" },
  ],
};

const NALOXONE_STEPS: { n: number; body: React.ReactNode }[] = [
  { n: 1, body: <><strong>Call 112</strong> — say "a person is unresponsive and not breathing normally"</> },
  { n: 2, body: <><strong>Administer naloxone</strong> — nasal spray: one spray in one nostril. Injection: follow kit instructions.</> },
  { n: 3, body: <><strong>Recovery position</strong> — roll onto their side, tilt head back to open airway</> },
  { n: 4, body: <><strong>If no response in 2–3 minutes</strong> — give a second dose if you have one. Continue until help arrives.</> },
  { n: 5, body: <><strong>Stay with them</strong> — naloxone wears off before many opioids do. They need monitoring.</> },
];

function SectionCard({ section }: { section: Section }) {
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

export function HarmReductionPage() {
  return (
    <PageShell>
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

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            <SectionCard section={SECTIONS[0]} />
            <SectionCard section={SECTIONS[1]} />

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

            <SectionCard section={AFTER} />
            <SectionCard section={SOBER} />
            <SectionCard section={SERVICES} />
          </div>
        </div>
      </main>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Take care of <em>each other.</em>
          </h2>
          <p className={styles.outroSub}>
            Harm reduction is a community practice. The more people who know this,
            the safer our nights are.
          </p>
          <Button to={linkToPath("QueerPulse Sexual Health.html")} variant="primary" size="lg">
            Sexual health resources
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
