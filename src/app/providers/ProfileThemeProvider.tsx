import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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

interface ProfileThemeContextValue {
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

const ProfileThemeContext = createContext<ProfileThemeContextValue | null>(
  null,
);
const STORAGE_KEY = "qp.profileTheme.v1";

function readInitial(): ProfileThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE_THEME;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE_THEME, ...parsed };
  } catch {
    return DEFAULT_PROFILE_THEME;
  }
}

/**
 * Remembers the logged-in member's profile-theme choices (pride flag, cover
 * style, pattern, badge/level visibility). Persists to localStorage so the
 * pick survives reloads — the Settings picker reads/writes the `draft`, and the
 * "Save changes" bar commits it. Data is still mock; this only tracks the choice.
 */
export function ProfileThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ProfileThemeSettings>(readInitial);
  const [draft, setDraft] = useState<ProfileThemeSettings>(theme);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [theme]);

  const updateDraft = useCallback((patch: Partial<ProfileThemeSettings>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const commit = useCallback(() => {
    setDraft((current) => {
      setTheme(current);
      return current;
    });
  }, []);

  const discard = useCallback(() => {
    setTheme((current) => {
      setDraft(current);
      return current;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, draft, updateDraft, commit, discard }),
    [theme, draft, updateDraft, commit, discard],
  );

  return (
    <ProfileThemeContext.Provider value={value}>
      {children}
    </ProfileThemeContext.Provider>
  );
}

export function useProfileTheme(): ProfileThemeContextValue {
  const ctx = useContext(ProfileThemeContext);
  if (!ctx)
    throw new Error(
      "useProfileTheme must be used within a ProfileThemeProvider",
    );
  return ctx;
}
