import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../../shared/api/client";
import { tintForSlug, type SlugTint } from "../../shared/api/refs";
import { initialsFromParts } from "../../shared/lib/initials";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { MemberCardDTO } from "../members/api/members.api";
import { DEMO_SUGGESTED_PEOPLE } from "./SuggestedPeople.data";

// ── People you might know (SOC-05) ───────────────────────────────────────────
// Backed by `GET /members/suggested`, which scores three kinds of explicit
// fact the member created on purpose: a community they joined, a connection
// they accepted, and the words they wrote about themselves. Nothing
// behavioural is read, and identity is deliberately not a signal. The server
// carries the REASON with every person, so the card can say why instead of
// "recommended for you".

/** The single fact behind one suggestion. `identity` is absent by design. */
export type SuggestionReasonKind =
  "community" | "mutuals" | "openTo" | "tag" | "profession";

export interface SuggestionReasonDTO {
  kind: SuggestionReasonKind;
  /** Member or community data (a room's name, an interest tag, a custom
   *  availability phrase). Stays in the language it was written in. */
  label: string | null;
  /** Set instead of `label` when the fact is a shared-vocabulary id the client
   *  already translates (`members:openTo.*`). */
  presetId: string | null;
  /** Mutual-connection total, for the `mutuals` reason. */
  count: number;
}

export interface SuggestedMemberDTO {
  member: MemberCardDTO;
  reason: SuggestionReasonDTO;
  score: number;
}

/** What a suggestion card renders. Flat on purpose: the card needs a face, a
 *  name, one line about them, and the reason. */
export interface SuggestedPerson {
  slug: string;
  name: string;
  initials: string;
  tint: SlugTint;
  photo?: string;
  tagline?: string;
  reason: SuggestionReasonDTO;
}

export function toSuggestedPerson(dto: SuggestedMemberDTO): SuggestedPerson {
  const { member } = dto;
  return {
    slug: member.slug,
    name: `${member.firstName} ${member.lastName}`.trim(),
    initials: initialsFromParts(member.firstName, member.lastName),
    tint: tintForSlug(member.slug),
    photo: member.avatarUrl ?? undefined,
    tagline: member.tagline,
    reason: dto.reason,
  };
}

export const getSuggestedPeople = (limit: number) =>
  apiGet<{ items: SuggestedMemberDTO[] }>(
    `/members/suggested?limit=${limit}`,
  ).then((response) => response?.items ?? []);

/** POST /members/suggested/:slug/dismiss. Idempotent, and never tells the
 *  person they were dismissed. */
export const dismissSuggestedPerson = (slug: string) =>
  apiPost<{ dismissed: true }>(
    `/members/suggested/${encodeURIComponent(slug)}/dismiss`,
  );

/**
 * Deliberately NOT prefixed `["feed"]`. Connecting with someone invalidates
 * the whole `["feed"]` tree, and a suggestions query living under that prefix
 * would refetch itself mid-dismiss; in demo mode that would reset the list
 * straight back to the fixture and silently undo the dismissal.
 */
const SUGGESTED_KEY = (demoMode: boolean, limit: number) =>
  ["suggestedPeople", demoMode, limit] as const;

/**
 * The people-you-might-know list, plus the one action that changes it.
 *
 * Demo mode resolves the fixture and keeps whatever the session has since
 * dismissed in the query cache, so the prototype's dismiss sticks without a
 * network call. Live mode reads and writes `/members/suggested`.
 *
 * A dismissal is optimistic on both sides: the card leaves immediately,
 * because a suggestion that lingers after "no thanks" reads as a bug. The
 * server write is what makes it stick across devices and sessions.
 */
export function useSuggestedPeople(limit = 6) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const queryKey = SUGGESTED_KEY(demoMode, limit);

  const query = useQuery<SuggestedMemberDTO[]>({
    queryKey,
    queryFn: demoMode
      ? () => Promise.resolve(DEMO_SUGGESTED_PEOPLE.slice(0, limit))
      : () => getSuggestedPeople(limit),
    staleTime: demoMode ? Infinity : 5 * 60_000,
  });

  const people = useMemo(
    () => (query.data ?? []).map(toSuggestedPerson),
    [query.data],
  );

  const dismissal = useMutation({
    mutationFn: (slug: string) =>
      demoMode
        ? Promise.resolve({ dismissed: true } as const)
        : dismissSuggestedPerson(slug),
    onMutate: (slug: string) => {
      queryClient.setQueryData<SuggestedMemberDTO[]>(queryKey, (previous) =>
        (previous ?? []).filter((entry) => entry.member.slug !== slug),
      );
    },
  });

  const dismiss = useCallback(
    (slug: string) => {
      dismissal.mutate(slug);
    },
    [dismissal],
  );

  return {
    people,
    isLoading: query.isLoading,
    isError: query.isError,
    dismiss,
  };
}
