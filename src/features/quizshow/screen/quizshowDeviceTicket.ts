import type {
  QuizshowPairedDeviceKind,
  QuizshowPairingClaim,
  QuizshowScopeKind,
} from "../../../shared/contracts/quizshow";

/**
 * A paired TV's or helper's device ticket (contract 6.5), kept for this tab
 * only: `sessionStorage`, so closing the tab forgets the pairing and a reload
 * reattaches. Every storage access sits in try/catch, since a private window
 * or blocked site data can make the storage itself throw.
 */
export type QuizshowPairedClaim = Extract<
  QuizshowPairingClaim,
  { status: "paired" }
>;

const TICKET_KEY_PREFIX = "quizshow.deviceTicket.";
const PAIRING_KEY_PREFIX = "quizshow.devicePairing.";
const LAST_PAIRING_KEY = "quizshow.devicePairing.last";

/** What the pairing key holds beside the ticket: where the device belongs and what it is. */
interface StoredDevicePairing {
  kind: QuizshowScopeKind;
  eventSlug: string | null;
  gameId: string | null;
  /** A TV screen or a helper remote, so each page reattaches only its own kind. */
  deviceKind: QuizshowPairedDeviceKind;
}

function readItem(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeItem(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage refused: the pairing lasts until this page unloads.
  }
}

function removeItem(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Storage refused: nothing was stored to remove.
  }
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function parseStoredPairing(raw: string | null): StoredDevicePairing | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { kind, eventSlug, gameId, deviceKind } = parsed as Record<
      string,
      unknown
    >;
    if (kind !== "event" && kind !== "game") return null;
    if (deviceKind !== "screen" && deviceKind !== "helper") return null;
    if (!isNullableString(eventSlug) || !isNullableString(gameId)) return null;
    return { kind, eventSlug, gameId, deviceKind };
  } catch {
    return null;
  }
}

/** The stored ticket for `sessionId`, or null. */
export function readDeviceTicket(sessionId: string): string | null {
  const ticket = readItem(`${TICKET_KEY_PREFIX}${sessionId}`);
  return ticket !== null && ticket.length > 0 ? ticket : null;
}

/** Stores the ticket, where the device belongs, what kind of device it is and
 *  which session this tab paired with last. */
export function saveDeviceTicket(
  claim: QuizshowPairedClaim,
  deviceKind: QuizshowPairedDeviceKind,
): void {
  const storedPairing: StoredDevicePairing = {
    kind: claim.kind,
    eventSlug: claim.eventSlug,
    gameId: claim.gameId,
    deviceKind,
  };
  writeItem(`${TICKET_KEY_PREFIX}${claim.sessionId}`, claim.deviceTicket);
  writeItem(
    `${PAIRING_KEY_PREFIX}${claim.sessionId}`,
    JSON.stringify(storedPairing),
  );
  writeItem(LAST_PAIRING_KEY, claim.sessionId);
}

/**
 * The whole stored pairing for `sessionId`; null when the ticket or its scope
 * is missing or unreadable, or when `deviceKind` is given and the stored
 * device is the other kind (a helper's pairing never reattaches a TV).
 */
export function readDevicePairing(
  sessionId: string,
  deviceKind?: QuizshowPairedDeviceKind,
): QuizshowPairedClaim | null {
  const deviceTicket = readDeviceTicket(sessionId);
  if (deviceTicket === null) return null;
  const storedPairing = parseStoredPairing(
    readItem(`${PAIRING_KEY_PREFIX}${sessionId}`),
  );
  if (storedPairing === null) return null;
  if (deviceKind !== undefined && storedPairing.deviceKind !== deviceKind) {
    return null;
  }
  return {
    status: "paired",
    deviceTicket,
    sessionId,
    kind: storedPairing.kind,
    eventSlug: storedPairing.eventSlug,
    gameId: storedPairing.gameId,
  };
}

/** Forgets the pairing for `sessionId`, and the last-paired marker when it pointed there. */
export function clearDeviceTicket(sessionId: string): void {
  removeItem(`${TICKET_KEY_PREFIX}${sessionId}`);
  removeItem(`${PAIRING_KEY_PREFIX}${sessionId}`);
  if (readItem(LAST_PAIRING_KEY) === sessionId) removeItem(LAST_PAIRING_KEY);
}

/** The session the last pairing on this tab joined; null when none. */
export function readLastPairedSessionId(): string | null {
  const sessionId = readItem(LAST_PAIRING_KEY);
  return sessionId !== null && sessionId.length > 0 ? sessionId : null;
}
