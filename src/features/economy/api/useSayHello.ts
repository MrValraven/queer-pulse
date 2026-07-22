import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { sayHello } from "./flatmateProfile.api";

export interface SayHelloInput {
  slug: string;
  body?: string;
}

/** POST /flatmate-profiles/:slug/hello (delivers a greeting to the member's
 * inbox). Demo fakes success (no network). */
export function useSayHello() {
  const { demoMode } = useDemoMode();
  return useMutation<{ conversationId: string } | null, Error, SayHelloInput>({
    mutationFn: async ({ slug, body }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return null;
      }
      return sayHello(slug, { body });
    },
  });
}
