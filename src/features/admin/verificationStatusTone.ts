import type { VerificationLevel } from "../economy/api/verification.api";
import type { AdminTone } from "./ui";

/**
 * Verification level → `AdminChip` tone, low to high assurance: `none` reads
 * as inert (no signal yet), `email`/`phone` step up in warmth as more proof
 * accrues, and `id_verified` lands on the strongest confirmed tone. Values
 * are drawn from the real `AdminTone` union (`ui/AdminChip.tsx`) — used by
 * both the row chip and (later, Task F) the drawer's level chip so the two
 * surfaces always agree on what a level "looks like".
 */
export const VERIFICATION_STATUS_TONE: Record<VerificationLevel, AdminTone> = {
  none: "ghost",
  email: "amber",
  phone: "violet",
  id_verified: "jade",
};
