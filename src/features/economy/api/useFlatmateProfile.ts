import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { PROFILES, type Profile } from "../flatmates.data";
import { getFlatmateProfile } from "./flatmateProfile.api";
import { flatmateDtoToProfile } from "./flatmateProfile.adapters";

/** A single flatmate profile by its profileSlug. */
export function useFlatmateProfile(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<Profile | null>({
    queryKey: ["flatmate-profile", demoMode, slug],
    initialData:
      demoMode && slug
        ? (PROFILES.find((p) => p.profileSlug === slug) ?? null)
        : undefined,
    queryFn: async () => {
      if (!slug) return null;
      if (demoMode) return PROFILES.find((p) => p.profileSlug === slug) ?? null;
      return flatmateDtoToProfile(await getFlatmateProfile(slug), 0);
    },
  });
}
