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
import type { CropRect } from "../../shared/components/ui/cropGeometry";

/** The editable subset of the logged-in member's profile. */
export interface ProfileDraft {
  photo?: string;
  /** Saved reframe crop for `photo` — display-only (never sent in the PATCH
   *  body; the backend persists a fresh crop separately, keyed by the upload's
   *  storage key, when the member picks a new photo). */
  avatarCrop?: CropRect;
  first: string;
  last: string;
  role: string;
  pronouns: string;
  /** Phonetic spelling of the member's name, read aloud via SpeechSynthesis
   *  on the profile hero. Ungated, same as `pronouns`. */
  pronunciation?: string;
  hood: string;
  bio: string;
  /** Portuguese translation of `bio`, shown via the EN/PT bio language toggle. */
  bioPt?: string;
  /** Free-text "what I'm in the middle of" status, shown in the profile's Now card. */
  now: string;
  /** What the member is explicitly not here for, shown alongside `now` as a
   *  boundary note. Free text, member-authored. */
  notHereFor?: string;
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
  /** Whether the member has opted in to being featured on the admin-curated
   *  homepage. Only meaningful when `visibility` is `"open"`. */
  featuredConsent: boolean;
  /** Ordered slugs of the communities the member has chosen to feature on
   *  their profile — editable via the featured-communities picker. */
  featuredCommunities: string[];
  /** Broad professional field(s) — the profile editor's work picker, mirrored
   *  in onboarding and Settings → Interests. Public: the member directory's
   *  "What they do" filter searches these. */
  discipline: string[];
  /** Specific job(s) within `discipline`, from the same picker. Public: the
   *  directory's "Profession" filter searches these. */
  profession: string[];
  languages: string[];
  /** Whether other members can see this member's real avatar photo. Owner-
   *  controlled; see `Member.photoVisible`. */
  photoVisible?: boolean;
  /** Whether other members can see this member's neighbourhood/location.
   *  Owner-controlled; see `Member.hoodVisible`. */
  hoodVisible?: boolean;
  /** Whether other members can see this member's vouchers list. Owner-
   *  controlled; see `Member.vouchersVisible`. */
  vouchersVisible?: boolean;
  /** ISO 8601 timestamp until which the member has self-hidden their profile,
   *  or `null` when not hidden. See `Member.hiddenUntil`. Sent on save via
   *  `draftToUpdateDto` and committed straight from `draft` in `save()`'s
   *  success handler (see `ProfileProvider.tsx`), so the in-session round
   *  trip works — but no backend read response (`ProfileDTO`/`MemberCardDTO`)
   *  carries it back yet, so a fresh page load / profile refetch still can't
   *  reflect it until that read-side wiring lands. */
  hiddenUntil?: string | null;
}

export function toDraft(m: Member): ProfileDraft {
  return {
    photo: m.photo,
    avatarCrop: m.avatarCrop,
    first: m.first,
    last: m.last,
    role: m.role,
    pronouns: m.pronouns ?? "",
    // The backend column is nullable and comes through as `null`, not
    // `undefined`, for a member who never set it — coalesce the same way
    // `pronouns` does above so a save never round-trips `null` into a PATCH
    // payload typed `string`. See ProfilesService.updateMe.
    pronunciation: m.pronunciation ?? "",
    hood: m.hood,
    bio: m.bio,
    bioPt: m.bioPt ?? "",
    now: m.now,
    notHereFor: m.notHereFor ?? "",
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
    featuredConsent: m.featuredConsent ?? false,
    featuredCommunities: (m.featuredCommunities ?? []).map((ref) => ref.slug),
    discipline: [...(m.discipline ?? [])],
    profession: [...(m.profession ?? [])],
    languages: [...(m.languages ?? [])],
    photoVisible: m.photoVisible,
    hoodVisible: m.hoodVisible,
    vouchersVisible: m.vouchersVisible,
    hiddenUntil: m.hiddenUntil,
  };
}

/** Whether the working draft differs from the committed profile. Compares the
 *  draft against the committed profile's own draft-projection, so the check
 *  covers exactly the editable fields and nothing else (a re-derived `toDraft`
 *  is deterministic, so equal content compares equal). */
export function isDraftDirty(draft: ProfileDraft, committed: Member): boolean {
  return JSON.stringify(draft) !== JSON.stringify(toDraft(committed));
}

/** Which section of `ProfilePage`'s edit form a given `ProfileDraft` field
 *  belongs to — drives `getChangedSectionLabelKeys`' itemized "what changed"
 *  summary in `ProfileEditBar`. Only fields with an editor reachable from
 *  that page's own edit session are listed: fields edited elsewhere (Settings
 *  → Interests' `identities`/`languages`, the "Who sees what"
 *  sheet's `photoVisible`/`hoodVisible`/`vouchersVisible`/
 *  `privateNetwork`, the rail's instant-save `hiddenUntil`, and the featured-
 *  communities picker's `featuredConsent`/`featuredCommunities`) can't change
 *  while this session is open, so giving them a section here would never
 *  surface one. `discipline`/`profession` ARE listed: their picker now lives
 *  in this page's own editor, alongside its copy in Settings → Interests. */
