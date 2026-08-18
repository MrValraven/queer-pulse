import { FiUsers } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileFeaturedCommunities } from "./useProfileFeaturedCommunities";
import { ProfileCommunityCard } from "./ProfileCommunityCard";
import { Section } from "./ProfileSections";
import type { Member } from "./data/members";
import styles from "./ProfileCommunitiesSection.module.css";

/**
 * The profile "Communities" block. Shows the owner's featured communities on
 * self + public profiles. Public + none → renders nothing. Self + none → a
 * gentle prompt linking to the editor. Private-tier communities never reach
 * here (filtered upstream in `useProfileFeaturedCommunities`, and never
 * emitted by the public DTO in live mode).
 *
 * `isSelf` here is the RAW "is this the owner's page" flag (not gated by
 * preview) so that `useProfileFeaturedCommunities` always resolves from the
 * owner's live draft — including while previewing. `previewing` then only
 * changes how that resolved list is *presented*: owner previewing gets the
 * public subtitle and, when empty, renders nothing (like a real visitor)
 * instead of the self "feature your communities" prompt.
 */
export function ProfileCommunitiesSection({
  isSelf,
  previewing = false,
  otherMember,
  firstName,
}: {
  isSelf: boolean;
  previewing?: boolean;
  otherMember: Member | null;
  firstName: string;
}) {
  const { t } = useTranslation();
  const isOwnerEditingView = isSelf && !previewing;
  const featuredCommunities = useProfileFeaturedCommunities({
    isSelf,
    otherMember,
  });

  if (featuredCommunities.length === 0) {
    if (!isOwnerEditingView) return null;
    return (
      <div className="wrap">
        <Section title={t("members:profile.communities.title")}>
          <EmptyState
            compact
            icon={<FiUsers />}
            title={t("members:profile.communities.empty.title")}
            description={t("members:profile.communities.empty.description")}
            action={{
              label: t("members:profile.communities.empty.cta"),
              to: `${routes.editProfile}#communities`,
            }}
          />
        </Section>
      </div>
    );
  }

  const subtitle = isOwnerEditingView
    ? t("members:profile.communities.subtitleSelf")
    : t("members:profile.communities.subtitlePublic", { first: firstName });

  return (
    <div className="wrap">
      <Section
        id="communities"
        title={t("members:profile.communities.title")}
        subtitle={subtitle}
      >
        <div className={styles.grid}>
          {featuredCommunities.map((featuredCommunity) => (
            <ProfileCommunityCard
              key={featuredCommunity.slug}
              community={featuredCommunity}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
