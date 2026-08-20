import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiGet } from "../../../shared/api/client";

/**
 * `GET /newsletter/unsubscribe` response, mirrored from the backend's
 * `UnsubscribeResultDto` (queerpulse-backend/src/newsletter/dto/newsletter-response.dto.ts).
 * `alreadyUnsubscribed` is what lets the page tell "you're off the list" apart
 * from "you were off the list already" without a second round trip.
 */
export interface UnsubscribeResultDTO {
  status: "unsubscribed";
  alreadyUnsubscribed: boolean;
}

/** Demo fallback: no backend, no real address, so a fresh unsubscribe is the
 *  only honest outcome to fake. */
function demoUnsubscribe(): UnsubscribeResultDTO {
  return { status: "unsubscribed", alreadyUnsubscribed: false };
}

/**
 * Resolve an unsubscribe link's `token` to its outcome. Live mode calls the
 * real endpoint, whose token lookup and anti-enumeration posture mirror
 * `GET /newsletter/confirm` exactly (same opaque per-subscriber token, same
 * "invalid or expired link" 404 shape). A missing/bad token 404s and is never
 * retried, since retrying a bad token can't turn it good.
 */
export function useNewsletterUnsubscribe(token: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<UnsubscribeResultDTO>({
    queryKey: ["newsletter-unsubscribe", demoMode, token],
    enabled: Boolean(token),
    retry: false,
    queryFn: async () => {
      if (!token) throw new Error("Missing unsubscribe token");
      if (demoMode) return demoUnsubscribe();
      return apiGet<UnsubscribeResultDTO>(
        `/newsletter/unsubscribe?token=${encodeURIComponent(token)}`,
      );
    },
  });
}
