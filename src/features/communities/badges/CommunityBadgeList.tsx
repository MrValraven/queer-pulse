import { useEffect, useRef } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useToast } from "../../../shared/components/feedback/useToast";
import { FadeIn } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  CommunityBadgeDTO,
  CommunityBadgesResponse,
} from "./api/communityBadges.api";
import { useWearCommunityBadge } from "./api/useCommunityBadgeMutations";
import { CommunityBadgeRow } from "./CommunityBadgeRow";
import { communityBadgeDisplayName } from "./communityBadgeDisplayName";
import { communityBadgeErrorText } from "./communityBadgeErrors";
import styles from "./CommunityBadgeSheet.module.css";

export interface CommunityBadgeListProps {
  slug: string;
  communityName: string;
  response: CommunityBadgesResponse;
  focusBadgeId: string | null;
}

/** Brings the linked badge into view once per focus id. An id that is not in
 *  the list (a deleted or switched-off badge) does nothing. */
function useScrollToFocusedBadge(focusBadgeId: string | null) {
  const listRef = useRef<HTMLUListElement>(null);
  const scrolledForIdRef = useRef<string | null>(null);
  const { reducedMotion } = useMotionPrefs();
  useEffect(() => {
    if (focusBadgeId === null || scrolledForIdRef.current === focusBadgeId)
      return;
    const focusedItem = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>("[data-badge-id]") ?? [],
    ).find((item) => item.dataset.badgeId === focusBadgeId);
    if (!focusedItem) return;
    scrolledForIdRef.current = focusBadgeId;
    focusedItem.scrollIntoView({
      block: "center",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [focusBadgeId, reducedMotion]);
  return listRef;
}

/**
 * The enabled badges of one community, oldest first. A member sees their
 * progress and wears or stops wearing an earned badge from here; a visitor
 * sees how each badge is earned.
 */
export function CommunityBadgeList({
  slug,
  communityName,
  response,
  focusBadgeId,
}: CommunityBadgeListProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const wearBadge = useWearCommunityBadge();
  const listRef = useScrollToFocusedBadge(focusBadgeId);

  const setWornBadge = (badge: CommunityBadgeDTO | null) => {
    wearBadge.mutate(
      { slug, badgeId: badge?.id ?? null },
      {
        onSuccess: () => {
          showToast(
            badge
              ? t("communities:badges.sheet.woreToast", {
                  badge: communityBadgeDisplayName(badge, t),
                  name: communityName,
                })
              : t("communities:badges.sheet.stoppedToast", {
                  name: communityName,
                }),
            "success",
          );
        },
        onError: (error) => {
          showToast(communityBadgeErrorText(error, t, fmt), "error");
        },
      },
    );
  };

  if (response.badges.length === 0) {
    return (
      <FadeIn as="p" className={styles.empty}>
        {t("communities:badges.sheet.empty")}
      </FadeIn>
    );
  }

  return (
    <ul ref={listRef} className={styles.list}>
      {response.badges.map((badge, index) => (
        <FadeIn
          as="li"
          key={badge.id}
          delay={index * 40}
          className={styles.listItem}
          data-badge-id={badge.id}
        >
          <CommunityBadgeRow
            badge={badge}
            isMember={response.isMember}
            isWorn={response.isMember && response.wornBadgeId === badge.id}
            isFocused={badge.id === focusBadgeId}
            isPending={wearBadge.isPending}
            onWear={() => setWornBadge(badge)}
            onStopWearing={() => setWornBadge(null)}
          />
        </FadeIn>
      ))}
    </ul>
  );
}
