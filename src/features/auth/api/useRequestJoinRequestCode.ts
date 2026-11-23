import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { Language } from "../../../shared/i18n/types";
import type { EmailCodeChallenge } from "./emailCode.api";
import { requestJoinRequestCode } from "./joinRequest.api";

interface RequestJoinRequestCodeVariables {
  email: string;
  locale: Language;
}

/**
 * Email the applicant the 6-digit code that confirms the address on their
 * join request (SEC-10). The request-invite form words its own failures, so
 * the global error toast stays silent. Demo mode answers from
 * `emailCode.data.ts`, loaded on demand so the fixtures stay out of the live
 * bundle.
 */
export function useRequestJoinRequestCode(): UseMutationResult<
  EmailCodeChallenge,
  Error,
  RequestJoinRequestCodeVariables
> {
  const { demoMode } = useDemoMode();
  return useMutation<
    EmailCodeChallenge,
    Error,
    RequestJoinRequestCodeVariables
  >({
    meta: { silentError: true },
    mutationFn: async ({ email, locale }) => {
      if (demoMode) {
        const demo = await import("../emailCode.data");
        await demo.demoLatency();
        return demo.demoEmailCodeChallenge();
      }
      return requestJoinRequestCode(email, locale);
    },
  });
}
