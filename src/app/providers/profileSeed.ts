import { currentUser } from "../../features/members/data/demoCurrentUser";
import type { Member } from "../../features/members/data/members";
import type { AuthUser } from "../../features/auth/api/auth.api";
import type { ProfileDTO } from "../../features/members/api/members.api";
import type { ProfileDraft } from "./useProfile";

/**
 * The signed-in member's profile is the authenticated identity fields (real
 * name, pronouns, photo, slug) layered over a `base` member. In live mode that
 * base is the member's own full profile from the backend; in demo mode it is
 * the mock `currentUser`.
 *
 * Identity fields win where present so the hero stays consistent with the
 * session even before the profile fetch resolves.
 */
export function profileFromAuth(user: AuthUser | null, base: Member): Member {
  if (!user) return base;
  const p = user.profile;
  const first = p.firstName?.trim() || base.first;
  const last = p.lastName?.trim() || base.last;
  const initials =
    ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || base.initials;
  return {
    ...base,
    slug: p.slug || base.slug,
    first,
    last,
    pronouns: p.pronouns?.trim() || base.pronouns,
    photo: p.avatarUrl ?? base.photo,
    avatarCrop: p.avatarCrop ?? base.avatarCrop,
    initials,
  };
}

/**
 * The live-mode base to use while the member's own profile is still loading, or
 * after it has failed.
 *
 * It must NOT be the demo persona. `currentUser` carries a written bio, a
 * neighbourhood, identities, a "looking for" list and a work history; using it
 * as the base meant every consumer of `useProfileData().profile` rendered
 * another person's life as the real member's own during the loading window, and
 * for the entire session whenever `/profiles/:slug` failed. Opening the editor
 * in that window copied those fields into the draft, and a save would have
 * written them to the backend as the member's own.
 *
 * So: identity from `/auth/me`, everything else empty. `isProfileLoading` /
 * `isProfileError` tell consumers to skeleton rather than to read this.
 */
export function emptyLiveProfileBase(user: AuthUser | null): Member {
  const p = user?.profile;
  const first = p?.firstName?.trim() ?? "";
  const last = p?.lastName?.trim() ?? "";
  return {
    id: 0,
    slug: p?.slug ?? "",
    first,
    last,
    role: "",
    pronouns: p?.pronouns?.trim() || undefined,
    hood: "",
    tags: [],
    // The most private setting, so a half-loaded profile can never imply more
    // exposure than the member actually chose.
    visibility: "private",
    initials: ((first[0] ?? "") + (last[0] ?? "")).toUpperCase(),
    tint: "default",
    photo: p?.avatarUrl ?? undefined,
    avatarCrop: p?.avatarCrop ?? undefined,
    verified: false,
    since: "",
    bio: "",
    now: "",
    openTo: [],
    work: [],
    socials: [],
    board: [],
    vouchers: [],
    voucherNames: "",
    related: [],
    shapings: {},
    skills: [],
    groups: [],
    activity: [],
  };
}

/**
 * Which member the signed-in profile is layered over: the fetched own-profile
 * in live mode, the mock persona in demo mode, and the empty shell above while
 * live is still loading or has errored.
 */
export function resolveProfileBase(
  demoMode: boolean,
  ownProfileMember: Member | undefined,
  user: AuthUser | null,
): Member {
  if (demoMode) return currentUser;
  return ownProfileMember ?? emptyLiveProfileBase(user);
}

/**
 * Fold a just-saved draft (and the PATCH response) onto the committed profile.
 * Pure, so the save flow in `useProfileDraftState` stays readable.
 */
export function mergeSavedProfile(
  prev: Member,
  draft: ProfileDraft,
  savedProfile: ProfileDTO | undefined,
): Member {
  return {
    ...prev,
    // `draft.photo` is a storage KEY (unfetchable by the browser), not a URL —
    // rendering it directly would show a broken image once the local upload
    // preview is gone. The PATCH response's `avatarUrl` is already a fetchable
    // `${API_URL}/files/<key>` URL (or `null` after a removal), mirroring how
    // `profileFromAuth` seeds `photo`. In demo mode the persist call is a no-op
    // and `savedProfile` stays undefined, so this falls back to `draft.photo`,
    // which there holds a locally fetchable object URL (see `useUploadImage`).
    photo: savedProfile?.avatarUrl ?? draft.photo,
    // PATCH /profiles/me never carries `avatarCrop` back (only `/auth/me`
    // does), so this always falls through to the editor's draft value.
    avatarCrop: draft.avatarCrop,
    first: draft.first.trim() || prev.first,
    last: draft.last.trim() || prev.last,
    role: draft.role.trim(),
    pronouns: draft.pronouns.trim() || undefined,
    hood: draft.hood.trim() || prev.hood,
    bio: draft.bio.trim() || prev.bio,
    now: draft.now.trim(),
    openTo: draft.openTo,
    tags: draft.tags,
    visibility: draft.visibility,
    socials: draft.socials.filter((s) => s.urlOrHandle.trim()),
    work: draft.work,
    skills: draft.skills,
    board: draft.board,
    groups: draft.groups,
    shapings: draft.shapings,
    identities: draft.identities,
    lookingFor: draft.lookingFor,
    lookingForPublic: draft.lookingForPublic,
    // Instant-save visibility switches — committed here too, not left in
    // `draft`, so a consumer reading the committed `profile` (the hero's own
    // avatar/hood rendering) reflects a toggle immediately rather than waiting
    // on the next full profile refetch.
    photoVisible: draft.photoVisible,
    hoodVisible: draft.hoodVisible,
    vouchersVisible: draft.vouchersVisible,
    // The rail's 24h-hide toggle, same reasoning: the backend response does not
    // carry `hiddenUntil` back either, and `ProfileSettingsMenu` reads it off
    // the COMMITTED profile, so without this the menu label would never flip.
    hiddenUntil: draft.hiddenUntil,
    privateNetwork: draft.privateNetwork,
    featuredConsent: draft.featuredConsent,
    // Self display always reads live from `draft.featuredCommunities`, so no ref
    // rebuild is needed here. Keeping the prior resolved refs stops this field
    // flashing empty; live mode's next profile refetch brings the real ones.
    featuredCommunities: prev.featuredCommunities,
  };
}
