import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useWorkshopsActions } from "../../app/providers/useWorkshops";
import type { WorkshopDraft } from "./addWorkshop.build";
import type { Workshop } from "./workshops.data";

/** How long demo mode pauses on "Publishing…" — the prototype's own beat, kept
 *  so the modal feels identical with no backend behind it. */
const DEMO_PUBLISH_MS = 700;

/**
 * The "List a workshop" submit flow — and, when `editing` is passed, the
 * "save your edits" one.
 *
 * Replaces the generic `useSubmitFlow` here because that one always lands on
 * success after a fixed delay: a real POST or PATCH can fail, and the
 * confirmation panel must only appear once the write actually landed. Demo mode
 * keeps the simulated pause and always succeeds (nothing can fail without a
 * network).
 */
export function useAddWorkshopFlow(editing?: Workshop) {
  const { demoMode } = useDemoMode();
  const { addWorkshop, updateWorkshop } = useWorkshopsActions();
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [newId, setNewId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  async function submit(draft: WorkshopDraft) {
    setFailed(false);
    setStatus("sending");
    if (demoMode) {
      await new Promise((resolve) => setTimeout(resolve, DEMO_PUBLISH_MS));
    }
    const saved = editing
      ? await updateWorkshop(editing.id, draft)
      : await addWorkshop(draft);
    if (!saved) {
      // Back to the filled-in form, with the draft intact to retry.
      setFailed(true);
      setStatus("idle");
      return;
    }
    setNewId(saved.id);
    setStatus("done");
  }

  return {
    sending: status === "sending",
    done: status === "done",
    newId,
    failed,
    submit,
  };
}
