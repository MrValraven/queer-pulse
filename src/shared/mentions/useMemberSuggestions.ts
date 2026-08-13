import { useMemo } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMembers } from "../../features/members/api/useMembers";
import { MEMBERS, memberName } from "../../features/members/data/members";
import { initialsOf } from "../api/refs";
import type { Suggestion } from "./useMentionSuggestions";

/**
 * Members available to mention or credit, dual-mode. Demo mode gets full
 * registry fidelity (names + photos resolved by slug); live mode maps whatever
 * `useMembers` has loaded and never invents data — a card missing a name or
 * photo falls back to its slug/initials rather than a mock persona's. This is
 * the single source of truth behind `useMentionSuggestions().members` and the
 * collaborator picker, so both search the same corpus the same way.
 */
export function useMemberSuggestions(): Suggestion[] {
  const { demoMode } = useDemoMode();
  const memberList = useMembers();
  return useMemo<Suggestion[]>(
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
}
