import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath } from "../../app/routeMap";
import { useJoinCommunity } from "../communities/api/useCommunityMutations";

/**
 * "Request to join", for a LIVE reading group.
 *
 * This is the affordance the directory could not offer before: a group carried
 * no lister account, so the card fell back to a disabled state rather than drop
 * the member into an empty inbox. A live group is a community with a real
 * owner, so the request is the community's own join flow — the same endpoint,
 * the same owner review queue, the same notification the owner already gets —
 * rather than a second, thinner request path beside it.
 *
 * A reading group is created at `request` access tier, so the answer is
 * `requested` and the owner decides. The instant-`joined` branch is still
 * handled, because an owner may open their group up later and the button must
 * tell the truth about which of the two just happened.
 *
 * Lives in its own component because it holds a hook per group: a card that
 * called `useJoinCommunity` inline could not also render the curated demo
 * groups, which have no community to join.
 */
export function ReadingGroupJoinButton({
  slug,
  isJoined,
}: {
  /** The community that IS this reading group. */
  slug: string;
  /** True when the viewer is already on the roster. */
  isJoined: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { mutate, isPending } = useJoinCommunity(slug);
  const [hasRequested, setHasRequested] = useState(false);

  if (isJoined) {
    return (
      <Button variant="ghost" size="sm" to={communityPath(slug)}>
        {t("community:readingGroups.card.openGroupCta")}
      </Button>
    );
  }

  if (hasRequested) {
    return (
      <Button variant="ghost" size="sm" disabled>
        {t("community:readingGroups.card.requestSentCta")}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() =>
        mutate(
          {},
          {
            onSuccess: (result) => {
              // Demo mode resolves null; this component only ever renders for a
              // live group, so a null here means the mutation short-circuited
              // and nothing was sent. Say nothing rather than fake a request.
              if (!result) return;
              setHasRequested(true);
              showToast(
                t(
                  result.outcome === "joined"
                    ? "community:readingGroups.card.joinedToast"
                    : "community:readingGroups.card.requestedToast",
                ),
                "success",
              );
            },
            onError: () =>
              showToast(
                t("community:readingGroups.card.joinErrorToast"),
                "error",
              ),
          },
        )
      }
    >
      {t(
        isPending
          ? "community:readingGroups.card.requestPendingCta"
          : "community:readingGroups.card.requestToJoinCta",
      )}
    </Button>
  );
}
