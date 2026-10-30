import { useVouch } from "../../app/providers/useVouch";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import {
  memberProfiles,
  currentUserSlug,
  type MemberProfile,
} from "./data/memberProfiles";
import { useVouchers, type VoucherFace } from "./api/useVouchers";
import { initialsOf, tintForSlug } from "./api/members.adapters";
import type { AuthUser } from "../auth/api/auth.api";

/**
 * The viewer's own "+ you" voucher face. Demo uses the mock persona; live builds
 * it from the real authenticated user so production never renders a demo name.
 * Returns null when the identity can't be resolved (logged-out live view).
 */
function resolveSelfFace(
  demoMode: boolean,
  user: AuthUser | null,
): VoucherFace | null {
  if (demoMode) {
    const you = memberProfiles[currentUserSlug];
    if (!you) return null;
    return {
      slug: currentUserSlug,
      name: `${you.first} ${you.last}`,
      initials: you.initials,
      tint: you.tint,
      avatarUrl: you.photo,
      // The viewer's own optimistic face carries no recorded relationship.
      relationships: [],
    };
  }
  if (!user) return null;
  const { slug, firstName, lastName, avatarUrl } = user.profile;
  return {
    slug,
    name: `${firstName} ${lastName}`,
    initials: initialsOf(firstName, lastName),
    tint: tintForSlug(slug),
    avatarUrl: avatarUrl ?? undefined,
    relationships: [],
  };
}

export interface HeroVoucherFaces {
  /** The merged roster: fetched faces plus the viewer's optimistic face. */
  faces: VoucherFace[];
  /** Slug of the viewer, in demo and live. Undefined when logged out. */
  selfSlug: string | undefined;
  /** Whether the merged roster carries an optimistic face the API has not
   *  returned yet, so the member's profile tally does not count it. */
  hasOptimisticFace: boolean;
}

/**
 * The voucher faces for the hero's vouch row.
 *
 * Real faces: demo derives them from the mock registry, live fetches
 * GET /members/:slug/vouchers. In demo the fetch already resolves against the
 * mock registry; the `profile.vouchers` fallback only covers the while-loading
 * window and is DEMO-ONLY, because live must never mix mock personas into API
 * data.
 *
 * The viewer's own optimistic vouch face is the mock persona in demo and the
 * real authenticated user in live. It is deduped by the viewer's ACTUAL slug so
 * a vouch already returned by the API (e.g. the inviter's auto-vouch) isn't
 * doubled. The old code always used the mock `currentUserSlug` ("tiago"), which
 * never matched a real slug, so in production it injected a demo "Tiago Costa"
 * on top of the real one.
 */
export function useHeroVoucherFaces(
  profile: MemberProfile,
  realSelf: boolean,
): HeroVoucherFaces {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { hasVouched } = useVouch();
  const vouched = hasVouched(profile.slug);

  const { data: fetchedFaces } = useVouchers(profile.slug);
  const baseFaces: VoucherFace[] =
    fetchedFaces && fetchedFaces.length > 0
      ? fetchedFaces
      : demoMode
        ? profile.vouchers.flatMap((slug) => {
            const v = memberProfiles[slug];
            if (!v) return [];
            return [
              {
                slug,
                name: `${v.first} ${v.last}`,
                initials: v.initials,
                tint: v.tint,
                avatarUrl: v.photo,
                // No relationship data in this while-loading fallback; the
                // real fetch (above) resolves it via `useVouchers`.
                relationships: [],
              },
            ];
          })
        : [];

  const selfSlug = demoMode ? currentUserSlug : user?.profile.slug;
  const youAdded =
    vouched &&
    !realSelf &&
    selfSlug != null &&
    !baseFaces.some((face) => face.slug === selfSlug);
  const youFace = youAdded ? resolveSelfFace(demoMode, user) : null;
  return {
    faces: youFace ? [...baseFaces, youFace] : baseFaces,
    selfSlug,
    hasOptimisticFace: youFace != null,
  };
}
