import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { Button, Eyebrow, Reveal } from "../../shared/components/ui";
import { FiCheckCircle } from "react-icons/fi";
import { TAX_DISCLAIMER } from "./tax.constants";
import { GUIDE_SECTIONS, type GuideSection } from "./reciboVerdeGuide.data";
import styles from "./ReciboVerdeGuidePage.module.css";

/** A single reading block in the guide column. */
function GuideSectionBlock({ section }: { section: GuideSection }) {
  return (
    <Reveal as="section" className={styles.block}>
      <h2 id={section.id} className={styles.blockTitle}>
        {section.title}
      </h2>
      <div className={styles.blockBody}>{section.body}</div>
    </Reveal>
  );
}

export function ReciboVerdeGuidePage() {
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Reveal as="div">
            <Eyebrow>Freelance tools</Eyebrow>
          </Reveal>
          <Reveal as="h1" className={styles.heroTitle} delay={60}>
            The recibos verdes <em>guide.</em>
          </Reveal>
          <Reveal as="p" className={styles.heroLead} delay={120}>
            Going freelance in Portugal shouldn&apos;t mean drowning in jargon.
            Here&apos;s the whole recibos verdes system in plain, warm language
            — how to register, what you&apos;ll owe, and the handful of dates
            that actually matter. Take it one section at a time.
          </Reveal>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.column}>
          {GUIDE_SECTIONS.map((section) => (
            <GuideSectionBlock key={section.id} section={section} />
          ))}

          <Reveal as="section" className={styles.ctaRow}>
            <h2 className={styles.ctaTitle}>
              Ready to <em>send one?</em>
            </h2>
            <p className={styles.ctaText}>
              The invoice tool turns everything above into a finished
              fatura-recibo — right coefficients, right notes, right maths.
            </p>
            <div className={styles.ctaButtons}>
              <Button to={routes.invoiceTool} variant="primary">
                Make an invoice
              </Button>
              <Button to={routes.economy} variant="ghost">
                Back to Economy
              </Button>
            </div>
          </Reveal>

          <Reveal as="aside" className={styles.disclaimer}>
            <span className={styles.disclaimerIcon} aria-hidden>
              <FiCheckCircle />
            </span>
            <h2 className={styles.disclaimerTitle}>
              Not <em>tax advice.</em>
            </h2>
            <p className={styles.disclaimerText}>{TAX_DISCLAIMER}</p>
          </Reveal>
        </div>
      </div>
    </PageShell>
  );
}
