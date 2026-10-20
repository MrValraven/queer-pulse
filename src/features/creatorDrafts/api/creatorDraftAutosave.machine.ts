import { ApiError } from "../../../shared/api/client";
import {
  isCreatorDraftFeatureOff,
  readCreatorDraftConflict,
} from "./creatorDrafts.api";
import {
  CREATOR_DRAFT_AUTOSAVE_DELAY_MS,
  CREATOR_DRAFT_PAYLOAD_VERSION,
  CREATOR_DRAFT_RETRY_DELAYS_MS,
  type CreatorDraftConflict,
  type CreatorDraftProgress,
  type CreatorDraftResponse,
  type CreatorDraftSaved,
  type SaveCreatorDraftBody,
} from "./creatorDrafts.types";

/*
 * The autosave engine behind every creator draft editor, free of React so its
 * rules read in one place. Invariants:
 *   1. One request in flight per slot. Saves, deletes and fresh reads all pass
 *      through `withLock`; an edit that lands meanwhile is queued, and only the
 *      newest body goes out once the request settles.
 *   2. The latest local edit wins locally. The engine never edits the payload;
 *      it hands a server draft to the editor only when the editor asks.
 *   3. The server revision moves only on a confirmed answer: a saved revision,
 *      a 409's revision on Keep this version, a fresh read, a confirmed delete.
 *      A save that lands after a discard still moves it, so a failed delete
 *      leaves the engine on the revision the server holds.
 *   4. A 409 pauses every send until the creator picks Load the newer draft or
 *      Keep this version. A 413 stops until the payload changes, and an edit
 *      typed while the refused request was out counts as that change. A
 *      feature-off 404, from the read or from a save, stops the slot for the
 *      page's life.
 *   5. An emptied slot (a 409 with a null revision) resends on a null base.
 *   6. Retired is final. Once the slot's cache entry is removed (sign-out) or
 *      the demo switch flips, the engine sends, reads, writes the cache and
 *      touches the demo store no more. A save already on the wire lands with
 *      no effect here, and the demo ports check again after their own import.
 *   7. One engine per query client and slot key (`acquireAutosaveMachine`). A
 *      remount while a request is out gets the same engine back, so the
 *      revision it knows survives; the new editor's resume source waits for
 *      that request to settle.
 *   8. An unmounted engine makes one flush attempt and schedules no retry or
 *      debounce after it. Once idle it leaves the registry, so the next mount
 *      starts from the cache.
 *   9. A discard the creator asks for reports a failed delete (the promise
 *      rejects, the status goes back to idle). The automatic delete of an
 *      editor gone clean stays quiet, reads fresh first and deletes only the
 *      revision this engine saved.
 *  10. The retry backoff starts over after every answer that ends a retry
 *      chain: a save, Keep this version, Load the newer draft, a stop, a 413,
 *      a 409 and a discard.
 *  11. A remount keeps every keystroke. When a new editor replaces one that
 *      unmounted, the old editor's last unsent body (the carried body) goes
 *      out first, under the old instance, and the new editor's resume source
 *      waits for it while it is still due to go out by itself. An editor
 *      mounted beside another one shares the engine as it stands.
 *  12. A retry that finds nothing to send (a clean editor, an unchanged
 *      payload, a disabled editor) turns retrying into idle. A too large or
 *      not saved line stays until a new edit arrives.
 *  13. A retry pending holds the queue: `drainQueue` waits for the backoff
 *      timer, which sends the carried body (or the newest body) itself.
 *  14. The save line ages against this device's clock. A save's saved status
 *      carries the time its answer arrived here; the cache keeps the server's
 *      savedAt. Load the newer draft shows that draft's own savedAt.
 *  15. A read-only look attaches nothing. `peekResumeSource` (read by
 *      `useCreatorDraftResumeSource`) is undefined until the slot settles as
 *      a new editor would see it, and listeners hear every request settle,
 *      the unmount flush and the release, so a reader looks again.
 *
 * The carried body, by what happens to its save or while it waits:
 *
 *   event              | carriedBody            | status line         | sent next, and when
 *   -------------------+------------------------+---------------------+-----------------------------------
 *   save succeeds      | consumed               | saved               | the new editor's body, at once
 *   409                | kept through the pause | conflict            | nothing until the creator chooses;
 *                      |                        |                     | Keep this version sends it on the
 *                      |                        |                     | 409's revision, then the new
 *                      |                        |                     | editor's body
 *   retryable failure  | kept                   | retrying            | it, when the backoff timer fires,
 *   (network, 5xx)     |                        |                     | then the new editor's body
 *   ... once unmounted | dropped                | notSaved            | nothing (one flush attempt)
 *   stop (401, 403)    | dropped                | notSaved until a    | the new editor's body, at once
 *                      |                        | new edit arrives    |
 *   413                | dropped (it is the     | tooLarge until a    | the new editor's body, at once
 *                      | refused payload)       | new edit arrives    |
 *   retire             | dropped                | left as it is       | nothing more, for good
 *   forget             | dropped                | idle                | nothing until the editor enables
 *   discard            | dropped                | idle, or the reject | the next change, on a null base
 *   Load newer         | dropped for a restored | saved at the draft's| the editor's next change, after
 *                      | draft; kept when the   | time; idle when the | its debounce (the carried body
 *                      | slot turns out empty   | slot is empty       | first when kept)
 *   Load newer, a      | kept, as after a       | conflict, as before | nothing until the creator chooses
 *   payload the editor | failed read            | the call            | again; resolves null
 *   cannot read        |                        |                     |
 *
 * During a 409 pause the new editor's resume source settles from the cache,
 * so an editor that waits for it can still show the conflict choice.
 */

