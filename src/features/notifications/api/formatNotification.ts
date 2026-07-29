import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import type { NotifType } from "../notifications.types";

/**
 * The notification kinds the backend's `notifications_type_enum` can serve
 * (`src/notifications/entities/notification.entity.ts`). This mirrors a backend
 * enum across a repo boundary with no mechanical link, so treat it as a
 * best-effort hint, never an exhaustive guarantee — see `formatNotification`.
 */
export type NotificationKind =
  | "connection_request"
  | "connection_accepted"
  | "vouch_received"
  | "promoted_to_member"
  | "new_message"
  | "event_invite"
  | "event_reminder"
  | "waitlist_promoted"
  | "event_cancelled"
  | "introduction_made"
  | "mention";

/** The i18n key root used when `type` is one we don't know how to render. */
const FALLBACK_KEY = "unknown";

/**
 * Which UI tab/icon each backend kind belongs to. The backend's ten semantic
 * kinds collapse into the four categories the prototype's tabs filter on.
 */
const KIND_CATEGORY: Record<NotificationKind, NotifType> = {
  connection_request: "community",
  connection_accepted: "community",
  vouch_received: "community",
  introduction_made: "community",
  mention: "community",
  promoted_to_member: "platform",
  new_message: "messages",
  event_invite: "events",
  event_reminder: "events",
  waitlist_promoted: "events",
  event_cancelled: "events",
};

/** Every kind we have copy for. Anything else routes to the fallback. */
const KNOWN_KINDS = Object.keys(KIND_CATEGORY) as NotificationKind[];

function isKnownKind(type: string): type is NotificationKind {
  return (KNOWN_KINDS as string[]).includes(type);
}

export interface FormattedNotification {
  /** The row's display text, already translated into the active language. */
  text: string;
  /** The row's sub-line ("Private message", "Gathering invitation", …). */
  meta: string;
  /** The tab/icon category this kind renders under. */
  category: NotifType;
  /** The recognised backend kind, or `null` for an unknown/future type. Lets
   *  callers build the personalized `type.<kind>.textNamed` variant without
   *  re-deriving the type→kind mapping that lives here. */
  kind: NotificationKind | null;
}

/**
 * Narrow a raw jsonb payload to the scalar entries that are safe to feed
 * `t()` as `{token}` interpolation values.
 *
 * The backend's payloads currently carry only opaque IDs (`senderId`,
 * `eventId`, …) and no display names, so today's catalog strings deliberately
 * contain no tokens and this yields nothing. It is the forward seam: if the
 * backend later enriches a payload with, say, `senderName`, the catalog string
 * can start using `{senderName}` with no change here.
 */
function interpolationTokens(payload: unknown): TranslateOptions {
  if (typeof payload !== "object" || payload === null) return {};
  const tokens: TranslateOptions = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string" || typeof value === "number") {
      tokens[key] = value;
    }
  }
  return tokens;
}

/**
 * Resolve the i18n subkey a `mention` notification's copy lives under.
 *
 * `mention` rows carry `payload.entityKind` (`member | community | business |
 * event | thread`, written by the backend) identifying what was actually
 * @-mentioned. The flat `mention.*` keys stay the **member** variant — both
 * because that's the plain "you were mentioned" case and for backward
 * compatibility with rows created before `entityKind` existed (no field →
 * falls through to `mention`). Any other kind branches to its own
 * `mention.<entityKind>.*` keys. Non-`mention` types pass through unchanged.
 */
function mentionKeyFor(type: string, payload: unknown): string {
  if (type !== "mention") return type;
  const entityKind = (payload as { entityKind?: string } | null)?.entityKind;
  return entityKind && entityKind !== "member"
    ? `mention.${entityKind}`
    : "mention";
}

/**
 * Render a backend notification (`type` + structured `payload`) into display
 * text, through i18n keys rather than hardcoded English — this is why the
 * formatting lives on the frontend at all: it keeps the API language-neutral
 * so Portuguese stays possible.
 *
 * An unknown or future `type` resolves to a safe generic fallback: never a
 * blank row, never a throw. That matters because the backend's enum can grow a
 * member (or an old client can meet a new server) without a frontend deploy.
 */
export function formatNotification(
  type: string,
  payload: unknown,
  t: TFunction,
): FormattedNotification {
  const known = isKnownKind(type);
  const key = known ? mentionKeyFor(type, payload) : FALLBACK_KEY;
  const tokens = interpolationTokens(payload);
  return {
    text: t(`notifications:type.${key}.text`, tokens),
    meta: t(`notifications:type.${key}.meta`, tokens),
    category: known ? KIND_CATEGORY[type] : "platform",
    kind: known ? type : null,
  };
}
