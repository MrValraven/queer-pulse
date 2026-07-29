import { useMemo } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMembers } from "../../features/members/api/useMembers";
import { useCommunities } from "../../features/communities/api/useCommunities";
import { useTopics } from "../../features/topics/api/useTopics";
import { useDirectoryPlaces } from "../../features/marketing/api/useDirectory";
import { useEventMentionOptions } from "../../features/gatherings/api/useEventMentionOptions";
import { useThreadMentionOptions } from "../../features/forum/api/useThreadMentionOptions";
import { MEMBERS, memberName } from "../../features/members/data/members";
import { initialsOf } from "../api/refs";

/** A pick-able mention target, uniform across members, communities, topics, businesses, events, and threads. */
export interface Suggestion {
  kind: "member" | "community" | "topic" | "business" | "event" | "thread";
  slug: string;
  name: string;
  avatarUrl?: string;
  initials: string;
}

/**
 * Members + communities + topics + businesses + events + threads available
 * to mention, dual-mode. Demo mode gets full registry fidelity (names +
 * photos resolved by slug); live mode maps whatever the paginated/query
 * hooks have loaded and never invents data — if a list is empty (no corpus
 * loaded), that kind simply yields no suggestions and manual typing still
 * works and still linkifies on render.
 */
export function useMentionSuggestions(): {
  members: Suggestion[];
  communities: Suggestion[];
  topics: Suggestion[];
  businesses: Suggestion[];
  events: Suggestion[];
  threads: Suggestion[];
} {
  const { demoMode } = useDemoMode();
  const memberList = useMembers();
  const communityList = useCommunities();
  const topicList = useTopics();
  const directoryPlaces = useDirectoryPlaces();
  const eventOptions = useEventMentionOptions();
  const threadOptions = useThreadMentionOptions();

  const members = useMemo<Suggestion[]>(
    () =>
      memberList.items.map((card) => {
        // Live cards carry their own identity; demo cards resolve it from the
        // registry by slug (avatarUrl/firstName are undefined on demo cards).
        // The registry reads are DEMO-ONLY — in live mode a card missing a name
        // or photo falls back to its slug/initials rather than a mock persona's.
        const name = card.firstName
          ? `${card.firstName} ${card.lastName ?? ""}`.trim()
          : demoMode
            ? memberName(card.slug)
            : card.slug;
        // initialsOf takes first/last separately — derive them from the card
        // when present, otherwise split the resolved display name.
        const firstName = card.firstName ?? name.split(" ")[0] ?? "";
        const lastName = card.lastName ?? name.split(" ").slice(1).join(" ");
        return {
          kind: "member",
          slug: card.slug,
          name,
          avatarUrl:
            card.avatarUrl ??
            (demoMode ? MEMBERS[card.slug]?.photo : undefined) ??
            undefined,
          initials: initialsOf(firstName, lastName),
        };
      }),
    [memberList.items, demoMode],
  );

  const communities = useMemo<Suggestion[]>(
    () =>
      communityList.items
        .filter((community) => !!community.slug)
        .map((community) => ({
          kind: "community",
          slug: community.slug as string,
          name: community.name,
          initials: initialsOf(community.name, ""),
        })),
    [communityList.items],
  );

  const topics = useMemo<Suggestion[]>(
    () =>
      topicList.items.map((topic) => ({
        kind: "topic",
        slug: topic.tag,
        name: topic.label,
        initials: initialsOf(topic.label, ""),
      })),
    [topicList.items],
  );

  const businesses = useMemo<Suggestion[]>(
    () =>
      directoryPlaces.map((place) => ({
        kind: "business",
        slug: place.slug,
        name: place.name,
        initials: initialsOf(place.name, ""),
      })),
    [directoryPlaces],
  );

  const events = useMemo<Suggestion[]>(
    () =>
      eventOptions.map((event) => ({
        kind: "event",
        slug: event.slug,
        name: event.name,
        initials: initialsOf(event.name, ""),
      })),
    [eventOptions],
  );

  const threads = useMemo<Suggestion[]>(
    () =>
      threadOptions.map((thread) => ({
        kind: "thread",
        slug: thread.slug,
        name: thread.name,
        initials: initialsOf(thread.name, ""),
      })),
    [threadOptions],
  );

  return { members, communities, topics, businesses, events, threads };
}