/** Why a save failed, as the engine acts on it. */
export type AutosaveFailureKind =
  "conflict" | "tooLarge" | "retry" | "stop" | "unavailable";

/** Reads a failed save as conflict, too large, feature off, retry or stop. */
export function classifyAutosaveFailure(error: unknown): AutosaveFailureKind {
  if (readCreatorDraftConflict(error) !== null) return "conflict";
  if (!(error instanceof ApiError)) return "retry";
  if (error.status === 413) return "tooLarge";
  if (isCreatorDraftFeatureOff(error)) return "unavailable";
  const isRetryable =
    error.status === 0 ||
    error.status === 408 ||
    error.status === 429 ||
    error.status >= 500;
  return isRetryable ? "retry" : "stop";
}

/** The wait before retry number `attempt` (0 first), capped at the last step. */
export function nextRetryDelayMs(attempt: number): number {
  const lastIndex = CREATOR_DRAFT_RETRY_DELAYS_MS.length - 1;
  const delayIndex = Math.min(Math.max(attempt, 0), lastIndex);
  return (
    CREATOR_DRAFT_RETRY_DELAYS_MS[delayIndex] ??
    CREATOR_DRAFT_RETRY_DELAYS_MS[3]
  );
}

/** What the save line shows. */
export type CreatorDraftSaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; savedAt: string }
  | { kind: "retrying" }
  | { kind: "conflict" }
  | { kind: "tooLarge" }
  | { kind: "notSaved" };

/** The engine state React renders. */
export interface AutosaveMachineView {
  status: CreatorDraftSaveStatus;
  conflict: CreatorDraftConflict | null;
  isConflictBusy: boolean;
  /** The settled read of the slot for this editor; undefined until it settles. */
  resumeSource: CreatorDraftResponse | null | undefined;
}

/** What the editor hands the engine on every render. */
export interface AutosaveMachineInput {
  payload: Record<string, unknown> | null;
  /** `JSON.stringify(payload)`, null for a clean editor. */
  serializedPayload: string | null;
  progress: CreatorDraftProgress | null;
  missing: string[] | null;
  isEnabled: boolean;
}

/** The slot's read once settled (an error settles as an empty slot). */
export interface AutosaveSettledRead {
  draft: CreatorDraftResponse | null;
  /** The kind's feature is off: the slot saves nothing. */
  isUnavailable: boolean;
}

/** The outside world of one slot: wire (or demo store) and query cache. */
export interface AutosaveMachinePorts {
  save: (body: SaveCreatorDraftBody) => Promise<CreatorDraftSaved>;
  remove: () => Promise<void>;
  readFresh: () => Promise<CreatorDraftResponse | null>;
  /** Undefined while the first read is pending. */
  readSettled: () => AutosaveSettledRead | undefined;
  writeCache: (draft: CreatorDraftResponse | null) => void;
  /** Demo only: the store plays the server, which deletes on publish. */
  removeAfterPublish: () => void;
  /** Calls back, synchronously, when the slot's cache entry is removed; answers the unsubscribe. */
  subscribeRemoved: (onRemoved: () => void) => () => void;
}

