export interface DirectMessagePush {
  title: string;
  body: string;
  tag?: string;
  // `isGroup` is true only on a group conversation's message push (contract
  // C1); absent for DMs and every other push type. It picks the coalesced
  // "{count} new messages in {group}" copy in sw.ts.
  data?: { conversationId?: string; url?: string; isGroup?: boolean };
  icon?: string;
  image?: string;
  actions?: { action: string; title: string }[];
  renotify?: boolean;
  vibrate?: number[];
  requireInteraction?: boolean;
  silent?: boolean;
  // Optional localization hint — see pushMessages.ts. `title`/`body` above
  // remain the required English fallback; this only overrides them when the
  // SW can resolve the key. Field shape MUST match the backend `PushPayload`
  // exactly (lockstep contract).
  l10n?: {
    titleKey?: string;
    bodyKey?: string;
    params?: Record<string, string>;
  };
  // Optional epoch-ms event time (e.g. a message's `createdAt`, an event's
  // start time, a notification's `createdAt`) — NOT delivery time. Passed to
  // `showNotification` so a push that was queued/delayed still shows the true
  // moment the underlying event happened. Field shape MUST match the backend
  // `PushPayload` exactly (lockstep contract).
  timestamp?: number;
}

/** True for a non-null, non-array plain object we can safely index into. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const ALLOWED_ACTIONS = new Set(["view"]);
const MAX_ACTIONS = 2;
const MAX_ACTION_TITLE = 24;
const MAX_VIBRATE_STEPS = 10;
const MAX_VIBRATE_MS = 10_000;

// Only a same-origin path or an absolute https URL may reach the notification UI:
// blocks javascript:/data:/mixed-content http:/protocol-relative "//".
function safeImageUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("https://")) return value;
  return undefined;
}

function safeActions(
  value: unknown,
): { action: string; title: string }[] | undefined {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > MAX_ACTIONS
  ) {
    return undefined;
  }
  const parsed: { action: string; title: string }[] = [];
  for (const item of value) {
    if (!isRecord(item)) return undefined;
    if (typeof item.action !== "string" || !ALLOWED_ACTIONS.has(item.action)) {
      return undefined;
    }
    if (
      typeof item.title !== "string" ||
      item.title.length === 0 ||
      item.title.length > MAX_ACTION_TITLE
    ) {
      return undefined;
    }
    parsed.push({ action: item.action, title: item.title });
  }
  return parsed;
}

function safeVibrate(value: unknown): number[] | undefined {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > MAX_VIBRATE_STEPS
  ) {
    return undefined;
  }
  const parsed: number[] = [];
  for (const step of value) {
    if (
      typeof step !== "number" ||
      !Number.isFinite(step) ||
      step < 0 ||
      step > MAX_VIBRATE_MS
    ) {
      return undefined;
    }
    parsed.push(step);
  }
  return parsed;
}

function optionalBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

/** A finite, non-negative epoch-ms timestamp, else dropped (never NaN/negative/Infinity). */
function safeTimestamp(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

const MAX_L10N_KEY_LENGTH = 80;
const MAX_L10N_PARAM_COUNT = 8;
const MAX_L10N_PARAM_VALUE_LENGTH = 120;

function isL10nKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_L10N_KEY_LENGTH &&
    value.startsWith("push:")
  );
}

/**
 * Validate the optional `l10n` block. Any structural problem — a key that
 * doesn't start with `"push:"`, a non-string param, too many params — drops
 * the WHOLE block (returns undefined) rather than the offending field alone,
 * so a malformed hint never partially renders; the caller falls back to the
 * plain `title`/`body` instead.
 */
function safeL10n(value: unknown): DirectMessagePush["l10n"] {
  if (!isRecord(value)) return undefined;

  const { titleKey, bodyKey, params } = value;
  if (titleKey !== undefined && !isL10nKey(titleKey)) return undefined;
  if (bodyKey !== undefined && !isL10nKey(bodyKey)) return undefined;

  let safeParams: Record<string, string> | undefined;
  if (params !== undefined) {
    if (!isRecord(params)) return undefined;
    const entries = Object.entries(params);
    if (entries.length === 0 || entries.length > MAX_L10N_PARAM_COUNT) {
      return undefined;
    }
    safeParams = {};
    for (const [paramKey, paramValue] of entries) {
      if (
        typeof paramValue !== "string" ||
        paramValue.length === 0 ||
        paramValue.length > MAX_L10N_PARAM_VALUE_LENGTH
      ) {
        return undefined;
      }
      safeParams[paramKey] = paramValue;
    }
  }

  return {
    ...(typeof titleKey === "string" ? { titleKey } : {}),
    ...(typeof bodyKey === "string" ? { bodyKey } : {}),
    ...(safeParams ? { params: safeParams } : {}),
  };
}

