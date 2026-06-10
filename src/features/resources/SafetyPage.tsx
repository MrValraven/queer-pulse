import { PageShell } from '../../shared/components/layout'
import { Button, Reveal } from '../../shared/components/ui'
import styles from './SafetyPage.module.css'

export function SafetyPage() {
  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Safety &amp; privacy</div>
          <h1>
            Your visibility. <em>Your choice.</em>
          </h1>
          <p className={styles.intro}>
            QueerPulse is a space where being out — or not, or somewhere in between — is nobody's
            business but yours. Here's how we protect that.
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <Reveal as="section" className={styles.section}>
          <h2>
            How <em>visibility</em> works
          </h2>
          <p>
            Every member chooses their own visibility level. It's not a setting buried in a profile
            — it's a first-class part of how you exist in the network. Think of it as a dimmer, not
            a switch.
          </p>
          <div className={styles.visCards}>
            <div className={`${styles.visCard} ${styles.viOpen}`}>
              <div className={styles.visIcon}>
                <div className={styles.dot} />
              </div>
              <div>
                <h3>Open to connect</h3>
                <p>
                  Your profile is visible to all members. Anyone in the network can reach out
                  directly. You can change this at any time — there's no penalty for stepping back.
                </p>
              </div>
            </div>
            <div className={`${styles.visCard} ${styles.viNetwork}`}>
              <div className={styles.visIcon}>
                <div className={styles.dot} />
              </div>
              <div>
                <h3>Network only</h3>
                <p>
                  Your profile is visible to members, but direct contact requires a shared
                  connection. You're reachable, but with a layer of warmth built in.
                </p>
              </div>
            </div>
            <div className={`${styles.visCard} ${styles.viPrivate}`}>
              <div className={styles.visIcon}>
                <div className={styles.dot} />
              </div>
              <div>
                <h3>Private</h3>
                <p>
                  Your profile is visible only to the team and your voucher. You appear in the
                  network count but not in browsing. The right setting if you're newly out, in a
                  sensitive situation, or just not ready. No explanation required.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <hr className={styles.divider} />

        <Reveal as="section" className={styles.section}>
          <h2>
            The <em>vouching</em> model
          </h2>
          <p>
            Every member is vouched for by at least one person already in the network. This isn't
            gatekeeping — it's the mechanism that makes the room feel trustworthy. When someone
            vouches for you, they're saying: <b>I know this person, and I think they belong here.</b>
          </p>
          <p>
            Vouchers aren't responsible for the people they vouch for, but they are accountable in a
            real way. If a vouched member behaves harmfully, their voucher is part of the
            conversation about what happens next.
          </p>
          <div className={styles.callout}>
            <div className={styles.calloutHead}>On being newly out</div>
            <p>
              If you're not yet out in your professional life, you can be Private within QueerPulse
              while still benefiting from the community. We will never share your membership
              externally without explicit consent.
            </p>
          </div>
        </Reveal>

        <hr className={styles.divider} />

        <Reveal as="section" className={styles.section}>
          <h2>
            What we <em>don't do</em> with your data
          </h2>
          <p>
            We don't sell it. We don't train models on it. We don't share it with third parties. We
            don't run advertising. We're a small, member-supported network — your data is not the
            product.
          </p>
          <p>
            What we store: your name, email, profile content, and visibility setting. What we don't
            store: your location beyond the neighbourhood you choose to share, your browsing
            behaviour, or anything you tell us in private messages.
          </p>
          <p>
            You can request everything we hold about you, or ask us to delete your account, at any
            time. Send an email to <b>hello@queerpulse.pt</b>.
          </p>
        </Reveal>

        <hr className={styles.divider} />

        <Reveal as="section" className={styles.section}>
          <h2>
            If something <em>feels wrong</em>
          </h2>
          <p>
            We take safety concerns seriously, and we respond to them ourselves — not an automated
            system. If someone has made you feel unsafe, if a message crossed a line, if something
            doesn't sit right, tell us.
          </p>
          <p>
            We handle every report with discretion. You will not be identified to the person you're
            reporting unless you choose to be. We will follow up.
          </p>
          <div className={styles.reportBox}>
            <h3>Get in touch with the team</h3>
            <p>
              If you need to report a concern, reach out directly. We read everything sent to this
              address and aim to respond within 24 hours.
            </p>
            <Button href="mailto:safe@queerpulse.pt">safe@queerpulse.pt</Button>
          </div>
        </Reveal>

        <hr className={styles.divider} />

        <Reveal as="section" className={styles.section}>
          <h2>
            Leaving the <em>network</em>
          </h2>
          <p>
            You can leave at any time. When you do, your profile is removed from the directory
            immediately. Any messages you've sent remain with their recipients — we can't unsend
            them. Board posts are removed. Your data is deleted within 30 days unless you ask us to
            keep it for a specific reason.
          </p>
          <p>
            There is no dark pattern here. No "are you sure?" loop. No 30-day cooling-off period
            before deletion. You leave, you're gone, and we wish you well.
          </p>
        </Reveal>
      </div>
    </PageShell>
  )
}
