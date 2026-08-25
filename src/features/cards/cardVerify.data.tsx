import type { ReactElement } from "react";
import { FiCheckCircle, FiClock, FiSlash, FiXCircle } from "react-icons/fi";
import type { EffectiveCardStatus } from "./api/cards.api";

/** The mark the verdict band wears for each standing a resolved card can have. */
export const STATUS_ICON: Record<EffectiveCardStatus, ReactElement> = {
  active: <FiCheckCircle aria-hidden="true" />,
  expired: <FiClock aria-hidden="true" />,
  suspended: <FiXCircle aria-hidden="true" />,
  revoked: <FiSlash aria-hidden="true" />,
};

/**
 * How each standing colours the panel. Kept apart from the icon map because a
 * paused card and an expired one are the same amber warning while carrying
 * different marks.
 */
export const STATUS_TONE: Record<EffectiveCardStatus, "good" | "warn" | "bad"> =
  {
    active: "good",
    expired: "warn",
    suspended: "warn",
    revoked: "bad",
  };

/**
 * The ordinary reasons a scanned code resolves to nothing. Every one of them is
 * a possibility rather than a finding: the backend collapses bad signature,
 * expired token and unknown card into one answer on purpose, so this page can
 * say what MIGHT have happened and must never claim which did.
 */
export const UNVERIFIED_REASON_KEYS = [
  "cards:verify.unverified.why.replaced",
  "cards:verify.unverified.why.screenshot",
  "cards:verify.unverified.why.partial",
  "cards:verify.unverified.why.foreign",
] as const;
