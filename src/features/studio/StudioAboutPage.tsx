import { FadeIn, Button } from "../../shared/components/ui";
import { StudioShell } from "./StudioShell";
import { routes } from "../../app/routeMap";
import { HERO, CTA } from "./studioAbout.data";
import { AboutSection, RateBand, Tiers, Skeptics } from "./StudioAboutSections";
import s from "./StudioAboutPage.module.css";

export function StudioAboutPage() {
  return (
    <StudioShell>
      <div className={s.wrap}>
        <FadeIn className={s.hero} as="header">
          <div className={s.eb}>{HERO.eyebrow}</div>
          <h1>{HERO.title}</h1>
          <p className={s.lede}>{HERO.lede}</p>
        </FadeIn>

        <AboutSection
          num="01 — what it is"
          delay={60}
          heading={
            <>
              A listening platform, run as a <em>co-op</em>.
            </>
          }
        >
          <p>
            QueerPulse Studio is owned by the people who use it — listeners and
            artists together — not by shareholders or a label.{" "}
            <strong>
              Eighty cents of every euro a listen generates goes to the artist.
            </strong>{" "}
            Every cent of every tip. The split is public, the catalogue is
            curated by an elected council of six, and the masters never leave
            the artist&apos;s hands.
          </p>
          <p>
            It is the third room of the QueerPulse co-op, after the Magazine and
            Cinema. One membership covers all of it. You can be a member for the
            writing and never open Studio; you can be here only for the music
            and never read a word.
          </p>
          <div className={s.pull}>
            We are not trying to be a smaller Spotify. We&apos;re trying to be a{" "}
            <em>different kind of room</em>.
          </div>
        </AboutSection>

        <AboutSection
          num="02 — the rate"
          delay={80}
          heading={
            <>
              &euro;0.05 a play. A <em>floor</em>, not a marketing number.
            </>
          }
        >
          <p>
            We commit to <strong>&euro;0.05 per qualifying play</strong> —
            roughly fifteen times what Spotify pays. A qualifying play is at
            least 30 seconds, capped at one payout per listener per day so
            nobody can farm it. The floor can rise by simple majority at the
            assembly; it can only <em>fall</em> with a two-thirds supermajority.
            In practice, that means it doesn&apos;t fall.
          </p>
          <RateBand />
          <p className={s.muted}>
            For comparison: at &euro;0.003 a stream, a song needs about 330,000
            plays to earn what one here earns in 20,000. We are not pretending
            that&apos;s a small difference.
          </p>
        </AboutSection>

        <AboutSection
          num="03 — what an artist can actually earn"
          delay={80}
          heading={
            <>
              Honest about the <em>ceiling</em>.
            </>
          }
        >
          <p>
            Most &ldquo;creator economy&rdquo; pages show you the top 0.1% and
            let you assume you&apos;re them. Here&apos;s what the rate actually
            produces at four real levels of listening — and where it stops.
          </p>
          <Tiers />
        </AboutSection>

        <AboutSection
          num="04 — who decides"
          delay={80}
          heading={
            <>
              An elected <em>council</em>, term-limited, on the record.
            </>
          }
        >
          <p>
            Six curators program the weekly set, run submission triage, and
            write a paragraph justifying every pick. They&apos;re elected by the
            whole co-op at the annual assembly, paid a flat &euro;400/mo stipend
            that appears on the public ledger, and limited to two-year terms
            with mandatory rotation.{" "}
            <strong>No algorithm decides who gets heard.</strong> A person does,
            and signs their name to it.
          </p>
          <p>
            The per-listen floor and the split percentages are set yearly by a
            joint vote of sustainers and artists, with a 20% quorum. If you
            think the rate is wrong, you don&apos;t email support —{" "}
            <em>you vote, or you stand.</em>
          </p>
        </AboutSection>

        <AboutSection
          num="05 — the hard questions"
          delay={80}
          heading={
            <>
              The ones you&apos;re <em>actually</em> asking.
            </>
          }
        >
          <Skeptics />
        </AboutSection>

        <FadeIn className={s.cta} delay={80}>
          <h2>{CTA.title}</h2>
          <p>{CTA.body}</p>
          <div className={s.acts}>
            <Button variant="primary" size="lg" to={routes.signIn}>
              {CTA.join}
            </Button>
            <Button variant="ghost-dark" size="lg" to={routes.governance}>
              {CTA.ledger}
            </Button>
          </div>
        </FadeIn>
      </div>
    </StudioShell>
  );
}