/** Builds one slot's ports; `isRetired` lets an async port check again after its own wait. */
export type AutosavePortsFactory = (
  isRetired: () => boolean,
) => AutosaveMachinePorts;

type AutosavePause =
  { kind: "conflict" } | { kind: "tooLarge"; refusedPayload: string | null };

/** How the editor takes the newer draft it asked for. */
export interface LoadNewerOptions {
  /** False when the editor cannot restore this payload (a wrong shape). */
  isReadable?: (payload: Record<string, unknown>) => boolean;
}

/** Why a save's answer no longer speaks for the slot. */
type SupersededBy = "discard" | "forget" | "retire";

/** Marks one save so a late answer knows what still applies. */
interface SaveTicket {
  supersededBy: SupersededBy | null;
  /** The editor instance the save belongs to (see `beginRemount`). */
  attachGeneration: number;
}

/** Thrown by `discard` when the delete fails; the server copy stays. */
export class CreatorDraftDiscardError extends Error {
  constructor() {
    super("The creator draft could not be deleted.");
    this.name = "CreatorDraftDiscardError";
  }
}

const IDLE_STATUS: CreatorDraftSaveStatus = { kind: "idle" };
const NOT_RECEIVED = Symbol("not received");

/** One slot's autosave engine; `acquireAutosaveMachine` keeps one per slot key. */
export class CreatorDraftAutosaveMachine {
  private view: AutosaveMachineView = {
    status: IDLE_STATUS,
    conflict: null,
    isConflictBusy: false,
    resumeSource: undefined,
  };
  private readonly listeners = new Set<() => void>();
  private latest: AutosaveMachineInput = {
    payload: null,
    serializedPayload: null,
    progress: null,
    missing: null,
    isEnabled: false,
  };
  private lastReceivedPayload: string | null | typeof NOT_RECEIVED =
    NOT_RECEIVED;
  private isSeeded = false;
  private revision: number | null = null;
  /** The payload the server holds as far as this engine knows; null when unknown or empty. */
  private serverSerializedPayload: string | null = null;
  /** This editor instance saved the slot, so going clean may delete it. */
  private hasSavedThisSession = false;
  private pause: AutosavePause | null = null;
  private isUnavailable = false;
  private isWaitingForRead = false;
  private hasQueued = false;
  private retryAttempt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  /** The pending timer is a retry, which already sends the newest body. */
  private isRetryPending = false;
  private activeRequest: Promise<void> | null = null;
  private waitingOperations = 0;
  private activeTicket: SaveTicket | null = null;
  private pendingLoad: Promise<CreatorDraftResponse | null> | null = null;
  private hasRetired = false;
  private attachCount = 0;
  /** No editor holds the engine and its one unmount flush has run. */
  private isDetached = false;
  private readonly knownHolders = new WeakSet<object>();
  private hasHadHolder = false;
  private attachGeneration = 0;
  /** A remounted editor waits for the slot as it stands once the lock is free. */
  private isResumeStale = false;
  private unsubscribeRemoved: (() => void) | null = null;
  /** An unmounted editor's last unsent body, sent before the next editor's. */
  private carriedBody: {
    input: AutosaveMachineInput;
    attachGeneration: number;
  } | null = null;

  private readonly ports: AutosaveMachinePorts;
  private readonly onRelease: () => void;

  constructor(
    createPorts: AutosavePortsFactory,
    onRelease: () => void = () => undefined,
  ) {
    this.ports = createPorts(() => this.hasRetired);
    this.onRelease = onRelease;
  }

