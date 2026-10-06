import { useEffect, useState } from "react";
import {
  isMemberMissingError,
  useMemberProfile,
} from "../../members/api/useMemberProfile";
import { fullName } from "../../members/data/members";
import type { ComposeCoAuthorOption } from "./ComposePostingAs";

// ── Who the post credits beside the author ──────────────────────────────────
// Compose state holds the co-author as a slug, because that is what the draft
// stores and what publishing sends (`coAuthorHandle`). The picker that sets it
// searches the member's connections on the server, so the person behind the
// slug is often missing from whatever the picker is showing right now. The
// byline and the preview card still need a name, so this remembers the person
// as they were when tapped. A slug that arrives without a tap (a restored
// draft) is looked up as a profile once, which reaches any connection. When
// that lookup says the member is gone or walled off, the credit is dropped,
// because publishing it would send a handle the server refuses with a 400.
// While the lookup is loading, or after it failed for another reason, the slug
// still goes out on publish, so the credit shows as `@slug` until a name
// arrives: what the member sees always matches what publishing sends.

export interface ComposeCoAuthor {
  /** The credited person, null exactly when nobody is credited. A restored
   *  slug whose profile has not resolved reads as `@slug`. */
  coAuthor: ComposeCoAuthorOption | null;
  /** Credit this person, or nobody with null. */
  changeCoAuthor: (coAuthor: ComposeCoAuthorOption | null) => void;
}

export function useComposeCoAuthor(
  coAuthorSlug: string | null,
  setCoAuthorSlug: (coAuthorSlug: string | null) => void,
): ComposeCoAuthor {
  const [pickedCoAuthor, setPickedCoAuthor] =
    useState<ComposeCoAuthorOption | null>(null);
  // A pick only counts while the slug still names it: turning anonymity on
  // clears the slug in compose state, and a restored draft can replace it.
  const isPickCurrent =
    pickedCoAuthor !== null && pickedCoAuthor.slug === coAuthorSlug;
  const restoredProfile = useMemberProfile(
    isPickCurrent ? undefined : (coAuthorSlug ?? undefined),
  );
  const restoredMember = restoredProfile.data?.member ?? null;
  const isRestoredMemberMissing =
    !isPickCurrent &&
    coAuthorSlug !== null &&
    (isMemberMissingError(restoredProfile.error) ||
      (restoredProfile.isSuccess && restoredMember === null));

  useEffect(() => {
    if (isRestoredMemberMissing) setCoAuthorSlug(null);
  }, [isRestoredMemberMissing, setCoAuthorSlug]);

  const coAuthor: ComposeCoAuthorOption | null = isPickCurrent
    ? pickedCoAuthor
    : coAuthorSlug === null
      ? null
      : restoredMember
        ? {
            // The query is keyed by this slug, so its answer is this person.
            slug: coAuthorSlug,
            name: fullName(restoredMember),
            initials: restoredMember.initials,
            ...(restoredMember.photo ? { photo: restoredMember.photo } : {}),
          }
        : slugStandIn(coAuthorSlug);

  const changeCoAuthor = (nextCoAuthor: ComposeCoAuthorOption | null) => {
    setPickedCoAuthor(nextCoAuthor);
    setCoAuthorSlug(nextCoAuthor?.slug ?? null);
  };

  return { coAuthor, changeCoAuthor };
}

/** The credit as publishing will send it, for a slug with no name yet:
 *  `joana-reis` reads as "@joana-reis" with the initials "JR". */
function slugStandIn(coAuthorSlug: string): ComposeCoAuthorOption {
  const initials = coAuthorSlug
    .split(/[-_.]+/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return { slug: coAuthorSlug, name: `@${coAuthorSlug}`, initials };
}
