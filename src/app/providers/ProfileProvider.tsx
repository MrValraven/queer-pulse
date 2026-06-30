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
import { currentUser, type Member } from "../../features/members/data/members";
import { useAuth } from "./authContext";
import { useDemoMode } from "./DemoModeProvider";
import type { AuthUser } from "../../features/auth/api/auth.api";
import { useUpdateProfile } from "../../features/members/api/useUpdateProfile";
import { useMemberProfile } from "../../features/members/api/useMemberProfile";
import type { UpdateProfileDTO } from "../../features/members/api/members.api";

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
  tags: string[];
  visibility: VisibilityMode;
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
    tags: [...m.tags],
    visibility: m.visibility,
  };
}

/** Map the editable draft to the backend's PATCH /profiles/me payload. The photo
 *  has no field on this endpoint, so it stays local-only (see UpdateProfileDTO). */
function draftToUpdateDto(d: ProfileDraft): UpdateProfileDTO {
  return {
    firstName: d.first.trim(),
    lastName: d.last.trim(),
    pronouns: d.pronouns.trim(),
    tagline: d.role.trim(),
    bio: d.bio.trim(),
    location: d.hood.trim(),
    visibility: d.visibility,
    tags: d.tags,
  };
}

interface ProfileContextValue {
  /** Committed, live profile of the logged-in member — what their own hero renders. */
  profile: Member;
  isEditing: boolean;
  draft: ProfileDraft;
  /** True for a few seconds after a save, to drive the confirmation banner. */
  justSaved: boolean;
  /** True while the save request is in flight (live mode). */
  isSaving: boolean;
  /** Set when a save fails so the edit bar can surface it; cleared on retry. */
  saveError: string | null;
  startEditing: () => void;
  cancelEditing: () => void;
  save: () => void;
  updateDraft: (patch: Partial<ProfileDraft>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  // Fetch the logged-in member's own full profile (bio, tags, role, hood, work)
  // in live mode — auth alone only carries identity fields. Disabled in demo
  // mode (the mock `currentUser` already has the rich fields).
  const { data: ownProfile } = useMemberProfile(
    demoMode ? undefined : user?.profile.slug,
  );
  const base = (!demoMode && ownProfile?.member) || currentUser;

  // The base member (mock vs fetched) and the auth identity, merged. Stable
  // across renders so the re-seed effect only fires when one actually changes.
  const seed = useMemo(() => profileFromAuth(user, base), [user, base]);

  const [profile, setProfile] = useState<Member>(seed);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(() => toDraft(seed));
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSeed = useRef(seed);
  const { mutateAsync: persistProfile, isPending: isSaving } =
    useUpdateProfile();

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
    setIsEditing(false);
  }, []);

  const updateDraft = useCallback((patch: Partial<ProfileDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const save = useCallback(async () => {
    setSaveError(null);
    try {
      // Persist to the backend first (no-op in demo mode); only commit the live
      // profile and show the confirmation once it actually succeeds.
      await persistProfile(draftToUpdateDto(draft));
    } catch (err) {
      setSaveError(
        err instanceof Error && err.message
          ? err.message
          : "We couldn't save your profile. Please try again.",
      );
      return;
    }
    setProfile((prev) => ({
      ...prev,
      photo: draft.photo,
      first: draft.first.trim() || prev.first,
      last: draft.last.trim() || prev.last,
      role: draft.role.trim(),
      pronouns: draft.pronouns.trim() || undefined,
      hood: draft.hood.trim() || prev.hood,
      bio: draft.bio.trim() || prev.bio,
      tags: draft.tags,
      visibility: draft.visibility,
    }));
    setIsEditing(false);
    setJustSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setJustSaved(false), 5000);
  }, [draft, persistProfile]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      isEditing,
      draft,
      justSaved,
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
