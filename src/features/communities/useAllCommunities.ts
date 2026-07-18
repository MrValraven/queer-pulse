import { useMemo } from "react";
import { useCreatedCommunities } from "./startCommunity/createdCommunities.store";
import { currentUser } from "../members/data/members";
import { communities } from "../homepage/data/communities";
import type { Community } from "../homepage/data/types";
import {
  typeLabelFor,
  type CreatedCommunity,
} from "./startCommunity/startCommunity.data";
import type { CommunityDetail, Person, Tint } from "./communityDetails";

/** Map a founded community into the `Community` card shape used across the app. */
export function createdToCommunity(c: CreatedCommunity): Community {
  return {
    slug: c.slug,
    href: `/community/${c.slug}`,
    type: c.type,
    typeLabel: typeLabelFor(c.type),
    name: c.name,
    description: c.purpose,
    count: "1 member",
    joinLabel: "Join →",
    privateBadge: c.accessTier === "private",
  };
}

/** Static directory + everything founded this session (created first). */
export function useAllCommunities(): Community[] {
  const { created } = useCreatedCommunities();
  return useMemo(
    () => [...created.map(createdToCommunity), ...communities],
    [created],
  );
}

/** Synthesize a full detail record for a freshly-founded community. */
export function buildCreatedDetail(c: CreatedCommunity): CommunityDetail {
  const organiser: Person & { bio: string } = {
    name: `${currentUser.first} ${currentUser.last}`,
    initials: currentUser.initials,
    tint: (currentUser.tint as Tint) ?? "plum",
    role: "Founder",
    slug: c.ownerSlug,
    bio: `Just opened ${c.name}. ${c.tagline || c.purpose}`,
  };
  return {
    badge: typeLabelFor(c.type),
    founded: "Founded just now",
    cadence: "Finding its rhythm",
    about: [c.purpose, `Who it's for: ${c.whoFor}`],
    whoFor: [c.whoFor],
    tags: [typeLabelFor(c.type), ...(c.tagline ? [c.tagline] : [])],
    organiser,
    nextEvent: {
      dd: "—",
      mm: "soon",
      title: "First gathering, to be announced",
      meta: "Once a few people are in",
      spots: "Open to all members",
    },
    topicThread: {
      votes: 1,
      title: `Welcome to ${c.name} — say hello`,
      author: organiser,
      time: "just now",
      replyCount: 0,
      post:
        c.tagline ||
        `This is the very beginning of ${c.name}. Introduce yourself and tell us what brought you here.`,
      replies: [],
    },
  };
}

/** The synthesized detail for a created community, or undefined if none matches. */
export function useCreatedDetail(
  slug: string | undefined,
): CommunityDetail | undefined {
  const { created } = useCreatedCommunities();
  return useMemo(() => {
    const c = created.find((x) => x.slug === slug);
    return c ? buildCreatedDetail(c) : undefined;
  }, [created, slug]);
}
