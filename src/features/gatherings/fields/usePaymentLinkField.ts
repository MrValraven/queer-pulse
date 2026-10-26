import { useState } from "react";
import {
  completePaymentLink,
  PAYMENT_LINK_PROBLEM_KEYS,
  paymentLinkProblem,
} from "../paymentDetails";

/**
 * The payment link's focus and blur handling, shared by the create wizard and
 * the edit-details modal.
 *
 * A host typing `revolut.me/ana` is halfway to a fine link, so the error
 * waits until they leave the field the first time; from then on it follows
 * the value. A malformed link restored from a draft shows its error straight
 * away, since nobody is typing it. On blur a bare domain gains `https://`.
 *
 * `errorKey` is the message naming what is wrong with the link (no
 * `https://`, no domain, too long, characters a URL cannot hold), set only
 * while the error shows.
 */
export function usePaymentLinkField(
  value: string,
  onChange: (nextValue: string) => void,
) {
  const [hasBlurred, setHasBlurred] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const problem = paymentLinkProblem(value);
  const shouldShowError = problem !== null && (hasBlurred || !isFocused);
  const errorKey =
    shouldShowError && problem ? PAYMENT_LINK_PROBLEM_KEYS[problem] : null;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    setHasBlurred(true);
    const completed = completePaymentLink(value);
    if (completed !== value) onChange(completed);
  };

  return { shouldShowError, errorKey, handleFocus, handleBlur };
}
