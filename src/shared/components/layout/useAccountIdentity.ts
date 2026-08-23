import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { currentUser, fullName } from "../../../features/members/data/members";
import { initialsFromName } from "../../lib/initials";

export interface AccountIdentity {
  name: string;
  firstName: string;
  photo?: string;
  initials: string;
  /** The signed-in member's own pronouns, when they have set any. */
  pronouns?: string;
}

/** Resolves the signed-in user's identity for account UI (menu, sheet).
 * Prefer the live/demo signed-in user. The mock persona ("Tiago") is a DEMO
 * fixture — only fall back to it in demo mode, never in live, where a
 * missing profile falls back to the account email instead so the demo
 * identity can't leak into a real session. */
export function useAccountIdentity(): AccountIdentity {
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const profile = user?.profile;
  const profileName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : undefined;
  const name =
    profileName ?? (demoMode ? fullName(currentUser) : (user?.email ?? ""));
  const photo =
    profile?.avatarUrl ?? (demoMode ? currentUser.photo : undefined);
  const initials = profile
    ? initialsFromName(name)
    : demoMode
      ? currentUser.initials
      : initialsFromName(name);
  // Same demo-safe rule as the photo above: the mock persona's pronouns are a
  // demo fixture and must never stand in for a real signed-in member's.
  const pronouns =
    profile?.pronouns ?? (demoMode ? currentUser.pronouns : undefined);
  return {
    name,
    firstName: name.split(" ")[0] ?? "",
    photo,
    initials,
    pronouns,
  };
}
