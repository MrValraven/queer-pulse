import type { AffirmingPledgeStatusDTO } from "./api/affirmingPledge.api";
import { AFFIRMING_PLEDGE_VERSION } from "./api/affirmingPledge.api";

/**
 * Demo-mode pledge standing. The demo persona is treated as already having
 * accepted the LGBTQ+ affirming pledge, so every gated housing action flows
 * without a network call and the pledge modal never blocks the prototype.
 * Never used in live mode (which reads `GET /housing/affirming-pledge`).
 */
export const DEMO_AFFIRMING_PLEDGE_STATUS: AffirmingPledgeStatusDTO = {
  accepted: true,
  acceptedAt: "2026-01-01T00:00:00.000Z",
  version: AFFIRMING_PLEDGE_VERSION,
};
