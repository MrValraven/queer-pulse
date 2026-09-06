import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getVouchers, type VoucherDTO } from "./members.api";
import { initialsOf, tintForSlug } from "./members.adapters";
import { demoNetworkTimestamp } from "./networkTimestamps";
import { RELATIONSHIPS } from "../vouchMember.data";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";

/**
 * `VoucherDTO` doesn't (yet) declare `relationships` in its shared type —
 * added here locally rather than widening the shared DTO, since the backend
 * response already carries it. Optional/nullable: pre-relationship vouches
 * (e.g. the signup auto-vouch) carry none.
 */
type VoucherDTOWithRelationships = VoucherDTO & {
  relationships?: string[] | null;
};

/** A single voucher face rendered on a profile's "Vouched for by…" row. */
export interface VoucherFace {
  /**
   * Member slug the face links to (`/members/:slug`). Empty for an anonymous
   * voucher — the face must not be linked in that case.
   */
  slug: string;
  name: string;
  initials: string;
  tint: AvatarTint;
  avatarUrl?: string;
  /** The voucher vouched anonymously; render an un-linked, un-named face. */
  anonymous?: boolean;
  /**
   * ISO timestamp the vouch was made. Kept from `VoucherDTO.createdAt` (and a
   * plausible mock value in demo) so the profile "Your network" section can sort
   * and label received vouches by recency. Optional: the face row that first
   * consumed this type never needed it.
   */
  createdAt?: string;
  /**
   * The ways this voucher knows the member ("collaborated", "friends", …),
   * from `Vouch.relationships`. Empty when the vouch carries no recorded
   * relationship (e.g. the signup auto-vouch) — never undefined, so callers
   * can flatMap/filter it without an extra null check.
   */
  relationships: string[];
}

/**
 * The voucher faces for a member's "Vouched for by…" row.
 *
 * - **Demo mode:** derive faces from the mock registry — resolve the member's
 *   `vouchers` slugs against `MEMBERS`. Placeholder slugs (`__vouch_*`, used when
 *   only a count is known) resolve to nothing and are dropped, so the count-only
 *   case degrades gracefully to no faces.
 * - **Live mode:** `GET /members/:slug/vouchers` and map each `VoucherDTO`.
 *
 * Callers should treat an empty/undefined result as "no resolvable faces" and
 * fall back to their own placeholder/count copy.
 */
export function useVouchers(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<VoucherFace[]>({
    queryKey: ["vouchers", demoMode, slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return [];
      if (demoMode) {
        const { MEMBERS } = await import("../data/members");
        const member = MEMBERS[slug];
        if (!member) return [];
        return member.vouchers.flatMap((voucherSlug, voucherIndex) => {
          const v = MEMBERS[voucherSlug];
          if (!v) return [];
          return [
            {
              slug: voucherSlug,
              name: `${v.first} ${v.last}`,
              initials: v.initials,
              tint: v.tint,
              avatarUrl: v.photo,
              createdAt: demoNetworkTimestamp(voucherIndex),
              // The mock registry has no relationship data — synthesize a
              // deterministic single tag from the index (same spirit as
              // `demoNetworkTimestamp`) so the texture chips render in demo too.
              relationships: [
                RELATIONSHIPS[voucherIndex % RELATIONSHIPS.length] ??
                  RELATIONSHIPS[0],
              ],
            },
          ];
        });
      }
      const res = await getVouchers(slug);
      // `res.count` is deliberately dropped. It is the true tally even when the
      // roster came back empty because the member hid it, so it is tempting to
      // surface here, but the profile already carries that number
      // (`Member.vouchers.length`, filled per `vouchCount` by `cardToMember`)
      // and that is the one `ProfileTrustSignals` prints. A row reading its
      // count from here and a row reading it from the profile can disagree on
      // one screen. Callers that need "how many, with no faces" read the
      // profile; see `HeroVouchRow`'s count-only branch.
      return res.vouchers.map((v) => {
        const relationships =
          (v as VoucherDTOWithRelationships).relationships ?? [];
        // Anonymous vouchers come back shielded (empty slug/name). Render a
        // generic, un-linked face instead of a broken link to `/members/`.
        if (v.anonymous) {
          return {
            slug: "",
            name: "",
            initials: "?",
            tint: "plum" as AvatarTint,
            anonymous: true,
            createdAt: v.createdAt,
            relationships,
          };
        }
        return {
          slug: v.slug,
          name: `${v.firstName} ${v.lastName}`,
          initials: initialsOf(v.firstName, v.lastName),
          tint: tintForSlug(v.slug),
          avatarUrl: v.avatarUrl ?? undefined,
          createdAt: v.createdAt,
          relationships,
        };
      });
    },
  });
}
