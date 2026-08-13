import { useMemo } from "react";
import { useCommunities } from "../../features/communities/api/useCommunities";
import { useTopics } from "../../features/topics/api/useTopics";
import { useDirectoryPlaces } from "../../features/marketing/api/useDirectory";
import { useEventMentionOptions } from "../../features/gatherings/api/useEventMentionOptions";
import { useThreadMentionOptions } from "../../features/forum/api/useThreadMentionOptions";
import { initialsOf } from "../api/refs";
import { useMemberSuggestions } from "./useMemberSuggestions";

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
  const members = useMemberSuggestions();
  const communityList = useCommunities();
  const topicList = useTopics();
  const directoryPlaces = useDirectoryPlaces();
  const eventOptions = useEventMentionOptions();
  const threadOptions = useThreadMentionOptions();

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
