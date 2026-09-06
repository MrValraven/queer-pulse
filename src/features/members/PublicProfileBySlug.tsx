import { PageShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { usePublicProfileBySlug } from "./api/usePublicProfile";
import { ProfileMovedNote } from "./ProfileMovedNote";
import { PublicProfilePublicView } from "./PublicProfilePublicView";
import { useMovedHandleRedirect } from "./useMovedHandleRedirect";
import styles from "./PublicProfilePage.module.css";

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
  const { profile, isLoading, notFound, error } = usePublicProfileBySlug(slug);
  // PRD-204. This route is the one a member prints on a card, puts in a bio or
  // hands to somebody off the platform, so it is the address least likely to be
  // re-shared once it breaks, and the person who followed it has no account to
  // search from. The hook is the same one the member-facing profile uses: it
  // swaps the slug segment in place, so the shape of this path needs nothing
  // special from it, and it stays inert in demo mode, which has no handle
  // ledger to forward through.
  const isRedirectingToMovedSlug = useMovedHandleRedirect(slug, error);

  // Held ABOVE the not-found wall below, which would otherwise claim the moved
  // 404 as an absence and paint for a frame on the way through. The navigation
  // can only run from an effect, so this ordering is the fix, and reversing it
  // would silently undo the whole thing.
  if (isLoading || isRedirectingToMovedSlug) {
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

      {/* Says which username was followed and where it now leads. Shown here
          for the same reason it is shown to a member, and with more force: the
          visitor may have no account at all, they arrived from a card or a bio
          rather than from a link they could go back and check, and the
          forwarding expires with the 30-day reclaim cooldown, so the address
          they hold stops working later. Someone told what happened can ask for
          a current one. It renders only when this very navigation carried the
          forwarding state, so a first-hand visit and a reload show nothing. */}
      <ProfileMovedNote />

      <div className={styles.page}>
        <PublicProfilePublicView profile={profile} />
      </div>
    </PageShell>
  );
}
