import { FiPower, FiTrash2 } from "react-icons/fi";
import type { DestructiveActionContent } from "./DestructiveActionFlow";

/** Confirm/loading/result copy for the destructive account flows. */
export const DESTRUCTIVE_FLOW: Record<
  "deactivate" | "delete",
  DestructiveActionContent
> = {
  deactivate: {
    tone: "plum",
    icon: <FiPower />,
    eyebrow: "Deactivate account",
    title: (
      <>
        Hide your profile <em>for now?</em>
      </>
    ),
    body: (
      <>
        Your profile becomes invisible and notifications stop.{" "}
        <b>Nothing is deleted</b> — sign back in any time and you pick up
        exactly where you left off.
      </>
    ),
    confirmLabel: "Deactivate",
    loadingText: "Deactivating your account…",
    resultTitle: (
      <>
        You're <em>signed off.</em>
      </>
    ),
    resultBody: (
      <>
        Your profile is hidden and your data is safely preserved. Whenever
        you're ready, sign in and everything comes back. We'll be here.
      </>
    ),
  },
  delete: {
    tone: "accent",
    icon: <FiTrash2 />,
    eyebrow: "Delete account",
    title: (
      <>
        Delete <em>permanently?</em>
      </>
    ),
    body: (
      <>
        This queues your profile, messages, and all associated data for erasure
        within 30 days. <b>This cannot be undone.</b>
      </>
    ),
    confirmLabel: "Delete my account",
    loadingText: "Scheduling your account for deletion…",
    resultTitle: (
      <>
        It's <em>done.</em>
      </>
    ),
    resultBody: (
      <>
        Your account is scheduled for deletion and we've emailed you
        confirmation. You have 30 days to change your mind — just sign in to
        cancel. Take care of yourself.
      </>
    ),
  },
};
