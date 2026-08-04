import { createContext, useContext } from "react";
import type { VisibilityMode } from "../../shared/components/ui/VisibilityBadge";
import type {
  BoardItem,
  GroupItem,
  Member,
  SkillItem,
  SocialLink,
  WorkItem,
} from "../../features/members/data/members";
import type { OpenToEntry } from "../../features/members/openTo.data";
import type { UpdateProfileDTO } from "../../features/members/api/members.api";

/** The editable subset of the logged-in member's profile. */
export interface ProfileDraft {
  photo?: string;
  first: string;
  last: string;
  role: string;
  pronouns: string;
  hood: string;
  bio: string;
  /** Free-text "what I'm in the middle of" status, shown in the profile's Now card. */
  now: string;
  /** What the member is open to — the chips under the Now status. */
  openTo: OpenToEntry[];
  tags: string[];
  visibility: VisibilityMode;
  /** Social / web links — persisted on save via PUT /profiles/me/socials. */
  socials: SocialLink[];
  /** Selected work — persisted on save via PUT /profiles/me/work. */
  work: WorkItem[];
  /** Skills offered — persisted on save via PUT /profiles/me/skills. */
  skills: SkillItem[];
  /** Barter-board posts — persisted on save via PUT /profiles/me/board. */
  board: BoardItem[];
  /** Groups / circles the member belongs to — persisted via PUT /profiles/me/groups. */
  groups: GroupItem[];
  /** Formative films/books/songs/moments — persisted via PUT /profiles/me/shapings. */
  shapings: Member["shapings"];
  /** Private Settings → Interests preferences — not shown on the profile. */
  identities: string[];
  lookingFor: string[];
  /** Whether `lookingFor` is shown on the profile to other viewers. */
  lookingForPublic: boolean;
  /** Whether the member's trust network (vouchers/vouched-for) is hidden
   *  from other members. Admins can still see it for safety. */
  privateNetwork: boolean;
  /** Ordered slugs of the communities the member has chosen to feature on
   *  their profile — editable via the featured-communities picker. */
  featuredCommunities: string[];
}

export function toDraft(m: Member): ProfileDraft {
  return {
    photo: m.photo,
    first: m.first,
    last: m.last,
    role: m.role,
    pronouns: m.pronouns ?? "",
    hood: m.hood,
    bio: m.bio,
    now: m.now,
    openTo: m.openTo.map((entry) => ({ ...entry })),
    tags: [...m.tags],
    visibility: m.visibility,
    socials: (m.socials ?? []).map((s) => ({ ...s })),
    work: m.work.map((w) => ({ ...w })),
    skills: m.skills.map((s) => ({ ...s })),
    board: m.board.map((post) => ({ ...post })),
    groups: m.groups.map((group) => ({ ...group })),
    // Object.fromEntries widens keys to `string`, losing the specific shaping
    // kinds — the assertion restores Member["shapings"]. ESLint reports it as
    // redundant (version skew); tsc needs it.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    shapings: Object.fromEntries(
      Object.entries(m.shapings).map(([kind, item]) => [kind, { ...item }]),
    ) as Member["shapings"],
    identities: [...(m.identities ?? [])],
    lookingFor: [...(m.lookingFor ?? [])],
    lookingForPublic: m.lookingForPublic ?? false,
    privateNetwork: m.privateNetwork ?? false,
    featuredCommunities: (m.featuredCommunities ?? []).map((ref) => ref.slug),
  };
}

/** Whether the working draft differs from the committed profile. Compares the
 *  draft against the committed profile's own draft-projection, so the check
 *  covers exactly the editable fields and nothing else (a re-derived `toDraft`
 *  is deterministic, so equal content compares equal). */
export function isDraftDirty(draft: ProfileDraft, committed: Member): boolean {
  return JSON.stringify(draft) !== JSON.stringify(toDraft(committed));
}

/** Map the editable draft to the backend's PATCH /profiles/me payload. `d.photo`
 *  is the storage key from `AvatarEditor`'s upload (or `undefined` after a
 *  removal); sending `d.photo || null` lets a removal clear the stored avatar
 *  the same way `SubprofileMetaForm` does for a subprofile's `avatarUrl`. */
export function draftToUpdateDto(d: ProfileDraft): UpdateProfileDTO {
  return {
    firstName: d.first.trim(),
    lastName: d.last.trim(),
    pronouns: d.pronouns.trim(),
    tagline: d.role.trim(),
    bio: d.bio.trim(),
    location: d.hood.trim(),
    avatarUrl: d.photo || null,
    visibility: d.visibility,
    now: d.now.trim(),
    // `OpenToEntry` is structurally the wire shape (OpenToId ⊆ string), so the
    // draft entries pass straight through — customs keep the member's words.
    openTo: d.openTo,
    tags: d.tags,
    identities: d.identities,
    lookingFor: d.lookingFor,
    lookingForPublic: d.lookingForPublic,
    privateNetwork: d.privateNetwork,
    featuredCommunities: d.featuredCommunities,
  };
}

