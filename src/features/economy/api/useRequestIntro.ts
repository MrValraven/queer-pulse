import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  requestIntro,
  type IntroRequestBody,
} from "./landlord.api";

/** POST /landlords/:slug/intro-requests. Demo fakes a short "sending…" beat
 * with no network; live sends the request through. */
export function useRequestIntro(slug: string) {
  const { demoMode } = useDemoMode();
  return useMutation<{ id: string; status: string } | null, Error, IntroRequestBody>({
    // ContactRequestModal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        return null;
      }
      return requestIntro(slug, body);
    },
  });
}
