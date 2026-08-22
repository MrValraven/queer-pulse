import { useMemo } from "react";
import { useCreatedCommunities } from "./startCommunity/createdCommunities.store";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityEdits } from "../../app/providers/useCommunityEdits";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { applyCommunityOverride } from "./api/communities.adapters";
import { communities } from "../homepage/data/communities";
import type { Community } from "../homepage/data/types";
import {
  typeLabelFor,
  type CreatedCommunity,
} from "./startCommunity/startCommunity.data";
import type { CommunityDetail, Person, Tint } from "./communityDetails";

/** Map a founded community into the `Community` card shape used across the app. */
export function createdToCommunity(
  community: CreatedCommunity,
  translate: TFunction,
): Community {
  const c = community;
  return {
    slug: c.slug,
    href: `/community/${c.slug}`,
    type: c.type,
    typeLabel: typeLabelFor(c.type),
    name: c.name,
    description: c.purpose,
    count: translate("communities:common.count.members", { count: 1 }),
    joinLabel: translate("communities:card.join.public"),
    privateBadge: c.accessTier === "private",
    // Carry the founder's chosen join policy through so gated (invite/request)
    // communities render their real tier — without this the card/detail tier
    // falls back to `privateBadge`, which only knows "private" and collapses
    // "invite"/"request" into "public" (a public "Join" CTA on an invite-only
    // community).
    accessTier: c.accessTier,
  };
}

/** The DEMO directory: the static registry plus everything founded this
 *  session (created first), with any session edit overrides applied so an
 *  owner/mod's demo edit shows on the discover grid too, not just the detail
 *  page.
 *
 *  Empty in live mode by design — every one of these rows is a prototype
 *  fixture, and a real community whose slug or name happened to match one
 *  would be described by the mock instead of by the server. Live callers read
 *  the directory through `useCommunities` / `useCommunity` instead. */
export function useAllCommunities(): Community[] {
  const { demoMode } = useDemoMode();
  const { created } = useCreatedCommunities();
  const { overrides } = useCommunityEdits();
  const { t } = useTranslation();
  return useMemo(
    () =>
      demoMode
        ? [
            ...created.map((community) => createdToCommunity(community, t)),
            ...communities,
          ].map((community) => {
            const override = community.slug
              ? overrides[community.slug]
              : undefined;
            return override
              ? applyCommunityOverride(community, override, t)
              : community;
          })
        : [],
    [demoMode, created, overrides, t],
  );
}

/** Synthesize a full detail record for a freshly-founded community. */
export function buildCreatedDetail(
  community: CreatedCommunity,
  translate: TFunction,
): CommunityDetail {
  const c = community;
  // The founder is whoever actually created the community — captured at creation
  // time as the locked "owner" steward (derived from the signed-in member via
  // `ownerStewardFrom`), never a hardcoded persona.
  const owner = c.stewards.find((steward) => steward.key === "owner");
  const founderLabel = translate("communities:detail.organiser.founder");
  const organiser: Person & { bio: string } = {
    name: owner?.name || founderLabel,
    initials: owner?.initials || "?",
    tint: (owner?.tint as Tint) ?? "plum",
    role: founderLabel,
    slug: c.ownerSlug,
    // The founder's real profile picture, captured on the owner steward at
    // creation time — so the organiser card + hero show their actual face
    // rather than initials when their slug isn't in the static registry.
    avatarUrl: owner?.src ?? null,
    bio: translate("communities:detail.organiser.justOpened", {
      name: c.name,
      blurb: c.tagline || c.purpose,
    }),
  };
  return {
    badge: typeLabelFor(c.type),
    founded: translate("communities:detail.foundedJustNow"),
    cadence: translate("communities:detail.cadenceDefault"),
    about: [
      c.purpose,
      translate("communities:detail.about.whoForLine", { whoFor: c.whoFor }),
    ],
    whoFor: [c.whoFor],
    tags: [typeLabelFor(c.type), ...(c.tagline ? [c.tagline] : [])],
    organiser,
    nextEvent: {
      dd: "-",
      mm: translate("communities:detail.nextEvent.soonChip"),
      title: translate("communities:detail.nextEvent.firstTitle"),
      meta: translate("communities:detail.nextEvent.onceFewPeople"),
      spots: translate("communities:detail.nextEvent.openToAllMembers"),
      tba: true,
    },
    topicThread: {
      votes: 1,
      title: translate("communities:detail.topicThread.welcomeSayHello", {
        name: c.name,
      }),
      author: organiser,
      time: translate("communities:detail.topicThread.justNow"),
      replyCount: 0,
      post:
        c.tagline ||
        translate("communities:detail.topicThread.beginningPost", {
          name: c.name,
        }),
      replies: [],
    },
  };
}

/** The synthesized detail for a created community, or undefined if none matches. */
export function useCreatedDetail(
  slug: string | undefined,
): CommunityDetail | undefined {
  const { created } = useCreatedCommunities();
  const { t } = useTranslation();
  return useMemo(() => {
    const found = created.find((community) => community.slug === slug);
    return found ? buildCreatedDetail(found, t) : undefined;
  }, [created, slug, t]);
}
