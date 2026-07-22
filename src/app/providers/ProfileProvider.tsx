import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { VisibilityMode } from "../../shared/components/ui/VisibilityBadge";
import {
  currentUser,
  type Member,
  type SkillItem,
  type SocialLink,
  type WorkItem,
} from "../../features/members/data/members";
import type { OpenToEntry } from "../../features/members/openTo.data";
import { useAuth } from "./authContext";
import { useDemoMode } from "./DemoModeProvider";
import type { AuthUser } from "../../features/auth/api/auth.api";
import { useUpdateProfile } from "../../features/members/api/useUpdateProfile";
import { useUpdateProfileLists } from "../../features/members/api/useUpdateProfileLists";
import { useMemberProfile } from "../../features/members/api/useMemberProfile";
import type {
  ProfileDTO,
  UpdateProfileDTO,
} from "../../features/members/api/members.api";
import { useSessionBootstrapSettled } from "../../shared/api/useSessionBootstrap";

/**
 * The logged-in member's profile: the authenticated user's identity fields (real
 * name, pronouns, photo, slug) layered over a `base` member. In live mode `base`
 * is the member's own full profile fetched from the backend (bio, tags, role,
 * hood, work, …); in demo mode it's the mock `currentUser`. Auth identity fields
 * win where present so the hero stays consistent with the session even before
 * the profile fetch resolves.
 */
function profileFromAuth(
  user: AuthUser | null,
  base: Member = currentUser,
): Member {
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
    initials,
  };
}

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
  /** Private Settings → Interests preferences — not shown on the profile. */
  identities: string[];
  lookingFor: string[];
  /** Whether `lookingFor` is shown on the profile to other viewers. */
  lookingForPublic: boolean;
}

function toDraft(m: Member): ProfileDraft {
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
    identities: [...(m.identities ?? [])],
    lookingFor: [...(m.lookingFor ?? [])],
    lookingForPublic: m.lookingForPublic ?? false,
  };
}

/** Map the editable draft to the backend's PATCH /profiles/me payload. `d.photo`
 *  is the storage key from `AvatarEditor`'s upload (or `undefined` after a
 *  removal); sending `d.photo || null` lets a removal clear the stored avatar
 *  the same way `SubprofileMetaForm` does for a subprofile's `avatarUrl`. */
function draftToUpdateDto(d: ProfileDraft): UpdateProfileDTO {
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
  };
}

interface ProfileContextValue {
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
  startEditing: () => void;
  cancelEditing: () => void;
  /** Persists the draft; resolves `true` on success, `false` on failure. */
  save: () => Promise<boolean>;
  updateDraft: (patch: Partial<ProfileDraft>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const bootstrapSettled = useSessionBootstrapSettled();
  // Fetch the logged-in member's own full profile (bio, tags, role, hood, work)
  // in live mode — auth alone only carries identity fields. Disabled in demo
  // mode (the mock `currentUser` already has the rich fields), and held off
  // until the session bootstrap settles: bootstrap seeds this exact
  // `["profile", false, slug]` cache key, so waiting lets a successful
  // bootstrap warm it and skip this fetch, while a failed/inapplicable
  // bootstrap still opens the gate so this falls back to its own endpoint.
  // `useMemberProfile` itself stays untouched — it's also used to fetch OTHER
  // members' profiles app-wide, and gating it globally would needlessly delay
  // every profile page; passing `undefined` here only holds off this
  // own-profile call, since the hook already disables on a falsy slug.
  const { data: ownProfile } = useMemberProfile(
    demoMode || !bootstrapSettled ? undefined : user?.profile.slug,
  );
  const base = (!demoMode && ownProfile?.member) || currentUser;

  // The base member (mock vs fetched) and the auth identity, merged. Stable
  // across renders so the re-seed effect only fires when one actually changes.
  const seed = useMemo(() => profileFromAuth(user, base), [user, base]);

  const [profile, setProfile] = useState<Member>(seed);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(() => toDraft(seed));
  const [justSaved, setJustSaved] = useState(false);
  const [savedVersion, setSavedVersion] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSeed = useRef(seed);
  const { mutateAsync: persistProfile, isPending: isSaving } =
    useUpdateProfile();
  const { mutateAsync: persistLists } = useUpdateProfileLists();

  // The auth user resolves after mount (async /auth/me, or a later sign-in) and
  // the own-profile fetch lands later still. Re-seed whenever that merged seed
  // changes, but don't clobber unsaved local edits.
  useEffect(() => {
    if (seed === lastSeed.current) return;
    lastSeed.current = seed;
    if (isEditing) return;
    setProfile(seed);
    setDraft(toDraft(seed));
  }, [seed, isEditing]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const startEditing = useCallback(() => {
    setDraft(toDraft(profile));
    setJustSaved(false);
    setSaveError(null);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    setIsEditing(true);
  }, [profile]);

  const cancelEditing = useCallback(() => {
    setDraft(toDraft(profile));
    setIsEditing(false);
  }, [profile]);

  const updateDraft = useCallback((patch: Partial<ProfileDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    setSaveError(null);
    // Set (live mode) once the PATCH resolves; stays undefined in demo mode,
    // where `persistProfile` is a no-op and never touches the network.
    let savedProfile: ProfileDTO | undefined;
    try {
      // Persist to the backend first (no-op in demo mode); only commit the live
      // profile and show the confirmation once it actually succeeds. The core
      // fields go through PATCH /profiles/me; the editable draft lists (work,
      // socials, skills) persist via PUT /profiles/me/*; the still-untouched
      // lists (groups, shapings) re-send from the committed profile
      // (idempotent full-replace).
      savedProfile = await persistProfile(draftToUpdateDto(draft));
      await persistLists({
        work: draft.work,
        skills: draft.skills,
        groups: profile.groups,
        shapings: profile.shapings,
        socials: draft.socials,
      });
    } catch (err) {
      setSaveError(
        err instanceof Error && err.message
          ? err.message
          : "We couldn't save your profile. Please try again.",
      );
      return false;
    }
    setProfile((prev) => ({
      ...prev,
      // `draft.photo` is a storage KEY (unfetchable by the browser), not a
      // URL — rendering it directly would show a broken image once the local
      // upload preview is gone. `persistProfile` resolves the PATCH response,
      // whose `avatarUrl` the backend has already turned into a fetchable
      // `${API_URL}/files/<key>` URL (or `null` after a removal) — mirrors how
      // `profileFromAuth` above seeds `photo` from `p.avatarUrl ?? base.photo`.
      // In demo mode `persistProfile` is a no-op and `savedProfile` stays
      // undefined, so this falls back to the pre-existing `draft.photo`
      // behaviour, which in that mode already holds a locally fetchable
      // object URL (see `useUploadImage`'s demo-mode branch).
      photo: savedProfile?.avatarUrl ?? draft.photo,
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
      identities: draft.identities,
      lookingFor: draft.lookingFor,
      lookingForPublic: draft.lookingForPublic,
    }));
    setIsEditing(false);
    setJustSaved(true);
    setSavedVersion((n) => n + 1);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setJustSaved(false), 5000);
    return true;
  }, [draft, persistProfile, persistLists, profile.groups, profile.shapings]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      isEditing,
      draft,
      justSaved,
      savedVersion,
      isSaving,
      saveError,
      startEditing,
      cancelEditing,
      save,
      updateDraft,
    }),
    [
      profile,
      isEditing,
      draft,
      justSaved,
      savedVersion,
      isSaving,
      saveError,
      startEditing,
      cancelEditing,
      save,
      updateDraft,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