const FIELD_CHANGE_SECTION: Partial<Record<keyof ProfileDraft, string>> = {
  photo: "photo",
  avatarCrop: "photo",
  visibility: "visibility",
  first: "name",
  last: "name",
  role: "shortBio",
  pronouns: "pronouns",
  hood: "neighbourhood",
  pronunciation: "pronunciation",
  bio: "bio",
  bioPt: "bioPt",
  now: "now",
  openTo: "openTo",
  notHereFor: "notHereFor",
  // "workField" is the field-of-work/profession picker, distinct from the
  // `work` section below (the member's selected-work portfolio items).
  discipline: "workField",
  profession: "workField",
  tags: "tags",
  socials: "links",
  lookingFor: "lookingFor",
  lookingForPublic: "lookingFor",
  work: "work",
  skills: "skills",
  board: "board",
  groups: "groups",
  shapings: "shapings",
};

/** i18n key for each section id above, in the order the corresponding field
 *  appears on the profile-edit form (top to bottom) — `getChangedSectionLabelKeys`
 *  preserves this order so the save-bar summary reads top-down. */
const SECTION_ORDER: { id: string; labelKey: string }[] = [
  { id: "photo", labelKey: "members:profileEdit.field.photo" },
  { id: "visibility", labelKey: "members:profileEdit.field.statusVisibility" },
  { id: "name", labelKey: "members:profileEdit.field.name" },
  { id: "shortBio", labelKey: "members:profileEdit.shortBio.label" },
  { id: "pronouns", labelKey: "members:profileEdit.field.pronouns" },
  { id: "neighbourhood", labelKey: "members:profileEdit.field.neighbourhood" },
  { id: "pronunciation", labelKey: "members:profileEdit.pronunciation.label" },
  { id: "bio", labelKey: "members:profileEdit.field.bio" },
  { id: "bioPt", labelKey: "members:profileEdit.bioPt.label" },
  { id: "now", labelKey: "members:profileEdit.now.label" },
  { id: "openTo", labelKey: "members:profileEdit.openTo.label" },
  { id: "notHereFor", labelKey: "members:profileEdit.notHereFor.label" },
  { id: "workField", labelKey: "members:profileEdit.work.label" },
  { id: "tags", labelKey: "members:profileEdit.field.tags" },
  { id: "links", labelKey: "members:profileEdit.field.links" },
  { id: "lookingFor", labelKey: "members:profileEdit.field.lookingFor" },
  { id: "work", labelKey: "members:content.work.title" },
  { id: "skills", labelKey: "members:content.skills.title" },
  { id: "board", labelKey: "members:content.board.title" },
  { id: "groups", labelKey: "members:content.groups.title" },
  { id: "shapings", labelKey: "members:content.shapings.title" },
];

/** i18n keys for the sections that changed between `draft` and the committed
 *  profile, in form order, deduped (editing both `first` and `last` yields a
 *  single "Name" entry). Empty when nothing tracked by `FIELD_CHANGE_SECTION`
 *  changed — `ProfileEditBar` falls back to its generic unsaved-changes copy
 *  in that case. */
export function getChangedSectionLabelKeys(
  draft: ProfileDraft,
  committed: Member,
): string[] {
  const committedDraft = toDraft(committed);
  const changed = new Set<string>();
  (
    Object.entries(FIELD_CHANGE_SECTION) as [keyof ProfileDraft, string][]
  ).forEach(([key, section]) => {
    if (JSON.stringify(draft[key]) !== JSON.stringify(committedDraft[key])) {
      changed.add(section);
    }
  });
  return SECTION_ORDER.filter((s) => changed.has(s.id)).map((s) => s.labelKey);
}

/** Map the editable draft to the backend's PATCH /profiles/me payload.
 *
 *  `avatarUrl` is only sent when `d.photo` actually changed from the committed
 *  value (`committedPhoto`). On load `d.photo` is the backend-RESOLVED display
 *  URL (`toImageUrl` turned the stored storage key into `<api>/files/<key>`),
 *  NOT the raw key — re-sending an untouched one would persist that derived URL
 *  over the clean key, and since a dev API base is `http://…` the next read
 *  fails `toImageUrl`'s `https://`-only check and blanks the avatar. So an
 *  unchanged photo is omitted (PATCH leaves the stored key intact); a fresh
 *  upload sets `d.photo` to a new storage key (sent), and a removal sets it to
 *  `undefined`/`""` (sent as `null` to clear). Mirrors the persona meta-editor
 *  fix in `useSubprofileMetaEditor.ts`. */
export function draftToUpdateDto(
  d: ProfileDraft,
  committedPhoto?: string,
): UpdateProfileDTO {
  const photoChanged = (d.photo ?? "") !== (committedPhoto ?? "");
  return {
    firstName: d.first.trim(),
    lastName: d.last.trim(),
    pronouns: d.pronouns.trim(),
    tagline: d.role.trim(),
    bio: d.bio.trim(),
    pronunciation: d.pronunciation,
    bioPt: d.bioPt,
    notHereFor: d.notHereFor,
    location: d.hood.trim(),
    ...(photoChanged ? { avatarUrl: d.photo || null } : {}),
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
    featuredConsent: d.featuredConsent,
    featuredCommunities: d.featuredCommunities,
    discipline: d.discipline,
    profession: d.profession,
    languages: d.languages,
    // Instant-save visibility switches (Task 11's "Who sees what" sheet) —
    // sent unconditionally like `lookingForPublic` above, not diffed against
    // `committedPhoto`-style change detection, since they're plain optional
    // booleans with no derived-URL trap to avoid.
    photoVisible: d.photoVisible,
    hoodVisible: d.hoodVisible,
    vouchersVisible: d.vouchersVisible,
    hiddenUntil: d.hiddenUntil,
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
