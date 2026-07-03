import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getRecognition } from "./recognition.api";
import { recognitionToModel, type Recognition } from "./recognition.adapters";
import { demoRecognition } from "../recognition.demo";

/**
 * A member's Recognition (level, badges, perks). Demo returns the mock model;
 * live calls GET /me/recognition (own) or /profiles/:slug/recognition (other).
 * Always returns a full model — the mock stands in while live data loads — so
 * consumers never need a loading guard. React Query dedupes the fetch, so the
 * many components that call this share one request.
 */
export function useRecognition(slug?: string): Recognition {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const target = slug ?? user?.profile.slug;
  const { data } = useQuery<Recognition>({
    queryKey: ["recognition", demoMode, target ?? "me"],
    queryFn: async () => {
      if (demoMode) return demoRecognition;
      return recognitionToModel(await getRecognition(target));
    },
  });
  return data ?? demoRecognition;
}
