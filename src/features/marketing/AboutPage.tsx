import { FiCheck, FiX } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { routes } from "../../app/routeMap";
import {
  CONTRAST_THEM,
  CONTRAST_US,
  PULL_QUOTE,
  VALUES,
  WHO_PARAGRAPHS,
  WHO_PULL,
  WHY_PARAGRAPHS,
} from "./about.data";
import m from "./marketing.module.css";
import s from "./AboutPage.module.css";

export function AboutPage() {
  return (
    <PageShell>
      <PageMeta
        title="About — QueerPulse"
        description="Built in Lisbon, owned by us. A private, community-owned network for queer Lisbon — built to connect you to people, work and care, then get out of your way."
      />
      <PageHero
        eyebrow="About QueerPulse"
        title={
          <>
            Built in Lisbon. <em>Owned by us.</em>
          </>
        }
        sub="A private, community-owned network for queer Lisbon. The big platforms are built to hold your attention and sell it. This one is built to connect you to people, work, and care — and then get out of your way."
      />

      <section className={m.section}>
        <div className="wrap">
          <Reveal as="div" className={m.sectionEyebrow}>
            Why this exists
          </Reveal>
          <div className={s.originGrid}>
            <div>
              <Reveal as="h2" className={m.sectionTitle} delay={60}>
                The platforms we had <em>weren't built for us.</em>
              </Reveal>
              <Reveal as="div" className={s.body} delay={120}>
                {WHY_PARAGRAPHS.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </Reveal>
            </div>
            <Reveal className={s.pull} delay={80}>
              {PULL_QUOTE}
            </Reveal>
          </div>
        </div>
      </section>

      <section className={m.section} style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal as="div" className={m.sectionEyebrow}>
            The difference
          </Reveal>
          <Reveal as="h2" className={m.sectionTitle} delay={60}>
            Two ways to build a <em>network.</em>
          </Reveal>
          <div className={s.contrastGrid}>
            <Reveal className={s.contrastCol} delay={80}>
              <div className={s.contrastLabel}>
                <FiX className={s.contrastIconThem} aria-hidden />
                The attention economy
              </div>
              <ul className={s.contrastList}>
                {CONTRAST_THEM.map((point) => (
                  <li key={point} className={s.contrastItem}>
                    <FiX className={s.contrastIconThem} aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className={s.contrastColOurs} delay={140}>
              <div className={s.contrastLabelOurs}>
                <FiCheck className={s.contrastIconUs} aria-hidden />A community
                economy
              </div>
              <ul className={s.contrastList}>
                {CONTRAST_US.map((point) => (
                  <li key={point} className={s.contrastItemOurs}>
                    <FiCheck className={s.contrastIconUs} aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={m.section} style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal as="div" className={m.sectionEyebrow}>
            What we believe
          </Reveal>
          <Reveal as="h2" className={m.sectionTitle} delay={60}>
            Not principles. <em>Commitments.</em>
          </Reveal>
          <div className={s.valuesGrid}>
            {VALUES.map((v, i) => (
              <Reveal
                key={v.title}
                className={s.valCard}
                delay={Math.min(i, 8) * 60}
              >
                <div className={s.valTitle}>{v.title}</div>
                <div className={s.valText}>{v.text}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={m.section} style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal as="div" className={m.sectionEyebrow}>
            Who's behind this
          </Reveal>
          <div className={s.originGrid}>
            <div>
              <Reveal as="h2" className={m.sectionTitle} delay={60}>
                No investors. <em>No exit.</em>
              </Reveal>
              <Reveal as="div" className={s.body} delay={120}>
                {WHO_PARAGRAPHS.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </Reveal>
            </div>
            <Reveal className={s.pull} delay={80}>
              {WHO_PULL}
            </Reveal>
          </div>

          <Reveal className={s.contactStrip} delay={60}>
            <div className={s.csText}>
              <h3>
                Questions? <em>We answer them.</em>
              </h3>
              <p>
                If something on this page raised a question, or you want to
                understand more about how the platform works, write to us. We
                read everything and reply to most things.
              </p>
            </div>
            <div className={s.csActions}>
              <Button to={routes.contact}>Get in touch</Button>
              <Button variant="ghost" to={routes.governance}>
                Governance &amp; transparency
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <Outro
        title={
          <>
            Build the alternative <em>with us.</em>
          </>
        }
        sub="Invite-only. Community-owned. No ads, no algorithm."
      >
        <Button size="lg" to={routes.requestInvite}>
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  );
}
