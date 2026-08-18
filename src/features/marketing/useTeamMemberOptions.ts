import { useEffect, useMemo } from "react";
import { type SelectOption } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import { useMyCommunityOptions } from "../communities/api/useMyCommunityOptions";

/**
 * Options for the "team members" picker on the post-opportunity form: the
 * poster's accepted connections, grouped above the communities they belong
 * to. Values are slugs, carried straight through to
 * `CreateOpportunityDto.team`. Drains every connections page up front (the
 * same pattern `GroupAddMembersModal` uses) since this is a one-shot picker,
 * not an infinite list.
 */
export function useTeamMemberOptions(): SelectOption[] {
  const { t } = useTranslation();
  const { views, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConnectionsList("all");
  const communities = useMyCommunityOptions();

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return useMemo(
    () => [
      ...views.map((view) => ({
        value: view.slug,
        label: view.name,
        group: t("marketing:postOpportunity.rich.teamGroupConnections"),
      })),
      ...communities.map((community) => ({
        value: community.slug,
        label: community.name,
        group: t("marketing:postOpportunity.rich.teamGroupCommunities"),
      })),
    ],
    [views, communities, t],
  );
}
