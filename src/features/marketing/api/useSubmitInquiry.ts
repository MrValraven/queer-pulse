import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createInquiry,
  type CreateInquiryDto,
  type InquiryAckDTO,
} from "./inquiries.api";

/**
 * POST /inquiries — the public Contact and For-Organisations forms. Any visitor
 * may submit (the endpoint is `@Public()` and rate-limited server-side); the
 * message lands as `new` for ops to triage.
 *
 * Demo mode keeps a short "sending…" beat and resolves with no network, so the
 * prototype's success state shows exactly as before. Live mode calls the API.
 * Errors are surfaced by the caller (both forms handle their own success/error
 * copy), so this hook stays silent.
 */
export function useSubmitInquiry() {
  const { demoMode } = useDemoMode();
  return useMutation<InquiryAckDTO | null, Error, CreateInquiryDto>({
    mutationFn: async (dto) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        return null;
      }
      return createInquiry(dto);
    },
    meta: { silentError: true },
  });
}
