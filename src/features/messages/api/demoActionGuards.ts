// src/features/messages/api/demoActionGuards.ts
import type { QueryClient } from "@tanstack/react-query";
import type { MessageResponse } from "../../../shared/contracts/contracts";
import { EDIT_WINDOW_MS } from "../demoTimeline.data";
import { ensureDemoThreadStore } from "./demoThreadCache";

// ── DEMO action guards ───────────────────────────────────────────────────────
// Demo has no server to refuse a write, so the demo mutation branches ask here
// first and refuse exactly where the live endpoints would: a system message,
// a message the viewer may not edit, delete or pin (the same server-stamped
// `canEdit` / `canDelete` / `canPin` flags), or an edit past the edit window
// (`EDIT_WINDOW_MS`, the same constant the seed stamps `canEdit` with).
// Delete for me and reactions stay open, as they are live.

export type DemoGuardedAction = "edit" | "delete" | "pin" | "star";

export type DemoActionRefusalReason =
  "missing" | "system" | "notPermitted" | "editWindowClosed";

/** A demo write the server would have refused. */
export class DemoActionRefusedError extends Error {
  readonly reason: DemoActionRefusalReason;

  constructor(action: DemoGuardedAction, reason: DemoActionRefusalReason) {
    super(`Demo ${action} refused: ${reason}`);
    this.name = "DemoActionRefusedError";
    this.reason = reason;
  }
}

/** Why the server would refuse `action` on `message` at `nowMs`, or null when
 *  it would accept it. The edit window matches the server's `<=` rule. */
export function demoActionRefusal(
  message: MessageResponse | undefined,
  action: DemoGuardedAction,
  nowMs: number,
): DemoActionRefusalReason | null {
  if (!message) return "missing";
  if (message.kind === "system") return "system";
  if (action === "edit") {
    if (!message.canEdit) return "notPermitted";
    const ageMs = nowMs - new Date(message.createdAt).getTime();
    if (ageMs > EDIT_WINDOW_MS) return "editWindowClosed";
  }
  if (action === "delete" && !message.canDelete) return "notPermitted";
  if (action === "pin" && !message.canPin) return "notPermitted";
  return null;
}

/** Looks the message up in the demo session store (creating it from the seed
 *  if needed) and throws `DemoActionRefusedError` when the server would refuse
 *  the action. */
export function assertDemoActionAllowed(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  action: DemoGuardedAction,
  nowMs: number = Date.now(),
): void {
  const message = ensureDemoThreadStore(queryClient, conversationId).find(
    (candidate) => candidate.id === messageId,
  );
  const reason = demoActionRefusal(message, action, nowMs);
  if (reason) throw new DemoActionRefusedError(action, reason);
}
