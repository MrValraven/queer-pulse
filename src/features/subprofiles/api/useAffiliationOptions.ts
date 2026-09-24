import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useAllCommunities } from "../../communities/useAllCommunities";
import {
  getAffiliationOptions,
  type AffiliationDTO,
  type AffiliationOptionDTO,
} from "./subprofiles.api";

/** The `type:slug` identity the backend's unique constraint is keyed on (per
 *  persona), shared by the editor and each row to hide already-picked targets. */
export const affiliationTargetKey = (targetType: string, targetSlug: string) =>
  `${targetType}:${targetSlug}`;

/** The My Events categories that count as "going" for linking purposes:
 *  an RSVP'd event or one the demo member hosts. */
const LINKABLE_EVENT_CATEGORIES = new Set(["going", "hosting"]);

/** The options of one type the row may still pick: `optionsOfType` is every
 *  target of that type, `eligibleOptions` drops the ones another row already
 *  links. Shared by `SubprofileAffiliationRow` (to know whether the row has
 *  anything to pick) and `SubprofileAffiliationTargetPicker`. */
export function affiliationOptionsForRow(
  options: readonly AffiliationOptionDTO[],
  targetType: AffiliationOptionDTO["targetType"],
  takenKeys: ReadonlySet<string>,
): {
  optionsOfType: AffiliationOptionDTO[];
  eligibleOptions: AffiliationOptionDTO[];
} {
  const optionsOfType = options.filter(
    (option) => option.targetType === targetType,
  );
  const eligibleOptions = optionsOfType.filter(
    (option) =>
      !takenKeys.has(
        affiliationTargetKey(option.targetType, option.targetSlug),
      ),
  );
  return { optionsOfType, eligibleOptions };
}

/** An option's start as epoch milliseconds, or null when it has none. */
function startTimeOf(option: AffiliationOptionDTO): number | null {
  if (!option.startsAt) return null;
  const startTime = Date.parse(option.startsAt);
  return Number.isNaN(startTime) ? null : startTime;
}

/** Communities alphabetical, then upcoming events soonest first, then past
 *  events newest first (undated last), matching the order the backend
 *  returns. `now` splits upcoming from past, the same `>=` the backend uses. */
function compareOptions(
  left: AffiliationOptionDTO,
  right: AffiliationOptionDTO,
  now: number,
): number {
  if (left.targetType !== right.targetType)
    return left.targetType === "community" ? -1 : 1;
  if (left.targetType === "community")
    return left.name.localeCompare(right.name);
  const leftStart = startTimeOf(left);
  const rightStart = startTimeOf(right);
  if (leftStart === null || rightStart === null) {
    if (leftStart === rightStart) return 0;
    return leftStart === null ? 1 : -1;
  }
  const isLeftUpcoming = leftStart >= now;
  const isRightUpcoming = rightStart >= now;
  if (isLeftUpcoming !== isRightUpcoming) return isLeftUpcoming ? -1 : 1;
  return isLeftUpcoming ? leftStart - rightStart : rightStart - leftStart;
}

/**
 * Merge a persona's saved links into the eligible targets so every saved link
 * shows selected in its picker. The options endpoint lists only the REQUESTING
 * owner's own communities and events (capped per type), while a saved link
 * stays valid as long as any co-owner qualifies, so a co-owner's link or one
 * past the cap would otherwise render as an empty picker. Deduped by
 * `affiliationTargetKey`; the given order is kept (communities, then events)
 * and each saved-only target goes at the end of its own type. Shared by live
 * and demo through `SubprofileAffiliationsEditor`.
 */
