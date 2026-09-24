import { FiBookmark } from "react-icons/fi";
import { Button, IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Person } from "./communityDetails";
import { CommunityHeroAvatars } from "./CommunityHeroAvatars";
import { CommunityNotificationControl } from "./CommunityNotificationControl";
import { CommunityReportControl } from "../safety/CommunityReportControl";
import { CommunityShareMenu } from "./CommunityShareMenu";

/**
 * The hero's trailing action row: edit (owner/mod only), then one run of
 * icons (save, the share menu with "Send in a message" inside it, and the
 * notification + report controls), then the member avatar stack. Split out of
 * `CommunityDetailHero` purely to keep that component under the repo's
 * 200-line limit; it carries no state of its own.
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
      {/* Every icon sits together from here on, each named by a tooltip, so
          Join (and Edit, when shown) stay the only labelled actions competing
          for attention. Send in a message lives inside the Share menu. */}
      <Tooltip
        label={t(
          saved
            ? "communities:detail.save.saved"
            : "communities:detail.save.cta",
        )}
      >
        <IconButton
          tone="dark"
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
        </IconButton>
      </Tooltip>
      <CommunityShareMenu
        communityName={communityName}
        communitySlug={communitySlug}
        onShare={onShare}
      />
      {/* Two more quiet icons follow: the member's own notification level for
          this community, and reporting the space itself. A tooltip names each
          one, the same as Save and Share. */}
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
      {/* The member avatar stack closes the row, after the icons. */}
      <CommunityHeroAvatars
        avatars={heroAvatars}
        memberNum={memberNum}
        hasCount={hasCount}
      />
    </>
  );
}
