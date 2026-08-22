import { FiEyeOff } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { usePublicProfile } from "../../app/providers/usePublicProfile";
import { usePublicProfileBySlug } from "./api/usePublicProfile";
import { PublicPreviewBar } from "./PublicProfileSections";
import { PublicProfileOwnPreviewDemo } from "./PublicProfileOwnPreviewDemo";
import { PublicProfilePublicView } from "./PublicProfilePublicView";
import styles from "./PublicProfilePage.module.css";

/**
 * The logged-in member's own public profile, as non-members see it. The owner
 * gets a preview banner with a live/off pill; signed-out visitors get the guest
 * sign-in bar.
 *
 * This is the slug-less `/public-profile` preview, and it is always about the
 * *viewer's own* profile. The real, addressable public profile that strangers
 * read is `PublicProfileBySlug`, at `/public-profile/:slug`.
 *
 * In live mode the body is fetched from that same endpoint, for the owner's own
 * slug, and rendered through the very same `PublicProfilePublicView` the public
 * page uses. That is the whole point: this page exists so a member can decide
 * whether to publish, and it used to answer that question with the full in-app
 * `Member` — showing a neighbourhood, join year, vouch count and social links
 * that `GET /public/profiles/:slug` never serves. Deciding on wrong information
 * is worse than not previewing at all. Demo mode keeps its richer storyboard
 * (`PublicProfileOwnPreviewDemo`), which is fiction by design.
 */
export function PublicProfileOwnPreview() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { enabled } = usePublicProfile();
  const isOwner = !!user;

  // Only fetched in live mode, and only for the signed-in member's own slug —
  // there is nowhere else this page could point.
  const ownSlug = !demoMode ? user?.profile.slug : undefined;
  const { profile: publicProfile, isLoading } = usePublicProfileBySlug(ownSlug);

  return (
    <PageShell>
      <PublicPreviewBar owner={isOwner} enabled={enabled} />

      <div className={styles.page}>
        {demoMode ? (
          <PublicProfileOwnPreviewDemo />
        ) : isLoading ? (
          <>
            <SkeletonLine height={30} width="40%" />
            <SkeletonLine height={16} style={{ marginTop: 14 }} />
            <SkeletonLine height={16} width="70%" style={{ marginTop: 8 }} />
          </>
        ) : publicProfile ? (
          <PublicProfilePublicView profile={publicProfile} />
        ) : (
          // The endpoint answers 404 for an unpublished profile, so "nothing
          // came back" is the ordinary state here, not an error. Say what
          // turning it on would publish rather than showing an empty page.
          <EmptyState
            icon={<FiEyeOff />}
            title={t("members:publicProfile.previewOff.title")}
            description={t("members:publicProfile.previewOff.description")}
            action={{
              label: t("members:publicProfile.previewOff.cta"),
              to: routes.accountProfile,
            }}
          />
        )}
      </div>
    </PageShell>
  );
}
