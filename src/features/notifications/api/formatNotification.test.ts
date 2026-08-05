import { beforeAll, describe, expect, it } from "vitest";
import { catalogs, loadNamespace, loadPtNamespace } from "../../../shared/i18n/catalogs";
import { parseKey, resolveEntry } from "../../../shared/i18n/translate";
import type {
  Catalog,
  Language,
  TFunction,
  TranslateOptions,
} from "../../../shared/i18n/types";
import {
  formatNotification,
  type NotificationKind,
} from "./formatNotification";

/**
 * The resolved `notifications` catalog per language. EN is eager, but PT's
 * `notifications` namespace is now lazily loaded (see catalogs/index.ts), so
 * `catalogs.pt.notifications` is an empty placeholder until its chunk resolves.
 * `beforeAll` swaps the real PT catalog in the same way the provider does.
 */
const resolvedCatalogs: Record<Language, Catalog> = {
  en: catalogs.en.notifications,
  pt: catalogs.pt.notifications,
};

beforeAll(async () => {
  resolvedCatalogs.en = await loadNamespace("en", "notifications");
  resolvedCatalogs.pt = await loadPtNamespace("notifications");
});

/**
 * A `t` bound to the real catalogs, so these tests fail if a key is missing
 * from `catalogs/<lang>/notifications.ts` rather than passing against a stub.
 * Mirrors the provider's resolution: `namespace:path` → catalog entry.
 */
function makeT(language: Language): TFunction {
  return (key: string, options?: TranslateOptions) => {
    const { path } = parseKey(key);
    const catalog = resolvedCatalogs[language];
    const hit = resolveEntry(catalog, path, language, options);
    // Surface a miss loudly instead of silently returning the key.
    if (hit === undefined) throw new Error(`missing key: ${key}`);
    return hit;
  };
}

const t = makeT("en");

/** Every kind the notifications centre knows how to render. `new_message` is
 * deliberately absent — DM alerts were retired from the centre (see the
 * "deprecated new_message" test below). */
const KINDS: NotificationKind[] = [
  "connection_request",
  "connection_accepted",
  "vouch_received",
  "promoted_to_member",
  "event_invite",
  "event_reminder",
  "waitlist_promoted",
  "event_cancelled",
  "event_updated",
  "introduction_made",
];

describe("formatNotification", () => {
  it.each(KINDS)("renders non-empty text + meta for %s", (kind) => {
    const result = formatNotification(kind, {}, t);
    expect(result.text.trim()).not.toBe("");
    expect(result.meta.trim()).not.toBe("");
    // The whole point: no raw key or enum value leaks into the UI.
    expect(result.text).not.toContain("notifications:");
    expect(result.text).not.toContain(kind);
  });

  it.each(KINDS)("resolves %s in Portuguese too", (kind) => {
    const result = formatNotification(kind, {}, makeT("pt"));
    expect(result.text.trim()).not.toBe("");
    expect(result.meta.trim()).not.toBe("");
  });

  it("gives each kind text distinct from the generic fallback", () => {
    const fallback = formatNotification("something_else", {}, t).text;
    for (const kind of KINDS) {
      expect(formatNotification(kind, {}, t).text).not.toBe(fallback);
    }
  });

  it("maps kinds onto the right tab category", () => {
    expect(formatNotification("event_invite", {}, t).category).toBe("events");
    expect(formatNotification("event_cancelled", {}, t).category).toBe(
      "events",
    );
    expect(formatNotification("vouch_received", {}, t).category).toBe(
      "community",
    );
    expect(formatNotification("connection_request", {}, t).category).toBe(
      "community",
    );
    expect(formatNotification("promoted_to_member", {}, t).category).toBe(
      "platform",
    );
  });

  it("treats the retired `new_message` kind as unknown, not a known kind", () => {
    // DM alerts no longer render in the notifications centre. `new_message` is
    // no longer a known kind, so it resolves to the generic fallback (and is
    // dropped from the live feed upstream in `useNotifications`).
    const result = formatNotification("new_message", {}, t);
    expect(result.kind).toBeNull();
    expect(result.text).toBe("You have a new notification.");
    expect(result.category).toBe("platform");
  });

  it("formats a mention as a community-category known kind", () => {
    const result = formatNotification("mention", { actorId: "u1" }, t);
    expect(result.category).toBe("community");
    expect(result.kind).toBe("mention");
  });

  // `mention` is deliberately out of the `KINDS` sweep above: that sweep asserts
  // `text` never contains the raw kind string, but the natural copy ("You were
  // *mention*ed…") contains "mention". So it gets the equivalent coverage here,
  // guarding against a raw-key leak via the `type.mention` key form instead.
  it("renders non-empty mention copy in both languages, distinct from the fallback", () => {
    const fallback = formatNotification("something_else", {}, t).text;
    for (const language of ["en", "pt"] as const) {
      const localized = makeT(language);
      const result = formatNotification("mention", { actorId: "u1" }, localized);
      expect(result.text.trim()).not.toBe("");
      expect(result.meta.trim()).not.toBe("");
      expect(result.text).not.toContain("notifications:");
      expect(result.text).not.toContain("type.mention");
    }
    expect(formatNotification("mention", {}, t).text).not.toBe(fallback);
  });

  describe("unknown / future types", () => {
    it("falls back to generic copy instead of a blank row", () => {
      const result = formatNotification("a_type_from_the_future", {}, t);
      expect(result.text).toBe("You have a new notification.");
      expect(result.meta).toBe("Notification");
      expect(result.category).toBe("platform");
    });

    it("never throws, whatever the type or payload", () => {
      const cases: [string, unknown][] = [
        ["", null],
        ["", undefined],
        ["unheard_of", {}],
        ["__proto__", { a: 1 }],
        ["toString", "not-an-object"],
        ["new_message", null],
        ["new_message", 42],
      ];
      for (const [type, payload] of cases) {
        expect(() => formatNotification(type, payload, t)).not.toThrow();
        expect(formatNotification(type, payload, t).text.trim()).not.toBe("");
      }
    });

    it("has a Portuguese fallback as well", () => {
      const result = formatNotification("unheard_of", {}, makeT("pt"));
      expect(result.text).toBe("Tens uma nova notificação.");
    });
  });

  it("passes scalar payload entries through as interpolation tokens", () => {
    // Today's copy uses no tokens, so this asserts the seam via a stub `t`
    // that echoes what it was handed.
    const spy: TFunction = (key, options) =>
      `${key}|${JSON.stringify(options)}`;
    const out = formatNotification(
      "event_reminder",
      { senderId: "abc", count: 2, nested: { deep: true } },
      spy,
    );
    expect(out.text).toContain('"senderId":"abc"');
    expect(out.text).toContain('"count":2');
    // Non-scalar payload entries are dropped — they can't be interpolated.
    expect(out.text).not.toContain("nested");
  });
});
