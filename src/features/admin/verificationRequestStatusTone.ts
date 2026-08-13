import type { VerificationRequestStatus } from "../economy/api/verification.api";
import type { AdminTone } from "./ui";

/**
 * `VerificationRequestStatus` → `AdminChip` tone, for the Review-queue
 * segment's status pills (row list + drawer head): `pending`/`appealing`
 * both read as "needs a look" (amber), `in_review` as actively being worked
 * (violet), `approved` as the confirmed-good jade, `rejected` as the one
 * genuinely negative outcome (the real red `danger` tone — the level
 * console's `VERIFICATION_STATUS_TONE` has no negative state to reuse, since
 * every level there is a positive assurance step), and `withdrawn` as inert
 * (ghost, same as the level console's `none`). Values are drawn from the
 * real `AdminTone` union (`ui/AdminChip.tsx`).
 */
export const VERIFICATION_REQUEST_STATUS_TONE: Record<
  VerificationRequestStatus,
  AdminTone
> = {
  pending: "amber",
  in_review: "violet",
  approved: "jade",
  rejected: "danger",
  appealing: "amber",
  withdrawn: "ghost",
};
