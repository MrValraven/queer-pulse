import { FiBookmark } from "react-icons/fi";
import { Button, IconButton, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath } from "../../app/routeMap";
import type { Community } from "../homepage/data/types";
import { ShareMenu } from "../messages/share/ShareMenu";
import type { Person } from "./communityDetails";
import { CommunityHeroAvatars } from "./CommunityHeroAvatars";
import { CommunityNotificationControl } from "./CommunityNotificationControl";
import { CommunityReportControl } from "../safety/CommunityReportControl";
import { buildCommunityShareMessage } from "./communityShareMessage";

/**
 * The hero's trailing action row: edit (owner/mod only), then one run of
 * icons (save, the shared `ShareMenu` with every way to pass the community
 * on, and the notification + report controls), then the member avatar stack.
 * The Share icon waits for the slug, since every item needs the link. Split
 * out of `CommunityDetailHero` purely to keep that component under the repo's
 * 200-line limit; it carries no state of its own.
 */
export function CommunityHeroSecondaryActions({
  canEdit,
  onEdit,
  saved,
  onToggleSave,
  community,
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
  /** Its name labels the icons; the share message reads the name, tagline
   *  and member count the hero already shows. */
  community: Community;
  communitySlug: string | undefined;
  joined: boolean;
  heroAvatars: Person[];
  memberNum: number;
  hasCount: boolean;
}) {
  const { t } = useTranslation();
  const communityName = community.name;
  return (
    <>
      {canEdit && (
        <Button variant="ghost-dark" onClick={onEdit}>
          {t("communities:edit.cta")}
        </Button>
      )}
      {/* Every icon sits together from here on, each named by a tooltip, so
          Join (and Edit, when shown) stay the only labelled actions competing
          for attention. Send in a message lives inside the Share menu,
          beside WhatsApp, the device share sheet and the two copy items. */}
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
      {communitySlug && (
        <ShareMenu
          tone="dark"
          triggerLabel={t("communities:detail.share.cta")}
          triggerAriaLabel={t("communities:detail.share.ariaLabel", {
            name: communityName,
          })}
          content={{
            path: communityPath(communitySlug),
            title: communityName,
            kind: "community",
            text: buildCommunityShareMessage(community, t),
          }}
        />
      )}
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
