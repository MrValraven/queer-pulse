/** A single mutual connection, as `GET /profiles/:slug/mutuals` returns each
 *  entry in `members` — just enough to render a small avatar + first name. */
export interface ProfileMutualMember {
  slug: string;
  firstName: string;
  lastName: string;
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
export const DEMO_MUTUALS: Record<string, ProfileMutualsEntry> = {
  // Two named mutuals — exercises the `.two` sentence.
  "joao-ribeiro": {
    count: 2,
    members: [
      { slug: "ines", firstName: "Inês", lastName: "Tavares" },
      { slug: "rui", firstName: "Rui", lastName: "Marçal" },
    ],
  },
  // One named mutual — exercises the `.one` sentence.
  ines: {
    count: 1,
    members: [{ slug: "carla", firstName: "Carla", lastName: "Nogueira" }],
  },
  // More mutuals than the sample shows — exercises the `.many` sentence
  // ("and N more").
  rui: {
    count: 4,
    members: [
      { slug: "sofia", firstName: "Sofia", lastName: "Andrade" },
      { slug: "mariana", firstName: "Mariana", lastName: "Loução" },
    ],
  },
};
