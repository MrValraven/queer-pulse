import { PageShell } from "../../shared/components/layout";
import {
  Avatar,
  Button,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { usePublicProfileBySlug } from "./api/usePublicProfile";
import { PublicProfileLinks, PublicProfileWork } from "./PublicProfileParts";
import styles from "./PublicProfilePage.module.css";

/** Two initials from a display name, for the avatar fallback. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * A member's public profile, addressed by slug — the one member surface meant to
 * be readable, and indexable, without a session.
 *
 * Everything it renders comes from GET /public/profiles/:slug, which is the only
 * member endpoint that answers logged-out. There is deliberately no signed-in
 * branch: a member looking at this page sees exactly what a stranger sees, which
 * is the whole point of a public profile.
 */
export function PublicProfileBySlug({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { profile, isLoading, notFound } = usePublicProfileBySlug(slug);

  if (isLoading) {
    return (
      <PageShell>
        <div className={styles.page}>
          <SkeletonLine height={30} width="40%" />
          <SkeletonLine height={16} style={{ marginTop: 14 }} />
          <SkeletonLine height={16} width="70%" style={{ marginTop: 8 }} />
        </div>
      </PageShell>
    );
  }

  // Not published, deactivated, or never existed — all one state, deliberately.
  // The copy must never imply that someone is here but hidden: that would turn
  // this page into a way to confirm a person is on QueerPulse, which is exactly
  // what the endpoint's ambiguous 404 exists to prevent. It reads like any dead
  // link, because to a visitor that is all it is.
  if (notFound || !profile) {
    return (
      <PageShell>
        <PageMeta
          title={t("members:publicBySlug.notFound.metaTitle")}
          noIndex
        />
        <div className={styles.page}>
          <EmptyState
            title={t("members:publicBySlug.notFound.title")}
            description={t("members:publicBySlug.notFound.description")}
            action={{
              label: t("members:publicBySlug.notFound.backCta"),
              to: routes.homepage,
            }}
          />
        </div>
      </PageShell>
    );
  }

  const description = profile.tagline ?? profile.bio ?? undefined;

  return (
    <PageShell>
      <PageMeta
        title={t("members:publicBySlug.meta.title", {
          name: profile.displayName,
        })}
        description={description}
        canonical={`${routes.publicProfile}/${profile.slug}`}
        image={profile.avatarUrl ?? undefined}
        type="profile"
      />

      <div className={styles.page}>
        <header className={styles.publicHead}>
          <Avatar
            initials={initialsOf(profile.displayName)}
            src={profile.avatarUrl ?? undefined}
            alt=""
            size={92}
          />
          <div>
            <div className={styles.eyebrow}>
              {t("members:publicProfile.head.eyebrow", { slug: profile.slug })}
            </div>
            <h1 className={styles.name}>{profile.displayName}</h1>
            {profile.pronouns && (
              <div className={styles.pronouns}>
                <span className={styles.pron}>{profile.pronouns}</span>
              </div>
            )}
            <div className={styles.badgeRow}>
              <MemberStaffBadge slug={profile.slug} size="lg" />
            </div>
            {profile.tagline && (
              <p className={styles.publicTagline}>{profile.tagline}</p>
            )}
          </div>
        </header>

        {profile.bio && (
          <FadeIn as="section" className={styles.sec} delay={80}>
            <div className={styles.secH}>
              <h2>{t("members:publicBySlug.aboutHeading")}</h2>
            </div>
            <p className={styles.bio}>{profile.bio}</p>
          </FadeIn>
        )}

        <PublicProfileLinks links={profile.links} />
        <PublicProfileWork work={profile.work} />

        <div className={styles.bottomCta}>
          <div>
            <h3>{t("members:publicBySlug.joinTitle")}</h3>
            <p>{t("members:publicBySlug.joinBody")}</p>
          </div>
          <div className={styles.bottomCtaActions}>
            <Button variant="primary" to={routes.requestInvite}>
              {t("common:cta.requestInvite")}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
