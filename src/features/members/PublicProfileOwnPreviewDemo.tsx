import { FiArrowRight } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { useProfileData } from "../../app/providers/useProfile";
import {
  PublicList,
  LockedSection,
  BottomCta,
  Stat,
  PublicProfileHead,
} from "./PublicProfileSections";
import { CURRENT_USER_PUBLIC } from "./currentUserPublic.data";
import styles from "./PublicProfilePage.module.css";

/**
 * DEMO-ONLY body of `/public-profile`: the seeded contribution record
 * (`CURRENT_USER_PUBLIC`) laid out over the demo persona's full `Member`, with
 * stats, "here for" tags, writing/hosting lists, the members-only locked
 * sections and the vouch CTA.
 *
 * This is the prototype's storyboard of what a public profile could grow into,
 * so it renders fields (neighbourhood, tenure, vouch count, socials) that the
 * real `GET /public/profiles/:slug` does not serve, and links to `/vouch`,
 * which only has content in demo. None of that may run in live mode: an owner
 * deciding whether to publish must see what strangers really get, which is
 * `PublicProfilePublicView`. Keeping the two bodies in separate files is what
 * keeps that split honest.
 */
export function PublicProfileOwnPreviewDemo() {
  const { t } = useTranslation();
  const { profile } = useProfileData();
  const contributions = CURRENT_USER_PUBLIC;
  const { first } = profile;

  return (
    <>
      <PublicProfileHead profile={profile} contributions={contributions} />

      <div className={styles.stats}>
        {contributions.stats.map((stat, statIndex) => (
          <FadeIn key={stat.labelKey} delay={Math.min(statIndex, 8) * 60}>
            <Stat value={stat.value} em={stat.em} labelKey={stat.labelKey} />
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
          {contributions.hereFor.map((item) => (
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
            count: contributions.writing.length,
          })}
          cards={contributions.writing}
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
          cards={contributions.hosting}
          to={routes.gatherings}
        />
      </FadeIn>

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
            <Button variant="primary" to={requestInvitePath("public_profile")}>
              {t("members:publicProfile.requestInviteArrow")}{" "}
              <FiArrowRight aria-hidden />
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
    </>
  );
}
