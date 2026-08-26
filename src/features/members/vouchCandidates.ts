import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { initialsOf, tintForSlug } from "./api/members.adapters";
import { memberProfiles } from "./data/memberProfiles";
import type { MemberCard } from "./memberDirectoryFilter.data";

/** One row in the `/vouch` member picker, resolved for display. */
export interface VouchCandidate {
  slug: string;
  firstName: string;
  /** Full name, for the row's link text and the avatar's alt. */
  name: string;
  initials: string;
  tint: AvatarTint;
  avatarUrl?: string;
  /** The quiet line under the name: pronouns, in practice. */
  meta: string;
}

/** Diacritic-insensitive lowercase, so "Ines" matches "Inês". */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Directory cards turned into pickable vouch candidates.
 *
 * Two things happen here that the directory itself does not need:
 *
 *  - The viewer is removed. `POST /members/:slug/vouch` rejects vouching for
 *    yourself, so offering the button would be offering a guaranteed error.
 *  - The name filter is applied in the browser. `useMembers` branches on
 *    `demoMode` and its demo branch returns the whole mock registry regardless
 *    of the query, so demo mode needs the filter here. Live mode has already
 *    filtered server-side; re-applying it over one page is harmless and keeps
 *    both modes typing-responsive.
 *
 * Identity resolution is the standard dual-mode split: a live card carries its
 * own `firstName`/`lastName`/`avatarUrl`, and only DEMO mode falls back to the
 * mock registry. A live card missing a name is dropped rather than rendered
 * with a mock persona's.
 */
export function resolveVouchCandidates(
  cards: MemberCard[],
  query: string,
  viewerSlug: string | undefined,
  demoMode: boolean,
): VouchCandidate[] {
  const needle = fold(query.trim());
  return cards.flatMap((card) => {
    if (viewerSlug && card.slug === viewerSlug) return [];
    const registryMember = demoMode ? memberProfiles[card.slug] : undefined;
    const firstName = card.firstName ?? registryMember?.first;
    const lastName = card.lastName ?? registryMember?.last;
    if (!firstName) return [];
    const name = lastName ? `${firstName} ${lastName}` : firstName;
    if (needle && !fold(name).includes(needle)) return [];
    return [
      {
        slug: card.slug,
        firstName,
        name,
        initials:
          registryMember?.initials ?? initialsOf(firstName, lastName ?? ""),
        tint: registryMember?.tint ?? tintForSlug(card.slug),
        avatarUrl: card.avatarUrl ?? registryMember?.photo ?? undefined,
        meta: card.meta,
      },
    ];
  });
}
