import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useAuth } from "../../app/providers/authContext";
import { usePublicProfile } from "../../app/providers/PublicProfileProvider";
import {
  PublicList,
  LockedSection,
  BottomCta,
  Stat,
  PublicPreviewBar,
  PublicProfileHead,
} from "./PublicProfileSections";
import { CURRENT_USER_PUBLIC } from "./currentUserPublic.data";
import styles from "./PublicProfilePage.module.css";

/**
 * The logged-in member's own public profile, as non-members see it. Composes the
 * live self profile (name, bio, avatar, vouches) with their public contribution
 * record (`CURRENT_USER_PUBLIC`). The owner gets a preview banner with a live/off
 * pill; signed-out visitors get the guest sign-in bar.
 */
export function PublicProfilePage() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const { enabled } = usePublicProfile();
  const pub = CURRENT_USER_PUBLIC;
  const owner = !!user;
  const { first } = profile;

  return (
    <PageShell>
      <PublicPreviewBar owner={owner} enabled={enabled} />

      <div className={styles.page}>
        <PublicProfileHead profile={profile} contributions={pub} />

        <div className={styles.stats}>
          {pub.stats.map((s, i) => (
            <FadeIn key={s.label} delay={Math.min(i, 8) * 60}>
              <Stat value={s.value} em={s.em} label={s.label} />
            </FadeIn>
          ))}
        </div>

        <FadeIn as="section" className={styles.sec} delay={120}>
          <div className={styles.secH}>
            <h2>
              What I'm <em>here for</em>
            </h2>
            <span className={styles.secMeta}>Visible publicly</span>
          </div>
          <div className={styles.tagRow}>
            {pub.hereFor.map((t) => (
              <span
                key={t.label}
                className={`${styles.tag} ${t.primary ? styles.primary : ""}`}
              >
                {t.label}
              </span>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={180}>
          <PublicList
            heading={
              <>
                Public <em>writing</em>
              </>
            }
            meta={`${pub.writing.length} pieces · QueerPulse Magazine`}
            cards={pub.writing}
            to={routes.article}
          />
        </FadeIn>

        <FadeIn delay={240}>
          <PublicList
            heading={
              <>
                Public <em>hosting</em>
              </>
            }
            meta="Open events anyone can RSVP to"
            cards={pub.hosting}
            to={routes.gathering}
          />
        </FadeIn>

        <FadeIn delay={300}>
          <LockedSection
            heading={
              <>
                Posts &amp; <em>messages</em>
              </>
            }
            meta="Members only"
            icon={
              <svg viewBox="0 0 24 24">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            }
            title={
              <>
                Posts, replies, and DMs are <em>members-only.</em>
              </>
            }
            body={`QueerPulse keeps day-to-day community life behind a sign-in to protect members. Become one and ${first}'s feed unlocks immediately — including the ability to message ${first}.`}
            action={
              <Button variant="primary" to={routes.requestInvite}>
                Request an invite →
              </Button>
            }
          />
        </FadeIn>

        <FadeIn delay={360}>
          <LockedSection
            heading="Connections"
            meta="Members only"
            icon={
              <svg viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            title={
              <>
                Who {first} knows, <em>privately.</em>
              </>
            }
            body={`To protect members' networks, we don't show connection lists publicly. Sign in to see your mutuals with ${first}.`}
            action={
              <Button variant="ghost" to={routes.signIn}>
                Sign in
              </Button>
            }
          />
        </FadeIn>

        <BottomCta firstName={first} />
      </div>
    </PageShell>
  );
}
