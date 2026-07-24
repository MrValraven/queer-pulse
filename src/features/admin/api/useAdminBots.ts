import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ProfileDTO } from "../../members/api/members.api";
import { DEMO_BOTS, DEMO_BOT_PROFILES } from "../adminBots.data";
import {
  getAdminBots,
  getBotProfile,
  type AdminBotSummaryDTO,
} from "./adminBots.api";

/** The list of system accounts. Demo → the local fixture; live → GET /admin/bots. */
export function useAdminBots() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminBotSummaryDTO[]>({
    queryKey: ["admin", "bots", demoMode],
    queryFn: () => (demoMode ? Promise.resolve(DEMO_BOTS) : getAdminBots()),
  });
}

/** Full current values for one bot, to seed the editor. Disabled until a slug
 *  is selected. Demo → the local fixture; live → GET /profiles/:slug. */
export function useAdminBotProfile(slug: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<ProfileDTO>({
    queryKey: ["admin", "bot", slug, demoMode],
    enabled: slug !== null,
    queryFn: () => {
      if (!demoMode) return getBotProfile(slug!);
      const demoProfile = DEMO_BOT_PROFILES[slug!];
      if (!demoProfile) {
        throw new Error(`No demo bot profile for slug "${slug}"`);
      }
      return Promise.resolve(demoProfile);
    },
  });
}
