import { Button } from '../../shared/components/ui'
import { linkToPath } from '../../app/routeMap'
import { SIGNERS } from './manifesto.data'
import styles from './ManifestoPage.module.css'

function Sep() {
  return (
    <div className={styles.sep}>
      <span className={styles.sepDot} />
    </div>
  )
}

export function ManifestoBody() {
  return (
    <article className={styles.body}>
      <div className={styles.stanza}>
        <div className={styles.stanzaNum}>
          0<em>1</em>
        </div>
        <h2 className={styles.h2}>
          Slower is <em>kinder.</em>
        </h2>
        <p className={styles.p}>
          We are not racing to scale. We do not want more members; we want{' '}
          <em>the right ones</em>. We will grow at the pace at which the community can absorb new
          arrivals — vouched-for, welcomed, integrated. If that means we are smaller than we could
          be, we will be smaller than we could be.
        </p>
        <p className={styles.p}>
          There are no follower counts. There is no algorithm choosing what you see. There is no
          "for you" feed competing for your evening.{' '}
          <strong>
            Time spent here is meant to add up to time off the platform
          </strong>{' '}
          — at gatherings, in studios, at clinics, with friends.
        </p>
      </div>

      <Sep />

      <div className={styles.stanza}>
        <div className={styles.stanzaNum}>
          0<em>2</em>
        </div>
        <h2 className={styles.h2}>
          Vouched, not <em>verified.</em>
        </h2>
        <p className={styles.p}>
          Membership is by invitation, and every invitation is signed by a name. If you are here,
          someone you have actually met said you should be. If you stay, you'll eventually do the
          same for someone else. This is not exclusivity. It is <em>accountability</em>.
        </p>
        <p className={styles.p}>
          "Verified" is a corporate word. It assumes a centre that can decide who you are. We
          don't. The community decides — together, slowly, and with the receipts of in-person time.
        </p>
      </div>

      <p className={styles.pull}>
        We do not put rainbow logos on anything. <em>The work speaks.</em>
      </p>

      <div className={styles.stanza}>
        <div className={styles.stanzaNum}>
          0<em>3</em>
        </div>
        <h2 className={styles.h2}>
          Safety is <em>infrastructure.</em>
        </h2>
        <p className={styles.p}>
          A queer professional network without a hate-crime bridge to ILGA is a logo, not a
          network. So is one without therapists vetted by the community, a safe-spaces map that is
          actually maintained, and an open clinic night that meets every month at Café Beirão.{' '}
          <strong>If we cannot operationally protect each other, we are not a network.</strong>
        </p>
        <p className={styles.p}>
          Quick-exit lives in the nav. Crisis chat is one tap. Mercearia Rosa's back door opens to
          Penha de França. None of these are features. They are the floor.
        </p>
      </div>

      <Sep />

      <div className={styles.stanza}>
        <div className={styles.stanzaNum}>
          0<em>4</em>
        </div>
        <h2 className={styles.h2}>
          Money moves <em>sideways.</em>
        </h2>
        <p className={styles.p}>
          Sustainer members pay €96 a year. That pays for staff, infrastructure, and the things
          that have to keep running. Above that, every euro is allocated <em>sideways</em> — into a
          fund that disperses in €50–200 grants, decided by a rotating circle, distributed in 14
          days. <strong>96% of every euro goes to programs.</strong> Full breakdown, every year, in
          the governance report.
        </p>
        <p className={styles.p}>
          There is a solidarity rate. It is genuinely free. We do not ask why.
        </p>
      </div>

      <p className={styles.pull}>
        If you cannot pay, that is information about <em>the world</em>, not about you.
      </p>

      <div className={styles.stanza}>
        <div className={styles.stanzaNum}>
          0<em>5</em>
        </div>
        <h2 className={styles.h2}>
          Lisbon, on <em>purpose.</em>
        </h2>
        <p className={styles.p}>
          We are based in a place. Specifically: Anjos, Mouraria, Graça, Alfama, Bairro Alto,
          Marvila, and the bus routes that connect them. A queer network rooted in nowhere is a
          feed. A queer network rooted somewhere — in a city you can walk across in an hour, with
          venues and chapters and a Câmara Municipal — is a network.
        </p>
        <p className={styles.p}>
          We will expand to other cities only when there is a community there asking us to. Not
          before. <strong>Porto is next.</strong> Then Madrid. Then we stop and re-think.
        </p>
      </div>

      <Sep />

      <div className={styles.stanza}>
        <div className={styles.stanzaNum}>
          0<em>6</em>
        </div>
        <h2 className={styles.h2}>
          Disagreement is <em>included.</em>
        </h2>
        <p className={styles.p}>
          We have, twice, publicly disagreed with our oldest partner ILGA Portugal. We will do it
          again. Coalition is not consensus. We do not speak for every queer person, and no one
          speaks for us. The forum hosts arguments that we expect to remain unresolved. The
          Assembly votes on what cannot be left unresolved.
        </p>
        <p className={styles.p}>
          Moderation is not neutrality. We will remove cruelty. We will not remove inconvenience.
        </p>
      </div>

      <div className={styles.stanza}>
        <div className={styles.stanzaNum}>
          0<em>7</em>
        </div>
        <h2 className={styles.h2}>
          Hold all of <em>this loosely.</em>
        </h2>
        <p className={styles.p}>
          This document is wrong about something. We don't know what. The 2025 revision changed
          eleven sentences. The 2026 revision will change more. Manifestos that don't update are
          gravestones. <em>This one updates.</em>
        </p>
        <p className={styles.p}>
          If you are reading this and something feels off, write to{' '}
          <a href="mailto:manifesto@queerpulse.app">manifesto@queerpulse.app</a>. A real person
          reads every one. We discuss them at the assembly.
        </p>
      </div>
    </article>
  )
}

export function ManifestoSigners({ onSign }: { onSign: () => void }) {
  return (
    <section className={styles.sigs}>
      <div className={styles.sigsInner}>
        <h3>
          Signed by <em>1,847 members</em> · so far
        </h3>
        <p className={styles.sub}>
          Members sign by clicking once. There's no obligation — many haven't, and that's also
          fine. The first 8 below are the founding members.
        </p>
        <div className={styles.sigGrid}>
          {SIGNERS.map((s) => (
            <div className={styles.sigCard} key={s.name}>
              <div
                className={styles.sigAv}
                style={s.bg ? { background: s.bg, color: s.color } : undefined}
              >
                {s.initials}
              </div>
              <span className={styles.sigName}>{s.name}</span>
            </div>
          ))}
          <button
            type="button"
            className={`${styles.sigCard} ${styles.sigAdd}`}
            onClick={onSign}
          >
            + <span className={styles.sigName}>Add my name</span>
          </button>
        </div>
        <p className={styles.sigCount}>
          Plus <b>1,836 more</b> · last signed by <b>Filipa Lopes</b>, 14 minutes ago.
        </p>
      </div>
    </section>
  )
}

export function ManifestoActions({ onSign }: { onSign: () => void }) {
  return (
    <div className={styles.actions}>
      <div className={styles.actionsRow}>
        <Button type="button" variant="primary" onClick={onSign}>
          Add your name
        </Button>
        <Button type="button" variant="ghost" onClick={() => window.print()}>
          Print / save PDF
        </Button>
        <Button to={linkToPath('QueerPulse Governance.html')} variant="ghost">
          Read the governance report →
        </Button>
      </div>
    </div>
  )
}
