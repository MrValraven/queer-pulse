import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { vouchFor } from "./members.api";
import type { GivenVouchFace } from "./useGivenVouches";
import type { VouchRelationship } from "../vouchMember.data";

export interface VouchMemberInput {
  slug: string;
  /** The ways the voucher knows this member — one or more. */
  relationships?: VouchRelationship[];
  note?: string;
  anonymous?: boolean;
  /**
   * The vouched member's name/avatar, so the "You vouched for" list can gain
   * the new row without a refetch (see `onSuccess`). Display-only: none of it
   * is sent to the backend, which knows the member from `slug` alone.
   */
  member?: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

/**
 * One-shot "vouch for a member" mutation for VouchMemberModal. Demo mode
 * resolves without a network call. Invalidates the surfaces a new vouch
 * changes: the target profile, the members list, and the vouchers face-row.
 *
 * `["givenVouches", demoMode]` is patched rather than invalidated. That query
 * is `staleTime: Infinity` on purpose (`useGivenVouches` explains why: a
 * refetch landing mid-flight would overwrite `VouchProvider`'s optimistic
 * `vouched` list wholesale, and a vouch would visibly undo itself). But leaving
 * it entirely alone meant the owner's own profile never noticed the vouch they
 * had just given: the "You vouched for" stat and `NetworkListModal` both read
 * that query, so both stayed at the old count for the rest of the session.
 * Writing the new row straight into the cache updates both, and `useVouch`'s
 * hydration effect picks the slug up from the same data.
 */
export function useVouchMember() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    { vouchCount: number } | undefined,
    Error,
    VouchMemberInput
  >({
    mutationFn: async ({ slug, relationships, note, anonymous }) => {
      if (demoMode) return undefined;
      return vouchFor(slug, { relationships, note, anonymous });
    },
    onSuccess: (_data, { slug, member }) => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["members"] });
      void queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      queryClient.setQueryData<GivenVouchFace[]>(
        ["givenVouches", demoMode],
        (previous) => {
          // Untouched when the query has never run (demo, logged out, or a
          // member who hasn't opened a profile yet) — seeding it from here
          // would invent a one-row list the server never sent.
          if (!previous) return previous;
          if (previous.some((face) => face.slug === slug)) return previous;
          return [
            {
              slug,
              firstName: member?.firstName ?? "",
              lastName: member?.lastName ?? "",
              avatarUrl: member?.avatarUrl,
              createdAt: new Date().toISOString(),
            },
            ...previous,
          ];
        },
      );
    },
  });
}