  get isRetired(): boolean {
    return this.hasRetired;
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getView = (): AutosaveMachineView => this.view;

  /**
   * The resume source an editor opening now would get, read without attaching.
   * Undefined while a request is out, while an editor's unmount flush is still
   * due, while a carried body waits outside a 409 pause, while the first read
   * is pending, and once retired. Listeners hear when any of these ends.
   */
  peekResumeSource = (): CreatorDraftResponse | null | undefined => {
    if (this.hasRetired || this.isBusy()) return undefined;
    const isUnmountFlushDue =
      this.hasHadHolder && this.attachCount === 0 && !this.isDetached;
    if (isUnmountFlushDue) return undefined;
    if (this.carriedBody !== null && this.pause === null) return undefined;
    return this.ports.readSettled()?.draft;
  };

  /** A mounted editor instance holds the engine; the first hold watches the cache. */
  attach(holder: object): void {
    if (this.hasRetired) return;
    this.attachCount += 1;
    this.isDetached = false;
    this.unsubscribeRemoved ??= this.ports.subscribeRemoved(this.retire);
    const isNewHolder = !this.knownHolders.has(holder);
    this.knownHolders.add(holder);
    // An editor mounted beside another shares the engine as it stands.
    const isReplacingHolder =
      isNewHolder && this.hasHadHolder && this.attachCount === 1;
    this.hasHadHolder = true;
    if (!isReplacingHolder) return;
    this.carryPreviousEditorBody();
    this.beginRemount();
  }

  /** The editor let go; a StrictMode re-attach in the same commit keeps every timer. */
  detach(): void {
    if (this.attachCount === 0) return;
    this.attachCount -= 1;
    if (this.attachCount > 0) return;
    queueMicrotask(() => this.settleDetach());
  }

  /** Ends the engine for good: sign-out removed its cache entry, or demo mode flipped. */
  retire = (): void => {
    if (this.hasRetired) return;
    this.hasRetired = true;
    this.supersedeActiveSave("retire");
    this.clearTimer();
    this.hasQueued = false;
    this.carriedBody = null;
    this.isWaitingForRead = false;
    this.release();
  };

  /** Takes the editor's newest body; a changed payload restarts the debounce. */
  receive(input: AutosaveMachineInput): void {
    if (this.hasRetired) return;
    const hasPayloadChanged =
      input.serializedPayload !== this.lastReceivedPayload;
    const hasEnabledChanged = input.isEnabled !== this.latest.isEnabled;
    this.lastReceivedPayload = input.serializedPayload;
    this.latest = input;
    if (!input.isEnabled) {
      // A carried body's retry belongs to the old editor and still goes out.
      if (this.carriedBody === null) this.clearTimer();
      return;
    }
    this.releaseTooLargeIfChanged();
    if (hasPayloadChanged) this.clearRefusalLine();
    if (hasPayloadChanged || hasEnabledChanged) this.scheduleDebounce();
  }

  /** Called once the slot's first read settles. */
  noteReadSettled(): void {
    if (this.hasRetired || !this.seedFromRead()) return;
    this.refreshResumeIfIdle();
    if (!this.isWaitingForRead) return;
    this.isWaitingForRead = false;
    this.flush();
  }

  /** Sends a pending debounced or retry body at once (page hide, unmount). */
  flushPendingNow(): void {
    if (this.timer !== null) this.flush();
  }

  keepThisVersion = (): void => {
    const conflict = this.view.conflict;
    if (this.hasRetired || conflict === null || this.view.isConflictBusy)
      return;
    this.revision = conflict.revision;
    this.isSeeded = true;
    this.serverSerializedPayload = null;
    this.pause = null;
    this.retryAttempt = 0;
    this.updateView({ isConflictBusy: true });
    this.flush();
    if (this.activeRequest === null) {
      // Nothing to send now (a clean or paused editor): the next change saves.
      this.updateView({
        status: IDLE_STATUS,
        conflict: null,
        isConflictBusy: false,
      });
    }
  };

  /** Reads the newer draft; an unreadable one (`isReadable` false) leaves the pause as it was and resolves null. */
  loadNewer = (
    options?: LoadNewerOptions,
  ): Promise<CreatorDraftResponse | null> => {
    if (this.hasRetired) return Promise.resolve(null);
    if (this.pendingLoad !== null) return this.pendingLoad;
    if (this.view.isConflictBusy) return Promise.resolve(null);
    this.updateView({ isConflictBusy: true });
    const load = this.withLock(() => this.runLoadNewer(options));
    this.pendingLoad = load;
    void load.finally(() => {
      this.pendingLoad = null;
    });
    return load;
  };

  /** Deletes the slot; rejects with `CreatorDraftDiscardError` when the delete fails. */
  discard = async (): Promise<void> => {
    if (this.hasRetired) return;
    this.supersedeActiveSave("discard");
    this.clearTimer();
    this.hasQueued = false;
    this.carriedBody = null;
    this.hasSavedThisSession = false;
    this.pause = null;
    this.retryAttempt = 0;
    this.isResumeStale = false;
    this.updateView({
      conflict: null,
      isConflictBusy: false,
      resumeSource: null,
    });
    const isDeleted = await this.withLock(() => this.runDelete());
    if (isDeleted) return;
    this.updateView({ status: IDLE_STATUS });
    throw new CreatorDraftDiscardError();
  };

  forget = (): void => {
    if (this.hasRetired) return;
    this.supersedeActiveSave("forget");
    this.clearTimer();
    this.hasQueued = false;
    this.carriedBody = null;
    this.hasSavedThisSession = false;
    this.isSeeded = true;
    this.isWaitingForRead = false;
    this.revision = null;
    this.serverSerializedPayload = null;
    this.pause = null;
    this.retryAttempt = 0;
    this.isResumeStale = false;
    this.writeCache(null);
    this.ports.removeAfterPublish();
    this.updateView({
      status: IDLE_STATUS,
      conflict: null,
      isConflictBusy: false,
      resumeSource: null,
    });
  };

  private updateView(patch: Partial<AutosaveMachineView>): void {
    this.view = { ...this.view, ...patch };
    this.notifyListeners();
  }

  /** Also called with the view unchanged, so `peekResumeSource` readers look again. */
  private notifyListeners(): void {
    for (const listener of this.listeners) listener();
  }

  private writeCache(draft: CreatorDraftResponse | null): void {
    // A write after sign-out would bring the removed cache entry back.
    if (!this.hasRetired) this.ports.writeCache(draft);
  }

  private isBusy(): boolean {
    return this.activeRequest !== null || this.waitingOperations > 0;
  }

  /**
   * The unmounted editor's last unsent body goes out before the new editor's
   * first one, under the old instance's generation; the new editor's receive
   * would otherwise overwrite it.
   */
  private carryPreviousEditorBody(): void {
    const hasUnsentBody =
      this.timer !== null || this.hasQueued || this.isWaitingForRead;
    if (!hasUnsentBody) return;
    this.carriedBody = {
      input: this.latest,
      attachGeneration: this.attachGeneration,
    };
    this.hasQueued = false;
    this.isWaitingForRead = false;
    this.flush();
  }

  /** A retry that finds nothing to send clears its retrying line. */
  private settleNothingToSend(): void {
    if (this.view.status.kind === "retrying")
      this.updateView({ status: IDLE_STATUS });
  }

  /** A new edit makes a too large or not saved line old news. */
  private clearRefusalLine(): void {
    const statusKind = this.view.status.kind;
    if (statusKind === "tooLarge" || statusKind === "notSaved")
      this.updateView({ status: IDLE_STATUS });
  }

  /** A new editor instance on a kept engine starts its own session. */
  private beginRemount(): void {
    this.hasSavedThisSession = false;
    this.attachGeneration += 1;
    this.lastReceivedPayload = NOT_RECEIVED;
    this.isResumeStale = true;
    this.updateView({ resumeSource: undefined });
    this.refreshResumeIfIdle();
  }

  private refreshResumeIfIdle(): void {
    if (!this.isResumeStale || this.isBusy()) return;
    if (this.carriedBody !== null && this.pause === null) return;
    const read = this.ports.readSettled();
    if (read === undefined) return;
    this.isResumeStale = false;
    this.updateView({ resumeSource: read.draft });
  }

  private settleDetach(): void {
    if (this.attachCount > 0 || this.hasRetired) return;
    this.isDetached = true;
    this.flushPendingNow();
    this.releaseIfIdle();
    this.notifyListeners();
  }

  private releaseIfIdle(): void {
    if (!this.isDetached || this.attachCount > 0 || this.hasRetired) return;
    if (this.isBusy() || this.timer !== null) return;
    this.release();
  }

  private release(): void {
    this.unsubscribeRemoved?.();
    this.unsubscribeRemoved = null;
    this.onRelease();
    // A resume source reader falls back to the query once the engine leaves.
    this.notifyListeners();
  }

  private clearTimer(): void {
    this.isRetryPending = false;
    if (this.timer === null) return;
    clearTimeout(this.timer);
    this.timer = null;
  }

  private releaseTooLargeIfChanged(): void {
    if (
      this.pause?.kind === "tooLarge" &&
      this.latest.serializedPayload !== this.pause.refusedPayload
    ) {
      this.pause = null;
    }
  }

  private scheduleDebounce(): void {
    // An unmounted editor gets its one flush attempt and nothing after it.
    if (this.hasRetired || this.attachCount === 0) return;
    // An edit keeps the retry's backoff; the retry sends the newest body.
    if (this.pause !== null || this.isUnavailable || this.isRetryPending)
      return;
    this.schedule(CREATOR_DRAFT_AUTOSAVE_DELAY_MS);
  }

  private schedule(delayMs: number): void {
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.timer = null;
      this.isRetryPending = false;
      this.flush();
    }, delayMs);
  }

  private seedFromRead(): boolean {
    if (this.isSeeded) return true;
    const read = this.ports.readSettled();
    if (read === undefined) return false;
    this.isSeeded = true;
    this.revision = read.draft?.revision ?? null;
    this.serverSerializedPayload = read.draft
      ? JSON.stringify(read.draft.payload)
      : null;
    this.updateView({ resumeSource: read.draft });
    return true;
  }

  /** Sends the newest body when the slot may save and something changed. */
  private flush(): void {
    this.clearTimer();
    if (this.hasRetired) return;
    this.releaseTooLargeIfChanged();
    if (this.ports.readSettled()?.isUnavailable) this.isUnavailable = true;
    if (this.pause !== null) return;
    const carried = this.carriedBody;
    const body = carried?.input ?? this.latest;
    if (!body.isEnabled || this.isUnavailable) {
      this.settleNothingToSend();
      return;
    }
    if (this.isBusy()) {
      this.hasQueued = true;
      return;
    }
    if (!this.seedFromRead()) {
      this.isWaitingForRead = true;
      return;
    }
    if (carried === null) {
      if (!this.startRequestFor(body, this.attachGeneration))
        this.settleNothingToSend();
      return;
    }
    this.carriedBody = null;
    // The new editor's own body is weighed once the carried one settles.
    if (this.startRequestFor(body, carried.attachGeneration))
      this.hasQueued = true;
    else this.flush();
  }

  /** Starts the save (or the clean editor's delete) a body calls for; false when nothing goes out. */
  private startRequestFor(
    body: AutosaveMachineInput,
    attachGeneration: number,
  ): boolean {
    const payload = body.payload;
    if (payload === null) {
      if (!this.hasSavedThisSession || this.serverSerializedPayload === null)
        return false;
      void this.withLock(() => this.runCleanEditorDelete());
      return true;
    }
    if (body.serializedPayload === this.serverSerializedPayload) return false;
    const ticket: SaveTicket = { supersededBy: null, attachGeneration };
    this.activeTicket = ticket;
    void this.withLock(() => this.runSave(body, payload, ticket));
    return true;
  }

  private async withLock<T>(operation: () => Promise<T>): Promise<T> {
    this.waitingOperations += 1;
    while (this.activeRequest !== null) await this.activeRequest;
    this.waitingOperations -= 1;
    const run = operation();
    const settled = run.then(
      () => undefined,
      () => undefined,
    );
    this.activeRequest = settled;
    try {
      return await run;
    } finally {
      if (this.activeRequest === settled) this.activeRequest = null;
      this.drainQueue();
      this.refreshResumeIfIdle();
      this.releaseIfIdle();
      this.notifyListeners();
    }
  }

  private drainQueue(): void {
    // A pending retry sends the carried or newest body itself, after its backoff.
    if (!this.hasQueued || this.waitingOperations > 0 || this.isRetryPending)
      return;
    this.hasQueued = false;
    this.flush();
  }

  /** Retire wins over forget, and forget wins over discard. */
  private supersedeActiveSave(reason: SupersededBy): void {
    const ticket = this.activeTicket;
    if (ticket === null || ticket.supersededBy === "retire") return;
    if (reason === "discard" && ticket.supersededBy === "forget") return;
    ticket.supersededBy = reason;
  }

  private async runSave(
    body: AutosaveMachineInput,
    payload: Record<string, unknown>,
    ticket: SaveTicket,
  ): Promise<void> {
    if (ticket.supersededBy !== null) return;
    this.updateView({ status: { kind: "saving" } });
    try {
      const saved = await this.ports.save({
        payload,
        payloadVersion: CREATOR_DRAFT_PAYLOAD_VERSION,
        baseRevision: this.revision,
        progress: body.progress,
        missing: body.missing,
      });
      await this.settleSave(ticket, body, payload, saved);
    } catch (error) {
      if (ticket.supersededBy === null) {
        const failure = this.applyFailure(error, body);
        this.keepCarriedBodyAfter(failure, body, ticket);
      }
    } finally {
      if (this.activeTicket === ticket) this.activeTicket = null;
    }
  }

  private async settleSave(
    ticket: SaveTicket,
    body: AutosaveMachineInput,
    payload: Record<string, unknown>,
    saved: CreatorDraftSaved,
  ): Promise<void> {
    if (ticket.supersededBy === null) {
      this.applySaved(body, payload, saved, ticket);
    } else if (ticket.supersededBy === "discard") {
      // The delete queued behind this save may fail; the slot then holds this revision.
      this.revision = saved.revision;
      this.serverSerializedPayload = body.serializedPayload;
    } else if (ticket.supersededBy === "forget") {
      // The slot was published meanwhile, so this late copy goes too.
      await this.ports.remove();
    }
  }

  private applySaved(
    body: AutosaveMachineInput,
    payload: Record<string, unknown>,
    saved: CreatorDraftSaved,
    ticket: SaveTicket,
  ): void {
    this.revision = saved.revision;
    this.serverSerializedPayload = body.serializedPayload;
    if (ticket.attachGeneration === this.attachGeneration)
      this.hasSavedThisSession = true;
    this.retryAttempt = 0;
    this.writeCache({
      payload,
      payloadVersion: CREATOR_DRAFT_PAYLOAD_VERSION,
      revision: saved.revision,
      savedAt: saved.savedAt,
    });
    // The save line ages against this device's clock, so it takes the time the
    // answer arrived here. A server clock running behind would age a save made
    // just now by minutes, and one running ahead would hold "Saved just now"
    // too long. The cache keeps the server time.
    this.updateView({
      status: { kind: "saved", savedAt: new Date().toISOString() },
      conflict: null,
      isConflictBusy: false,
    });
  }

  /**
   * An old editor's save (see the carried body table) keeps its body through a
   * 409 pause and an armed retry. A carried body already waiting is newer, so it stays.
   */
  private keepCarriedBodyAfter(
    failure: AutosaveFailureKind,
    body: AutosaveMachineInput,
    ticket: SaveTicket,
  ): void {
    if (ticket.attachGeneration === this.attachGeneration) return;
    if (this.carriedBody !== null) return;
    const isKept =
      failure === "conflict" || (failure === "retry" && this.isRetryPending);
    if (!isKept) return;
    this.carriedBody = {
      input: body,
      attachGeneration: ticket.attachGeneration,
    };
  }

  private applyFailure(
    error: unknown,
    body: AutosaveMachineInput,
  ): AutosaveFailureKind {
    const failure = classifyAutosaveFailure(error);
    if (failure === "conflict") {
      this.applyConflict(error);
      return failure;
    }
    this.updateView({ conflict: null, isConflictBusy: false });
    if (failure === "tooLarge") {
      this.applyTooLarge(body);
    } else if (failure === "unavailable") {
      this.isUnavailable = true;
      this.hasQueued = false;
      this.clearTimer();
      this.updateView({ status: IDLE_STATUS });
    } else if (failure === "retry") {
      this.scheduleRetry();
    } else {
      this.retryAttempt = 0;
      this.updateView({ status: { kind: "notSaved" } });
    }
    return failure;
  }

  private applyConflict(error: unknown): void {
    this.pause = { kind: "conflict" };
    this.serverSerializedPayload = null;
    this.hasQueued = false;
    this.retryAttempt = 0;
    this.clearTimer();
    this.updateView({
      status: { kind: "conflict" },
      conflict: readCreatorDraftConflict(error),
      isConflictBusy: false,
    });
  }

  private applyTooLarge(body: AutosaveMachineInput): void {
    this.pause = { kind: "tooLarge", refusedPayload: body.serializedPayload };
    this.retryAttempt = 0;
    this.clearTimer();
    this.updateView({ status: { kind: "tooLarge" } });
    // An edit typed while the refused request was out lost its debounce above.
    this.releaseTooLargeIfChanged();
    if (this.pause === null) this.scheduleDebounce();
  }

  private scheduleRetry(): void {
    if (this.attachCount === 0) {
      // An unmounted editor gets its one flush attempt and nothing after it.
      this.updateView({ status: { kind: "notSaved" } });
      return;
    }
    this.schedule(nextRetryDelayMs(this.retryAttempt));
    this.isRetryPending = true;
    this.retryAttempt += 1;
    this.updateView({ status: { kind: "retrying" } });
  }

  /** True once the slot is gone, or when there is nothing left to do after retiring. */
  private async runDelete(): Promise<boolean> {
    if (this.hasRetired) return true;
    try {
      await this.ports.remove();
    } catch {
      // The server copy stays; the next save overwrites it on the known revision.
      return false;
    }
    if (this.hasRetired) return true;
    this.isSeeded = true;
    this.revision = null;
    this.serverSerializedPayload = null;
    this.hasSavedThisSession = false;
    this.writeCache(null);
    this.updateView({ status: IDLE_STATUS });
    return true;
  }

  /** The quiet delete of an editor gone clean: only over this engine's own save. */
  private async runCleanEditorDelete(): Promise<void> {
    if (this.hasRetired) return;
    const savedRevision = this.revision;
    let fresh: CreatorDraftResponse | null;
    try {
      fresh = await this.ports.readFresh();
    } catch {
      return;
    }
    if (this.hasRetired) return;
    if (fresh === null) {
      // Gone already (another tab, a publish or expiry): nothing to delete.
      this.revision = null;
      this.serverSerializedPayload = null;
      this.hasSavedThisSession = false;
      return;
    }
    // Another tab saved since: its copy stays, and the next save meets the 409.
    if (fresh.revision !== savedRevision) return;
    await this.runDelete();
  }

  private async runLoadNewer(
    options?: LoadNewerOptions,
  ): Promise<CreatorDraftResponse | null> {
    if (this.hasRetired) return null;
    let draft: CreatorDraftResponse | null;
    try {
      draft = await this.ports.readFresh();
    } catch {
      // The pause stays, so the creator can choose again.
      this.updateView({ isConflictBusy: false });
      return null;
    }
    if (this.hasRetired) return null;
    const isReadable = options?.isReadable;
    if (
      draft !== null &&
      isReadable !== undefined &&
      !isReadable(draft.payload)
    ) {
      // An editor that cannot restore this payload: the read counts as failed,
      // so the pause, the conflict and the typed body all stay as they were.
      this.updateView({ isConflictBusy: false });
      return null;
    }
    this.isSeeded = true;
    this.revision = draft?.revision ?? null;
    this.pause = null;
    this.retryAttempt = 0;
    this.updateView({ conflict: null, isConflictBusy: false });
    if (draft === null) {
      // The slot emptied elsewhere: the typed payload saves next on a null base.
      this.serverSerializedPayload = null;
      this.updateView({ status: IDLE_STATUS });
      this.scheduleDebounce();
    } else {
      // The editor restores this draft; its next change saves on this revision.
      // A queued or pending send of the old typed body would overwrite it, so both go.
      this.clearTimer();
      this.hasQueued = false;
      this.carriedBody = null;
      this.serverSerializedPayload = JSON.stringify(draft.payload);
      this.updateView({
        status: { kind: "saved", savedAt: draft.savedAt },
      });
    }
    return draft;
  }
}