/**
 * Validate a raw push payload before it reaches showNotification(). The bytes
 * come off the wire and are handed straight to the notification UI, so a
 * malformed or shape-drifted payload (a backend field rename, a truncated body)
 * must not throw here or render garbage like "undefined" in the notification.
 * We only assert the fields we actually use, and only their primitive shape;
 * a body that fails returns null, and `readPushEventPayload` below swaps in the
 * generic fallback notification.
 */
export function toDirectMessagePush(raw: unknown): DirectMessagePush | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.title !== "string" || raw.title.length === 0) return null;
  if (typeof raw.body !== "string") return null;
  if (raw.tag !== undefined && typeof raw.tag !== "string") return null;
  if (raw.data !== undefined && !isRecord(raw.data)) return null;
  return {
    title: raw.title,
    body: raw.body,
    tag: typeof raw.tag === "string" ? raw.tag : undefined,
    data: isRecord(raw.data)
      ? {
          conversationId:
            typeof raw.data.conversationId === "string"
              ? raw.data.conversationId
              : undefined,
          url: typeof raw.data.url === "string" ? raw.data.url : undefined,
          ...(typeof raw.data.isGroup === "boolean"
            ? { isGroup: raw.data.isGroup }
            : {}),
        }
      : undefined,
    icon: safeImageUrl(raw.icon),
    image: safeImageUrl(raw.image),
    actions: safeActions(raw.actions),
    renotify: optionalBoolean(raw.renotify),
    vibrate: safeVibrate(raw.vibrate),
    requireInteraction: optionalBoolean(raw.requireInteraction),
    silent: optionalBoolean(raw.silent),
    l10n: safeL10n(raw.l10n),
    timestamp: safeTimestamp(raw.timestamp),
  };
}

/** Tag of the generic notification shown when a push cannot be read (ENG-234). */
export const FALLBACK_PUSH_TAG = "qp-fallback";

/**
 * The generic notification for a push this worker cannot read. It names
 * nothing, localizes through the same hidden-preview keys, and opens the app
 * root. A fresh object every call, because sw.ts spreads its `data`.
 */
export function createFallbackPush(): DirectMessagePush {
  return {
    title: "QueerPulse",
    body: "You have a new notification.",
    tag: FALLBACK_PUSH_TAG,
    data: { url: "/" },
    l10n: {
      titleKey: "push:preview.hidden.title",
      bodyKey: "push:preview.hidden.body",
    },
  };
}

/** The one method this module needs from a `PushMessageData`. */
export interface PushEventDataSource {
  json(): unknown;
}

export interface ReadPushEventPayloadResult {
  payload: DirectMessagePush;
  /** True when `payload` is the generic fallback from `createFallbackPush`. */
  isFallback: boolean;
}

/**
 * ENG-234: turn a push event's data into something that can always be shown.
 *
 * Every subscription is created with `userVisibleOnly: true`, a promise that
 * each push shows a notification. Chrome answers a push that shows nothing
 * with its own "This site has been updated in the background" notice, and can
 * revoke the permission after repeats. So a push with no data, a body that is
 * not JSON, or JSON that `toDirectMessagePush` rejects still produces the
 * generic fallback here instead of returning early.
 */
export function readPushEventPayload(
  eventData: PushEventDataSource | null | undefined,
): ReadPushEventPayloadResult {
  const fallback = { payload: createFallbackPush(), isFallback: true };
  if (!eventData) return fallback;
  let raw: unknown;
  try {
    raw = eventData.json();
  } catch {
    return fallback;
  }
  const payload = toDirectMessagePush(raw);
  return payload ? { payload, isFallback: false } : fallback;
}
