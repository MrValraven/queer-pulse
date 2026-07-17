import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { ACTIVE_SESSIONS, type Session } from "../sessions.data";
import { getSessions } from "./account.api";
import { sessionResponseToSession } from "./sessions.adapters";

/** `language` is joined in — the adapted `signedIn` string is locale-dependent
 * (`fmt.relativeTime`), so a language switch must invalidate the cached
 * result rather than keep showing the previous language's phrasing. */
export function sessionsQueryKey(language: string) {
  return ["account", "sessions", language] as const;
}

export interface SessionsResult {
  sessions: Session[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
  /** True when the live fetch failed — the page says so instead of showing nothing. */
  failed: boolean;
  /** Re-fetch after a revoke, so the list reflects the server, not our guess. */
  refetch: () => void;
}

/** Stable empty array so the "no data yet" case doesn't churn identity every render. */
const EMPTY_SESSIONS: Session[] = [];

/**
 * Data source for `SessionsPage`.
 *
 * Demo mode returns the page's own `ACTIVE_SESSIONS` mock unchanged, so the
 * standalone prototype still tells its story. Live mode calls
 * `GET /account/sessions` — the endpoint has existed on the backend since the
 * account module landed and, until now, nothing in the frontend called it, so
 * this security page was showing five fabricated devices while its "Sign out"
 * button revoked mock ids the server had never heard of.
 *
 * The list is small and unpaginated by design (one row per live refresh token),
 * so a single fetch covers it.
 */
export function useSessions(): SessionsResult {
  const { demoMode } = useDemoMode();
  const { language, t } = useTranslation();
  const fmt = useFormat();

  const query = useQuery<Session[]>({
    queryKey: sessionsQueryKey(language),
    enabled: !demoMode,
    queryFn: async () => {
      const rows = await getSessions();
      return rows.map((row) => sessionResponseToSession(row, t, fmt));
    },
  });

  if (demoMode) {
    return {
      sessions: ACTIVE_SESSIONS,
      loading: false,
      failed: false,
      refetch: () => {},
    };
  }
  return {
    sessions: query.data ?? EMPTY_SESSIONS,
    loading: query.isPending,
    failed: query.isError,
    refetch: () => void query.refetch(),
  };
}