const machineRegistry = new WeakMap<
  object,
  Map<string, CreatorDraftAutosaveMachine>
>();

/**
 * The one engine of a slot within a query client (`owner`), created on first
 * use. A remount while a request is out gets the same engine back; a retired
 * engine, or an idle one no editor holds, leaves the registry.
 */
export function acquireAutosaveMachine(
  owner: object,
  machineKey: string,
  createPorts: AutosavePortsFactory,
): CreatorDraftAutosaveMachine {
  let ownerMachines = machineRegistry.get(owner);
  if (ownerMachines === undefined) {
    ownerMachines = new Map();
    machineRegistry.set(owner, ownerMachines);
  }
  const existing = ownerMachines.get(machineKey);
  if (existing !== undefined && !existing.isRetired) return existing;
  const slotMachines = ownerMachines;
  const machine: CreatorDraftAutosaveMachine = new CreatorDraftAutosaveMachine(
    createPorts,
    () => {
      if (slotMachines.get(machineKey) === machine)
        slotMachines.delete(machineKey);
    },
  );
  slotMachines.set(machineKey, machine);
  return machine;
}

/** The slot's live engine within a query client, if one is held; never creates one. */
export function findAutosaveMachine(
  owner: object,
  machineKey: string,
): CreatorDraftAutosaveMachine | undefined {
  const existing = machineRegistry.get(owner)?.get(machineKey);
  return existing?.isRetired === true ? undefined : existing;
}
