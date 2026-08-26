import { MEMBERS } from "../members/data/members";
import type { MemberCardDTO } from "../members/api/members.api";
import type {
  SuggestedMemberDTO,
  SuggestionReasonDTO,
} from "./SuggestedPeople.api";

/**
 * Demo fallback for the people-you-might-know strip (SOC-05).
 *
 * Four fixed members with four different reasons, so the prototype shows every
 * shape the card can render: a shared room, mutual connections, a shared
 * availability chip and a shared interest tag. NEVER read from a live path:
 * `useSuggestedPeople` branches on `demoMode` before it touches this file.
 *
 * There is deliberately no identity reason here, because the backend never
 * produces one. `profiles.discoverable_identities` is special-category data,
 * and pushing a person in front of a stranger BECAUSE of their identity is a
 * different act from letting someone find them with an identity filter they
 * chose to run. See `member-suggestion-scoring.ts` in the backend.
 */
const DEMO_ENTRIES: { slug: string; reason: SuggestionReasonDTO }[] = [
  {
    slug: "bilal-kaya",
    reason: {
      kind: "community",
      label: "Trans & Non-Binary Network",
      presetId: null,
      count: 1,
    },
  },
  {
    slug: "ines-fonseca",
    reason: { kind: "mutuals", label: null, presetId: null, count: 3 },
  },
  {
    slug: "daniel-oliveira",
    reason: {
      kind: "openTo",
      label: null,
      presetId: "collaborating",
      count: 0,
    },
  },
  {
    slug: "kai",
    reason: { kind: "tag", label: "Ballroom", presetId: null, count: 0 },
  },
];

function toDemoCard(slug: string): MemberCardDTO | null {
  const member = MEMBERS[slug];
  if (!member) return null;
  return {
    slug: member.slug,
    firstName: member.first,
    lastName: member.last,
    pronouns: member.pronouns,
    tagline: member.role,
    avatarUrl: member.photo ?? null,
    tags: member.tags,
    vouchCount: 0,
    visibility: "open",
  };
}

export const DEMO_SUGGESTED_PEOPLE: SuggestedMemberDTO[] = DEMO_ENTRIES.flatMap(
  (entry, index) => {
    const member = toDemoCard(entry.slug);
    return member ? [{ member, reason: entry.reason, score: 4 - index }] : [];
  },
);
