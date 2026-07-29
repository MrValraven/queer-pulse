import { FiFeather } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useProfile } from "../../app/providers/useProfile";
import { useAuth } from "../../app/providers/authContext";
import { usePublicProfile } from "../../app/providers/usePublicProfile";
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
 *
 * This is the slug-less `/public-profile` preview, and it is always about the
 * *viewer's own* profile — `useProfile()` cannot point anywhere else. The real,
 * addressable public profile that strangers read is `PublicProfileBySlug`, at
 * `/public-profile/:slug`. Keep the two apart: this one is a preview of an
 * intention, that one is what the open web actually gets served.
 */
export function PublicProfileOwnPreview() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
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

        {demoMode ? (
          <>
        <div className={styles.stats}>
          {pub.stats.map((s, i) => (
            <FadeIn key={s.labelKey} delay={Math.min(i, 8) * 60}>
              <Stat value={s.value} em={s.em} labelKey={s.labelKey} />
            </FadeIn>
          ))}
        </div>

        <FadeIn as="section" className={styles.sec} delay={120}>
          <div className={styles.secH}>
            <h2>
              <Translation
                i18nKey="members:publicProfile.hereForTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <span className={styles.secMeta}>
              {t("members:publicProfile.visiblePublicly")}
            </span>
          </div>
          <div className={styles.tagRow}>
            {pub.hereFor.map((item) => (
              <span
                key={item.label}
                className={`${styles.tag} ${item.primary ? styles.primary : ""}`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={180}>
          <PublicList
            heading={
              <Translation
                i18nKey="members:publicProfile.writing.heading"
                components={{ em: <em /> }}
              />
            }
            meta={t("members:publicProfile.writing.meta", {
              count: pub.writing.length,
            })}
            cards={pub.writing}
            to={routes.article}
          />
        </FadeIn>

        <FadeIn delay={240}>
          <PublicList
            heading={
              <Translation
                i18nKey="members:publicProfile.hosting.heading"
                components={{ em: <em /> }}
              />
            }
            meta={t("members:publicProfile.hosting.meta")}
            cards={pub.hosting}
            to={routes.gatherings}
          />
        </FadeIn>
          </>
        ) : (
          <EmptyState
            icon={<FiFeather />}
            title={t("members:publicProfile.emptyLive.title")}
            description={t("members:publicProfile.emptyLive.description")}
            action={{
              label: t("members:publicProfile.emptyLive.cta"),
              to: routes.gatherings,
            }}
          />
        )}

        <FadeIn delay={300}>
          <LockedSection
            heading={
              <Translation
                i18nKey="members:publicProfile.locked.postsHeading"
                components={{ em: <em /> }}
              />
            }
            meta={t("members:publicProfile.membersOnly")}
            icon={
              <svg viewBox="0 0 24 24">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            }
            title={
              <Translation
                i18nKey="members:publicProfile.locked.postsTitle"
                components={{ em: <em /> }}
              />
            }
            body={t("members:publicProfile.locked.postsBody", { first })}
            action={
              <Button variant="primary" to={routes.requestInvite}>
                {t("members:publicProfile.requestInviteArrow")}
              </Button>
            }
          />
        </FadeIn>

        <FadeIn delay={360}>
          <LockedSection
            heading={t("members:publicProfile.locked.connectionsHeading")}
            meta={t("members:publicProfile.membersOnly")}
            icon={
              <svg viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            title={
              <Translation
                i18nKey="members:publicProfile.locked.connectionsTitle"
                components={{ em: <em /> }}
                values={{ first }}
              />
            }
            body={t("members:publicProfile.locked.connectionsBody", { first })}
            action={
              <Button variant="ghost" to={routes.signIn}>
                {t("common:cta.signIn")}
              </Button>
            }
          />
        </FadeIn>

        <BottomCta firstName={first} />
      </div>
    </PageShell>
  );
}
