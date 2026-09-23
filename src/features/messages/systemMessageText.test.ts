import { describe, expect, it } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import type { ChatSystemEvent } from "./data";
import {
  normalizeSystemEventType,
  systemMessageText,
} from "./systemMessageText";

/** Echoes the chosen key and its params, so each test pins WHICH catalog
 *  entry the builder picked without depending on the catalog's wording. */
const echo: TFunction = (key, options) =>
  options && Object.keys(options).length > 0
    ? `${key} ${JSON.stringify(options)}`
    : key;

function event(overrides: Partial<ChatSystemEvent>): ChatSystemEvent {
  return {
    type: "moved_to_business_mailbox",
    actorName: "Tiago Costa",
    targetName: null,
    value: "11111111-1111-4111-8111-111111111111",
    ...overrides,
  };
}

describe("systemMessageText, business mailboxes", () => {
  it("renders a neutral line with no actor for a thread moved into the business mailbox", () => {
    expect(systemMessageText(event({}), echo)).toBe(
      "messages:system.movedToBusinessMailbox",
    );
  });

  it("stays neutral for the owner too: there is no viewer-relative variant", () => {
    expect(systemMessageText(event({ actorIsMe: true }), echo)).toBe(
      "messages:system.movedToBusinessMailbox",
    );
  });

  it("interpolates no actor at all, so swapping the actor changes nothing", () => {
    const withOneActor = systemMessageText(
      event({ actorName: "Tiago Costa" }),
      echo,
    );
    const withAnotherActor = systemMessageText(
      event({ actorName: "A Different Person Entirely" }),
      echo,
    );
    expect(withOneActor).toBe("messages:system.movedToBusinessMailbox");
    expect(withOneActor).toBe(withAnotherActor);
  });

  it("renders an unknown event neutrally and never as someone leaving", () => {
    const text = systemMessageText(event({ type: "unknown" }), echo);
    expect(text).toBe("messages:system.unknownEvent");
    expect(text).not.toContain("memberLeft");
  });
});

describe("normalizeSystemEventType", () => {
  it("keeps every type this client knows", () => {
    expect(normalizeSystemEventType("group_created")).toBe("group_created");
    expect(normalizeSystemEventType("moved_to_business_mailbox")).toBe(
      "moved_to_business_mailbox",
    );
  });

  it("folds a type this client has never seen into the neutral fallback", () => {
    expect(normalizeSystemEventType("listing_transferred")).toBe("unknown");
  });
});

describe("systemMessageText, the named moved note", () => {
  it("names the business the thread moved into, with no actor", () => {
    expect(systemMessageText(event({ mailboxName: "Café Lisboa" }), echo)).toBe(
      'messages:system.movedToNamedBusinessMailbox {"business":"Café Lisboa"}',
    );
  });

  it("stays identical whoever the actor is", () => {
    const asOwner = systemMessageText(
      event({
        mailboxName: "Café Lisboa",
        actorName: "Tiago Costa",
        actorIsMe: true,
      }),
      echo,
    );
    const asBusiness = systemMessageText(
      event({
        mailboxName: "Café Lisboa",
        actorName: "Café Lisboa",
        actorIsMe: false,
      }),
      echo,
    );
    expect(asOwner).toBe(asBusiness);
  });

  it("falls back to the unnamed note when the event carries no business name", () => {
    expect(systemMessageText(event({}), echo)).toBe(
      "messages:system.movedToBusinessMailbox",
    );
  });
});
