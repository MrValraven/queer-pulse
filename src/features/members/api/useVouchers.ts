import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getVouchers } from "./members.api";
import { initialsOf, tintForSlug } from "./members.adapters";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";

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
        return member.vouchers.flatMap((voucherSlug) => {
          const v = MEMBERS[voucherSlug];
          if (!v) return [];
          return [
            {
              slug: voucherSlug,
              name: `${v.first} ${v.last}`,
              initials: v.initials,
              tint: v.tint,
              avatarUrl: v.photo,
            },
          ];
        });
      }
      const res = await getVouchers(slug);
      return res.vouchers.map((v) => {
        // Anonymous vouchers come back shielded (empty slug/name). Render a
        // generic, un-linked face instead of a broken link to `/members/`.
        if (v.anonymous) {
          return {
            slug: "",
            name: "",
            initials: "?",
            tint: "plum" as AvatarTint,
            anonymous: true,
          };
        }
        return {
          slug: v.slug,
          name: `${v.firstName} ${v.lastName}`,
          initials: initialsOf(v.firstName, v.lastName),
          tint: tintForSlug(v.slug),
          avatarUrl: v.avatarUrl ?? undefined,
        };
      });
    },
  });
}
