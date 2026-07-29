import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ProfileThemeContext,
  DEFAULT_PROFILE_THEME,
  type ProfileThemeSettings,
} from "./useProfileTheme";

const STORAGE_KEY = "qp.profileTheme.v1";

function readInitial(): ProfileThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE_THEME;
    const parsed = JSON.parse(raw) as Partial<ProfileThemeSettings>;
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

  // Read render-scope state directly rather than nesting one setter inside the
  // other's updater — an updater must be pure, and StrictMode double-invokes it.
  const commit = useCallback(() => setTheme(draft), [draft]);

  const discard = useCallback(() => setDraft(theme), [theme]);

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
