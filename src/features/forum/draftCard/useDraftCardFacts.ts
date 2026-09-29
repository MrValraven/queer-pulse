import type { IconType } from "react-icons";
import { FiBarChart2, FiGlobe, FiHash, FiImage, FiUsers } from "react-icons/fi";
import { useMyCommunityOptions } from "../../communities/api/useMyCommunityOptions";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { composeKindById } from "../compose/composeKinds.data";
import type { PostKind } from "../compose/composeThread.types";
import type { ForumDraftCardDetails } from "../useForumThreadDraftPreview";

/** One chip on the draft card: something the member already chose. */
export interface DraftCardFact {
  id: "kind" | "audience" | "tags" | "photos" | "poll";
  icon: IconType;
  label: string;
}

/**
 * The composer choices a draft carries, in the order a member makes them:
 * what kind of post, where it goes, then what is attached.
 *
 * The audience chip is always there, because "where will this land" is the
 * one question every draft has an answer to. The rest appear only when the
 * member chose something, so an empty draft never shows a row of zeros.
 *
 * Mounted only inside a rendered card, so a member with no draft pays nothing
 * for the community lookup.
 */
export function useDraftCardFacts(
  details: ForumDraftCardDetails,
): DraftCardFact[] {
  const { t } = useTranslation();
  const myCommunities = useMyCommunityOptions();
  const facts: DraftCardFact[] = [];

  const kind = composeKindById(details.kind as PostKind | null);
  if (kind) facts.push({ id: "kind", icon: kind.icon, label: t(kind.nameKey) });

  const community = details.communitySlug
    ? myCommunities.find((option) => option.slug === details.communitySlug)
    : undefined;
  facts.push(
    community
      ? { id: "audience", icon: FiUsers, label: community.name }
      : {
          id: "audience",
          icon: FiGlobe,
          label: t("forum:draftNotice.fact.townSquare"),
        },
  );

  if (details.tagCount > 0)
    facts.push({
      id: "tags",
      icon: FiHash,
      label: t("forum:draftNotice.fact.tags", { count: details.tagCount }),
    });
  if (details.photoCount > 0)
    facts.push({
      id: "photos",
      icon: FiImage,
      label: t("forum:draftNotice.fact.photos", { count: details.photoCount }),
    });
  if (details.hasPoll)
    facts.push({
      id: "poll",
      icon: FiBarChart2,
      label: t("forum:draftNotice.fact.poll"),
    });

  return facts;
}
