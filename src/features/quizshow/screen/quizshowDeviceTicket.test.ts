import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearDeviceTicket,
  readDevicePairing,
  readDeviceTicket,
  readLastPairedSessionId,
  saveDeviceTicket,
  type QuizshowPairedClaim,
} from "./quizshowDeviceTicket";

const SESSION_ID = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";
const OTHER_SESSION_ID = "1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e";

const CLAIM: QuizshowPairedClaim = {
  status: "paired",
  deviceTicket: "header.payload.signature",
  sessionId: SESSION_ID,
  kind: "game",
  eventSlug: null,
  gameId: "g1",
};

describe("quizshowDeviceTicket", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it("stores the ticket in sessionStorage only and reads the whole pairing back", () => {
    saveDeviceTicket(CLAIM, "screen");
    expect(readDeviceTicket(SESSION_ID)).toBe(CLAIM.deviceTicket);
    expect(readDevicePairing(SESSION_ID)).toEqual(CLAIM);
    expect(readLastPairedSessionId()).toBe(SESSION_ID);
    expect(
      window.sessionStorage.getItem(`quizshow.deviceTicket.${SESSION_ID}`),
    ).toBe(CLAIM.deviceTicket);
    expect(window.localStorage.length).toBe(0);
  });

  it("reads a pairing back only for the device kind it was stored as", () => {
    saveDeviceTicket(CLAIM, "helper");
    expect(readDevicePairing(SESSION_ID, "screen")).toBeNull();
    expect(readDevicePairing(SESSION_ID, "helper")).toEqual(CLAIM);
    expect(readDevicePairing(SESSION_ID)).toEqual(CLAIM);
  });

  it("reads a malformed or incomplete stored pairing as none", () => {
    saveDeviceTicket(CLAIM, "screen");
    const pairingKey = `quizshow.devicePairing.${SESSION_ID}`;
    window.sessionStorage.setItem(pairingKey, "{not json");
    expect(readDevicePairing(SESSION_ID)).toBeNull();

    window.sessionStorage.setItem(
      pairingKey,
      JSON.stringify({ kind: "game", eventSlug: null, gameId: "g1" }),
    );
    expect(readDevicePairing(SESSION_ID)).toBeNull();

    window.sessionStorage.setItem(
      pairingKey,
      JSON.stringify({
        kind: "party",
        eventSlug: null,
        gameId: "g1",
        deviceKind: "screen",
      }),
    );
    expect(readDevicePairing(SESSION_ID)).toBeNull();

    window.sessionStorage.setItem(pairingKey, "null");
    expect(readDevicePairing(SESSION_ID)).toBeNull();
  });

  it("forgets the pairing, and the last-paired marker only when it pointed there", () => {
    saveDeviceTicket(CLAIM, "screen");
    saveDeviceTicket({ ...CLAIM, sessionId: OTHER_SESSION_ID }, "screen");
    clearDeviceTicket(SESSION_ID);
    expect(readDevicePairing(SESSION_ID)).toBeNull();
    expect(readLastPairedSessionId()).toBe(OTHER_SESSION_ID);

    clearDeviceTicket(OTHER_SESSION_ID);
    expect(readLastPairedSessionId()).toBeNull();
  });

  it("never throws when the storage itself throws", () => {
    const storageError = new DOMException("Blocked", "SecurityError");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw storageError;
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw storageError;
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw storageError;
    });
    expect(() => saveDeviceTicket(CLAIM, "screen")).not.toThrow();
    expect(readDeviceTicket(SESSION_ID)).toBeNull();
    expect(readDevicePairing(SESSION_ID, "screen")).toBeNull();
    expect(readLastPairedSessionId()).toBeNull();
    expect(() => clearDeviceTicket(SESSION_ID)).not.toThrow();
  });
});
