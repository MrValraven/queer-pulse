import { createContext, useContext } from "react";
import {
  BADGE_OPTIONS,
  type CoverStyle,
  type PatternKey,
} from "../../features/settings/profileTheme.data";

/** The profile-theme choices the logged-in member can personalise. */
export interface ProfileThemeSettings {
  /** Index into FLAG_SWATCHES. */
  flag: number;
  coverStyle: CoverStyle;
  pattern: PatternKey;
  showBadges: boolean;
  showLevel: boolean;
  badge: string;
}

export const DEFAULT_PROFILE_THEME: ProfileThemeSettings = {
  flag: 0,
  coverStyle: "stripe",
  pattern: "none",
  showBadges: true,
  showLevel: true,
  // Stable id, never the translated label (see profileTheme.data.ts).
  badge: BADGE_OPTIONS[0]!.id,
};

export interface ProfileThemeContextValue {
  /** The committed theme — what the profile + directory card should render. */
  theme: ProfileThemeSettings;
  /** The in-progress edit shown in the Settings picker + live preview. */
  draft: ProfileThemeSettings;
  updateDraft: (patch: Partial<ProfileThemeSettings>) => void;
  /** Persist the draft as the committed theme. */
  commit: () => void;
  /** Throw away unsaved edits, resetting the draft to the committed theme. */
  discard: () => void;
}

export const ProfileThemeContext =
  createContext<ProfileThemeContextValue | null>(null);

export function useProfileTheme(): ProfileThemeContextValue {
  const ctx = useContext(ProfileThemeContext);
  if (!ctx)
    throw new Error(
      "useProfileTheme must be used within a ProfileThemeProvider",
    );
  return ctx;
}