export function mergeSavedAffiliationOptions(
  options: readonly AffiliationOptionDTO[],
  savedAffiliations: readonly AffiliationDTO[],
): AffiliationOptionDTO[] {
  const knownKeys = new Set(
    options.map((option) =>
      affiliationTargetKey(option.targetType, option.targetSlug),
    ),
  );
  const savedOnly: AffiliationOptionDTO[] = [];
  for (const affiliation of savedAffiliations) {
    const key = affiliationTargetKey(
      affiliation.targetType,
      affiliation.targetSlug,
    );
    if (knownKeys.has(key)) continue;
    knownKeys.add(key);
    savedOnly.push({
      targetType: affiliation.targetType,
      targetSlug: affiliation.targetSlug,
      name: affiliation.name,
      imageUrl: affiliation.imageUrl,
      startsAt: null,
    });
  }
  if (savedOnly.length === 0) return [...options];
  const ofType = (
    list: readonly AffiliationOptionDTO[],
    targetType: AffiliationOptionDTO["targetType"],
  ) => list.filter((option) => option.targetType === targetType);
  return [
    ...ofType(options, "community"),
    ...ofType(savedOnly, "community"),
    ...ofType(options, "event"),
    ...ofType(savedOnly, "event"),
  ];
}

/** Demo options with no network: the member's communities (passed in from the
 *  session membership store) and the gatherings they're going to or hosting
 *  (the My Events registry). The persona's saved links are merged in by the
 *  editor (`mergeSavedAffiliationOptions`), the same as live. */
async function buildDemoOptions(
  memberCommunityOptions: AffiliationOptionDTO[],
): Promise<AffiliationOptionDTO[]> {
  const { INITIAL_EVENTS } = await import("../../myevents/myEvents.mock");
  const eventOptions: AffiliationOptionDTO[] = INITIAL_EVENTS.filter(
    (event) =>
      LINKABLE_EVENT_CATEGORIES.has(event.category) &&
      !event.cancelled &&
      Boolean(event.slug),
  ).map((event): AffiliationOptionDTO => {
    const startsAt = new Date(`${event.date}T${event.start || "00:00"}:00`);
    return {
      targetType: "event",
      targetSlug: event.slug ?? "",
      name: event.title,
      imageUrl: null,
      startsAt: Number.isNaN(startsAt.getTime())
        ? null
        : startsAt.toISOString(),
    };
  });
  const byKey = new Map<string, AffiliationOptionDTO>();
  for (const option of [...memberCommunityOptions, ...eventOptions]) {
    const key = affiliationTargetKey(option.targetType, option.targetSlug);
    if (!byKey.has(key)) byKey.set(key, option);
  }
  const now = Date.now();
  return [...byKey.values()].sort((left, right) =>
    compareOptions(left, right, now),
  );
}

/**
 * The communities and events the signed-in owner may link a persona to ("Part
 * of"): only communities they're a member of and events they're going to (a
 * co-owner's own memberships are left out; merge the persona's saved links in
 * with `mergeSavedAffiliationOptions`). Dual-mode like
 * `useAffiliations`: live calls `GET /subprofiles/:id/affiliation-options`;
 * demo derives the same shape from the session membership store and the lazily
 * imported mock registries, with no network. The key has its own root so the
 * many `["subprofile", ...]` invalidations and cache writes never touch it.
 */
export function useAffiliationOptions(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const { memberships } = useCommunityMembership();
  // `[]` in live mode by construction, so this only does work in demo.
  const demoDirectory = useAllCommunities();

  const memberCommunityOptions = useMemo<AffiliationOptionDTO[]>(
    () =>
      demoDirectory
        .filter((community) => community.slug && memberships[community.slug])
        .map((community): AffiliationOptionDTO => ({
          targetType: "community",
          targetSlug: community.slug ?? "",
          name: community.name,
          // Live returns no image for communities; demo matches it.
          imageUrl: null,
          startsAt: null,
        })),
    [demoDirectory, memberships],
  );
  // Joining or leaving a community in demo has to re-derive the options.
  const demoCommunityKey = demoMode
    ? memberCommunityOptions.map((option) => option.targetSlug).join(",")
    : null;

  return useQuery<AffiliationOptionDTO[]>({
    queryKey: [
      "subprofileAffiliationOptions",
      demoMode,
      subprofileId,
      demoCommunityKey,
    ],
    enabled: Boolean(subprofileId),
    queryFn: ({ signal }) =>
      demoMode
        ? buildDemoOptions(memberCommunityOptions)
        : getAffiliationOptions(subprofileId, signal),
  });
}
