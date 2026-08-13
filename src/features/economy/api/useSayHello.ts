import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { sayHello, type SayHelloResult } from "./flatmateProfile.api";

export interface SayHelloInput {
  slug: string;
  body?: string;
  /** Opt-in per-connection pronoun pre-share (Art.9). The backend only honours
   * it when the sender has consent-stored pronouns; otherwise it's a no-op. */
  sharePronouns?: boolean;
}

/** POST /flatmate-profiles/:slug/hello (delivers a greeting to the member's
 * inbox). Demo fakes success (no network) but still echoes `pronounsShared` so
 * the confirmation copy is accurate. */
export function useSayHello() {
  const { demoMode } = useDemoMode();
  return useMutation<SayHelloResult, Error, SayHelloInput>({
    // FlatmateCard / SayHelloModal toast their own error, so silence the global
    // duplicate.
    meta: { silentError: true },
    mutationFn: async ({ slug, body, sharePronouns }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          conversationId: "demo",
          pronounsShared: Boolean(sharePronouns),
        };
      }
      return sayHello(slug, { body, sharePronouns });
    },
  });
}
