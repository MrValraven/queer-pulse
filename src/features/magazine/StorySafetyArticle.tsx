import styles from "./StorySafetyPage.module.css";
import { StorySafetyMore } from "./StorySafetyMore";

export function StorySafetyArticle() {
  return (
    <div className={styles.articleWrap}>
      <div className={styles.articleMeta}>
        <span className={styles.tag}>On Building</span>
        <span className={styles.tag}>Safety</span>
        <span className={styles.tag}>Community</span>
        <span className={styles.dot} />
        <span>3 min read</span>
        <span className={styles.dot} />
        <span>April 2026</span>
      </div>

      <div className={styles.body}>
        <p className={styles.lead}>
          Every platform we've looked at that started with a strong community
          ethos eventually opened up, scaled past the point where anyone knew
          anyone, and became something that felt less like a room and more like
          a corridor. We decided early that we didn't want to do that. Here's
          why.
        </p>

        <h2>
          The growth trap and <em>why we're not in it</em>
        </h2>
        <p>
          Growth is the default assumption of anyone building software. More
          users, more value. More value, more funding. More funding, more users.
          The loop is self-reinforcing and, for most platforms, it's also the
          beginning of the end of what made them worth building in the first
          place.
        </p>
        <p>
          We're not anti-growth. We're pro-quality. Those two things are in
          tension in most contexts. We believe they don't have to be — but only
          if you're willing to say no to growth when it comes at the cost of
          what the space is for.
        </p>

        <blockquote className={styles.quote}>
          <p>
            A room that holds everyone holds no one in particular. We wanted to
            build something that holds specific people, carefully, on purpose.
          </p>
        </blockquote>

        <h2>
          The specific problem with <em>queer spaces online</em>
        </h2>
        <p>
          Queer people online face a particular set of risks that most platforms
          weren't designed with in mind. Outing. Harassment from organised
          bad-faith actors. The exhausting performance of being visible in
          environments that don't guarantee safety. The slow-motion experience
          of watching a space you trusted fill up with people who are there to
          observe or exploit rather than participate.
        </p>
        <p>
          Open sign-up, even with robust moderation, doesn't solve this.
          Moderation is reactive. By the time a harmful actor is moderated out,
          the damage — the chilling effect on members who saw what happened — is
          already done. The only effective preventative measure we've found is:
          someone who is already in the room has to say that this person belongs
          here, and put their name to it.
        </p>
        <p>
          That's vouching. It's not a perfect system. People vouch for people
          who turn out to be wrong for the community. But it means every harmful
          incident has a traceable origin, and it means people think before they
          invite. That second thing is underrated.
        </p>

        <div className={styles.statRow}>
          <div className={styles.stat}>
            <div className={styles.statN}>
              <em>0</em>
            </div>
            <div className={styles.statL}>
              open sign-up. Every member is introduced by another.
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statN}>24h</div>
            <div className={styles.statL}>
              response time for any safety concern sent to the team.
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statN}>
              <em>3</em>
            </div>
            <div className={styles.statL}>
              visibility settings. Private is always a real option, never a
              punishment.
            </div>
          </div>
        </div>

        <h2>
          What "safety as a feature" <em>actually means</em>
        </h2>
        <p>
          It means we build safety in at the structural level, not the policy
          level. Policies are things you write and hope people read. Structure
          is what shapes behaviour whether or not anyone reads anything.
        </p>
        <p>
          The invite-only structure means the person who introduced you is
          accountable, in a mild but real way, for your presence in the room.
          The visibility settings mean you can participate at the level you're
          comfortable with — not just "public or private" but a genuine
          spectrum. The absence of follower counts and public metrics means
          there's no incentive to perform rather than participate.
        </p>
        <p>
          None of this is unprecedented. Some of the best communities in the
          world operate this way. It just isn't the default in tech, because the
          default in tech is designed to maximise engagement, and engaged users
          generate data, and data generates revenue. We're not optimising for
          that.
        </p>

        <h2>
          The cost of staying <em>small</em>
        </h2>
        <p>
          There are real costs. People who should be in this room aren't yet,
          because they don't know anyone who's already here, or because they're
          in a situation where asking for an invitation feels exposing. We think
          about this a lot. We're trying to build ways in for people who arrive
          at the edge of the network without a prior connection — community
          events, open gatherings, a waitlist that we work through ourselves.
          We're not satisfied with where we are on this.
        </p>
        <p>
          The other cost is slower growth, and with it slower revenue. We're a
          small operation funded by membership and by the occasional partnership
          with organisations we trust. We're not going to scale our way out of
          needing to think carefully about these tradeoffs. That's okay. We'd
          rather be smaller and right than larger and compromised.
        </p>

        <blockquote className={styles.quote}>
          <p>
            The question we ask ourselves isn't "how do we grow?" It's "are the
            right people finding us, and when they do, is the room worth
            entering?"
          </p>
        </blockquote>

        <p>So far, we think it is. We'll keep asking.</p>

        <StorySafetyMore />
      </div>
    </div>
  );
}
