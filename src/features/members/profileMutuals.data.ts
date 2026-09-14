import { memberAvatar } from "./data/members";

/** A single mutual connection, as `GET /profiles/:slug/mutuals` returns each
 *  entry in `members` — just enough to render a small avatar + first name. */
export interface ProfileMutualMember {
  slug: string;
  firstName: string;
  lastName: string;
  /** The mutual's own profile photo, already `photoVisible`-gated by the
   *  backend (`null` when they have no photo or have hidden it) — the card
   *  falls back to their initials. */
  avatarUrl?: string | null;
}

/**
 * The mutuals payload for one profile: the total mutual count plus a short,
 * name-bearing sample the row renders as avatars. `count` can exceed
 * `members.length` (the backend may cap the sample) — the row falls back to
 * "and N more" in that case.
 */
export interface ProfileMutualsEntry {
  count: number;
  members: ProfileMutualMember[];
}

/**
 * Demo fixture for `useProfileMutuals`, keyed by the SLUG OF THE PROFILE BEING
 * VISITED — the `:slug` in `GET /profiles/:slug/mutuals` — not the viewer. In
 * demo mode the viewer is always the fixed persona `tiago` (`data/members.ts`'s
 * `currentUserSlug`), so each entry here stands in for "mutual connections
 * between tiago and this member." A profile with no entry falls back to
 * `{ count: 0, members: [] }` and `ProfileMutualsCard` renders nothing — this
 * is the expected common case (most demo profiles share no mutuals with tiago).
 *
 * Slugs referenced below are real `data/members.ts` seed entries:
 * `joao-ribeiro` (João Ribeiro), `ines` (Inês Tavares), `rui` (Rui Marçal),
 * `carla` (Carla Nogueira), `sofia` (Sofia Andrade), `mariana` (Mariana Loução).
 */
/**
 * Builds one fixture entry, taking the face from the demo member registry so a
 * mutual shows the same photo here as everywhere else in demo mode (live mode
 * gets `avatarUrl` straight off the endpoint). A member with no registry photo
 * — `ines` below — resolves to `null` and renders initials, the same fallback
 * the live card takes for a member who has hidden their photo.
 */
function demoMutual(
  slug: string,
  firstName: string,
  lastName: string,
): ProfileMutualMember {
  return {
    slug,
    firstName,
    lastName,
    avatarUrl: memberAvatar(slug)?.photo ?? null,
  };
}

export const DEMO_MUTUALS: Record<string, ProfileMutualsEntry> = {
  // Two named mutuals — exercises the `.two` sentence.
  "joao-ribeiro": {
    count: 2,
    members: [
      demoMutual("ines", "Inês", "Tavares"),
      demoMutual("rui", "Rui", "Marçal"),
    ],
  },
  // One named mutual — exercises the `.one` sentence.
  ines: {
    count: 1,
    members: [demoMutual("carla", "Carla", "Nogueira")],
  },
  // More mutuals than the sample shows — exercises the `.many` sentence
  // ("and N more").
  rui: {
    count: 4,
    members: [
      demoMutual("sofia", "Sofia", "Andrade"),
      demoMutual("mariana", "Mariana", "Loução"),
    ],
  },
};
