import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SPACES, type HostSpace } from "../hostPage.data";
import { spaceDtoToHostSpace } from "./hostSpaces.adapters";
import { getPartnerSpaces } from "./hostSpaces.api";

const HOST_SPACES_KEY = "host-spaces";

/**
 * Partner venues for the host page's "Partner spaces" card. Demo mode returns
 * the colocated fixture and never hits the network; live mode fetches the
 * public `GET /directory/spaces` (listings flagged as partner venues) and
 * composes each card's note line via the adapter.
 *
 * `language` sits in the query key because the adapter resolves the "up to N"
 * connector through `t()`/`fmt` — a language switch must re-map the fetched
 * DTOs, not re-render stale strings (mirrors `useAdminCommunities`).
 */
export function useHostSpaces() {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<HostSpace[]>({
    queryKey: [HOST_SPACES_KEY, demoMode, language],
    initialData: demoMode ? SPACES : undefined,
    queryFn: async () => {
      if (demoMode) return SPACES;
      const spaces = await getPartnerSpaces();
      return spaces.map((space) => spaceDtoToHostSpace(space, t, fmt));
    },
  });
}
