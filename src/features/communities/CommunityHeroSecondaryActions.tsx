import { FiBookmark, FiShare2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath } from "../../app/routeMap";
import type { Person } from "./communityDetails";
import { CommunityHeroAvatars } from "./CommunityHeroAvatars";
import { CommunityNotificationControl } from "./CommunityNotificationControl";
import { CommunityReportControl } from "../safety/CommunityReportControl";
import { ShareToChatAction } from "../messages/share/ShareToChatAction";

/**
 * The hero's trailing icon-action row: edit (owner/mod only), save, share,
 * share-to-chat, the member avatar stack, and the notification + report
 * controls. Split out of `CommunityDetailHero` purely to keep that component
 * under the repo's 200-line limit; it carries no state of its own.
 */
export function CommunityHeroSecondaryActions({
  canEdit,
  onEdit,
  saved,
  onToggleSave,
  onShare,
  communityName,
  communitySlug,
  joined,
  heroAvatars,
  memberNum,
  hasCount,
}: {
  canEdit: boolean;
  onEdit: () => void;
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  communityName: string;
  communitySlug: string | undefined;
  joined: boolean;
  heroAvatars: Person[];
  memberNum: number;
  hasCount: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      {canEdit && (
        <Button variant="ghost-dark" onClick={onEdit}>
          {t("communities:edit.cta")}
        </Button>
      )}
      <Button
        variant="ghost-dark"
        onClick={onToggleSave}
        aria-pressed={saved}
        aria-label={t(
          saved
            ? "communities:detail.save.unsaveAriaLabel"
            : "communities:detail.save.saveAriaLabel",
          { name: communityName },
        )}
      >
        <FiBookmark aria-hidden fill={saved ? "currentColor" : "none"} />
        {t(
          saved
            ? "communities:detail.save.saved"
            : "communities:detail.save.cta",
        )}
      </Button>
      <Button
        variant="ghost-dark"
        onClick={onShare}
        aria-label={t("communities:detail.share.ariaLabel", {
          name: communityName,
        })}
      >
        <FiShare2 aria-hidden /> {t("communities:detail.share.cta")}
      </Button>
      {communitySlug && (
        <ShareToChatAction
          url={communityPath(communitySlug)}
          title={communityName}
          kind="community"
          variant="ghost-dark"
        />
      )}
      <CommunityHeroAvatars
        avatars={heroAvatars}
        memberNum={memberNum}
        hasCount={hasCount}
      />
      {/* Two quiet icon affordances close the row: the member's own
          notification level for this community, and reporting the space
          itself. A tooltip names each one, which keeps both quiet beside
          Join / Save / Share. */}
      {communitySlug && joined && (
        <CommunityNotificationControl
          key={communitySlug}
          slug={communitySlug}
          communityName={communityName}
        />
      )}
      {/* Reports the community itself, which had no path at all before this:
          the only recourse was reporting one post at a time, and that never
          puts the space in front of a moderator. Signed-in members only,
          membership not required. */}
      {communitySlug && (
        <CommunityReportControl
          slug={communitySlug}
          communityName={communityName}
        />
      )}
    </>
  );
}
