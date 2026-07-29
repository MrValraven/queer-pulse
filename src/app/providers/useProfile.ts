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

export interface ProfileContextValue {
  /** Committed, live profile of the logged-in member — what their own hero renders. */
  profile: Member;
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
  /** True while the logged-in member's own profile is still being fetched in live
   *  mode (so the page can skeleton instead of flashing seed/mock content). */
  isProfileLoading: boolean;
  /** True when the own-profile fetch failed in live mode (so the page can show an
   *  error + retry instead of silently rendering mock fallback content). */
  isProfileError: boolean;
  /** Re-run the own-profile fetch after an error. */
  retryProfile: () => void;
  startEditing: () => void;
  cancelEditing: () => void;
  /** Leave edit mode, confirming first when there are unsaved changes. */
  requestCancel: () => void;
  /** Persists the draft; resolves `true` on success, `false` on failure. */
  save: () => Promise<boolean>;
  updateDraft: (patch: Partial<ProfileDraft>) => void;
}

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