/**
 * The stable, read-mostly half of the logged-in member's profile state — the
 * committed `profile` plus its fetch/error status. Split out from
 * `ProfileEditValue` (the fast-changing in-progress-edit state) so a
 * display-only consumer (a byline, a nav card, a "featured on profile" list)
 * re-renders only when the COMMITTED profile actually changes, never on
 * every keystroke of an unrelated in-progress edit elsewhere in the tree —
 * see `react-rendering.md`'s context-fan-out guidance, anchored at this
 * file's pre-split `ProfileContextValue`.
 */
export interface ProfileDataValue {
  /** Committed, live profile of the logged-in member — what their own hero renders. */
  profile: Member;
  /** True while the logged-in member's own profile is still being fetched in live
   *  mode (so the page can skeleton instead of flashing seed/mock content). */
  isProfileLoading: boolean;
  /** True when the own-profile fetch failed in live mode (so the page can show an
   *  error + retry instead of silently rendering mock fallback content). */
  isProfileError: boolean;
  /** Re-run the own-profile fetch after an error. */
  retryProfile: () => void;
}

/**
 * The fast-changing half: the in-progress edit session (draft, dirty/saving
 * state, mutators). Isolated in its own context so a component that drives
 * editing but never reads the committed `profile`/loading/error fields never
 * re-renders on those instead — and, more importantly, so a read-only
 * `profile` consumer (via `useProfileData()` below) never re-renders on
 * THIS half's every-keystroke `updateDraft` churn.
 */
export interface ProfileEditValue {
  isEditing: boolean;
  draft: ProfileDraft;
  /** True for a few seconds after a save, to drive the confirmation banner. */
  justSaved: boolean;
  /**
   * Increments once per successful save. A save signal for state that lives
   * OUTSIDE react-query and so can't be reached by `invalidateQueries` — see
   * `useDiscoverableIdentities`, whose server-derived `available` list is a
   * function of the `identities` this save just persisted.
   */
  savedVersion: number;
  /** True while the save request is in flight (live mode). */
  isSaving: boolean;
  /** Set when a save fails so the edit bar can surface it; cleared on retry. */
  saveError: string | null;
  /** True when the draft differs from the committed profile — drives the
   *  "unsaved changes" indicator, the navigation guard, and confirm-on-discard. */
  isDirty: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  /** Leave edit mode, confirming first when there are unsaved changes. */
  requestCancel: () => void;
  /** Persists the draft; resolves `true` on success, `false` on failure. */
  save: () => Promise<boolean>;
  updateDraft: (patch: Partial<ProfileDraft>) => void;
}

/** Full shape — every field from both halves. Kept for `useProfile()`, the
 *  pre-split combined hook every existing call site already uses; a new call
 *  site that only needs one half should prefer `useProfileData()`/
 *  `useProfileEdit()` below instead, which don't re-render on the other
 *  half's changes. */
export type ProfileContextValue = ProfileDataValue & ProfileEditValue;

export const ProfileDataContext = createContext<ProfileDataValue | null>(null);
export const ProfileEditContext = createContext<ProfileEditValue | null>(null);

/** The committed profile + its fetch status only — doesn't re-render while an
 *  in-progress edit is being typed elsewhere in the tree. Prefer this over
 *  `useProfile()` for any read-only/display consumer (the large majority —
 *  a nav avatar, a byline, a featured-communities card, a review composer
 *  reading the author's own name). */
export function useProfileData(): ProfileDataValue {
  const ctx = useContext(ProfileDataContext);
  if (!ctx) {
    throw new Error("useProfileData must be used within a ProfileProvider");
  }
  return ctx;
}

/** The in-progress edit session only (draft, dirty/saving state, mutators).
 *  Prefer this over `useProfile()` for a component that drives editing but
 *  never reads the committed `profile`/loading/error fields (the settings
 *  panes, the edit bar, the escape-to-cancel shortcut). */
export function useProfileEdit(): ProfileEditValue {
  const ctx = useContext(ProfileEditContext);
  if (!ctx) {
    throw new Error("useProfileEdit must be used within a ProfileProvider");
  }
  return ctx;
}

/**
 * Combined read — every field from both halves, in the original single-object
 * shape. Kept for backward compatibility and for consumers that genuinely
 * need both (e.g. `ProfilePage`, which shows the committed `profile`
 * alongside the edit affordances in the very same render). Subscribes to
 * BOTH contexts, so it re-renders on either half's changes — new call sites
 * that only need one half should prefer `useProfileData()`/`useProfileEdit()`
 * above.
 */
export function useProfile(): ProfileContextValue {
  return { ...useProfileData(), ...useProfileEdit() };
}
