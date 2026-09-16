import { describe, expect, it } from "vitest";
import {
  FALLBACK_PUSH_TAG,
  readPushEventPayload,
  toDirectMessagePush,
} from "./pushPayload";

describe("toDirectMessagePush: data.isGroup", () => {
  const base = { title: "Terrace crew", body: "Bo: hi" };

  it("keeps a boolean isGroup", () => {
    expect(
      toDirectMessagePush({
        ...base,
        data: { conversationId: "g1", isGroup: true },
      })?.data?.isGroup,
    ).toBe(true);
    expect(
      toDirectMessagePush({
        ...base,
        data: { conversationId: "c1", isGroup: false },
      })?.data?.isGroup,
    ).toBe(false);
  });

  it("drops a non-boolean isGroup and leaves the key absent", () => {
    const result = toDirectMessagePush({
      ...base,
      data: { conversationId: "g1", isGroup: "true" },
    });
    expect(result?.data).not.toHaveProperty("isGroup");
    expect(
      toDirectMessagePush({ ...base, data: { conversationId: "c1" } })?.data,
    ).not.toHaveProperty("isGroup");
  });
});

describe("readPushEventPayload", () => {
  const expectedFallback = {
    payload: {
      title: "QueerPulse",
      body: "You have a new notification.",
      tag: FALLBACK_PUSH_TAG,
      data: { url: "/" },
      l10n: {
        titleKey: "push:preview.hidden.title",
        bodyKey: "push:preview.hidden.body",
      },
    },
    isFallback: true,
  };

  it("falls back when the push carries no data", () => {
    expect(readPushEventPayload(null)).toEqual(expectedFallback);
    expect(readPushEventPayload(undefined)).toEqual(expectedFallback);
  });

  it("falls back when the data is not JSON", () => {
    expect(
      readPushEventPayload({
        json: () => {
          throw new SyntaxError("Unexpected token");
        },
      }),
    ).toEqual(expectedFallback);
  });

  it("falls back when the validator rejects the payload", () => {
    expect(readPushEventPayload({ json: () => ({ body: "hi" }) })).toEqual(
      expectedFallback,
    );
    expect(readPushEventPayload({ json: () => "just a string" })).toEqual(
      expectedFallback,
    );
  });

  it("uses the tag qp-fallback", () => {
    expect(FALLBACK_PUSH_TAG).toBe("qp-fallback");
  });

  it("returns a fresh fallback object every time", () => {
    const first = readPushEventPayload(null).payload;
    const second = readPushEventPayload(null).payload;
    expect(first).not.toBe(second);
    expect(first.data).not.toBe(second.data);
  });

  it("passes a valid payload through untouched", () => {
    const result = readPushEventPayload({
      json: () => ({ title: "Ana", body: "hi", tag: "c1" }),
    });
    expect(result.isFallback).toBe(false);
    expect(result.payload.title).toBe("Ana");
    expect(result.payload.tag).toBe("c1");
  });
});

describe("toDirectMessagePush", () => {
  it("accepts a minimal valid payload", () => {
    expect(toDirectMessagePush({ title: "Ana", body: "hi" })).toEqual({
      title: "Ana",
      body: "hi",
      tag: undefined,
      data: undefined,
      icon: undefined,
      image: undefined,
      actions: undefined,
      renotify: undefined,
      vibrate: undefined,
      requireInteraction: undefined,
      silent: undefined,
    });
  });

  it("rejects a missing/empty title", () => {
    expect(toDirectMessagePush({ title: "", body: "hi" })).toBeNull();
    expect(toDirectMessagePush({ body: "hi" })).toBeNull();
  });

  it("passes through data.conversationId and data.url", () => {
    const result = toDirectMessagePush({
      title: "Ana",
      body: "hi",
      tag: "c1",
      data: { conversationId: "c1", url: "/messages?c=c1" },
    });
    expect(result?.data).toEqual({
      conversationId: "c1",
      url: "/messages?c=c1",
    });
  });
});

describe("toDirectMessagePush — rich fields", () => {
  const base = { title: "Ana", body: "hi" };

  it("accepts an https icon and a leading-slash icon", () => {
    expect(
      toDirectMessagePush({ ...base, icon: "https://cdn/a.png" })?.icon,
    ).toBe("https://cdn/a.png");
    expect(toDirectMessagePush({ ...base, icon: "/icons/x.png" })?.icon).toBe(
      "/icons/x.png",
    );
  });

  it("drops an unsafe icon (javascript:, http:, protocol-relative)", () => {
    for (const bad of [
      "javascript:alert(1)",
      "http://x/a.png",
      "//evil/a.png",
      "data:image/png;base64,x",
    ]) {
      expect(toDirectMessagePush({ ...base, icon: bad })?.icon).toBeUndefined();
    }
  });

  it("keeps at most two whitelisted actions and drops malformed ones", () => {
    expect(
      toDirectMessagePush({
        ...base,
        actions: [{ action: "view", title: "View" }],
      })?.actions,
    ).toEqual([{ action: "view", title: "View" }]);
    // unknown action id -> whole actions field dropped
    expect(
      toDirectMessagePush({
        ...base,
        actions: [{ action: "delete", title: "X" }],
      })?.actions,
    ).toBeUndefined();
    // more than two -> dropped
    expect(
      toDirectMessagePush({
        ...base,
        actions: [
          { action: "view", title: "a" },
          { action: "view", title: "b" },
          { action: "view", title: "c" },
        ],
      })?.actions,
    ).toBeUndefined();
  });

  it("validates vibrate as an array of small non-negative numbers", () => {
    expect(
      toDirectMessagePush({ ...base, vibrate: [80, 40, 80] })?.vibrate,
    ).toEqual([80, 40, 80]);
    expect(
      toDirectMessagePush({ ...base, vibrate: [-1] })?.vibrate,
    ).toBeUndefined();
    expect(
      toDirectMessagePush({ ...base, vibrate: "buzz" })?.vibrate,
    ).toBeUndefined();
  });

  it("passes booleans through and defaults them to undefined", () => {
    expect(
      toDirectMessagePush({
        ...base,
        renotify: true,
        requireInteraction: true,
        silent: false,
      }),
    ).toMatchObject({
      renotify: true,
      requireInteraction: true,
      silent: false,
    });
    expect(
      toDirectMessagePush({ ...base, renotify: "yes" })?.renotify,
    ).toBeUndefined();
  });

  it("accepts an https image and drops an unsafe one", () => {
    expect(
      toDirectMessagePush({ ...base, image: "https://cdn/cover.jpg" })?.image,
    ).toBe("https://cdn/cover.jpg");
    expect(
      toDirectMessagePush({ ...base, image: "javascript:x" })?.image,
    ).toBeUndefined();
  });
});

describe("toDirectMessagePush — l10n", () => {
  const base = { title: "Ana", body: "hi" };

  it("accepts a full l10n block (titleKey, bodyKey, params)", () => {
    expect(
      toDirectMessagePush({
        ...base,
        l10n: {
          titleKey: "push:connection.request.title",
          bodyKey: "push:connection.request.body",
          params: { name: "Ana" },
        },
      })?.l10n,
    ).toEqual({
      titleKey: "push:connection.request.title",
      bodyKey: "push:connection.request.body",
      params: { name: "Ana" },
    });
  });

  it("accepts a bodyKey-only block (no titleKey/params)", () => {
    expect(
      toDirectMessagePush({
        ...base,
        l10n: { bodyKey: "push:event.reminder.body" },
      })?.l10n,
    ).toEqual({ bodyKey: "push:event.reminder.body" });
  });

  it("is absent when the payload carries no l10n", () => {
    expect(toDirectMessagePush(base)?.l10n).toBeUndefined();
  });

  it("drops the whole block when a key doesn't start with 'push:'", () => {
    expect(
      toDirectMessagePush({ ...base, l10n: { bodyKey: "evil:injected" } })
        ?.l10n,
    ).toBeUndefined();
  });

  it("drops the whole block when a key exceeds the length cap", () => {
    expect(
      toDirectMessagePush({
        ...base,
        l10n: { bodyKey: `push:${"x".repeat(200)}` },
      })?.l10n,
    ).toBeUndefined();
  });

  it("drops the whole block when params has a non-string value", () => {
    expect(
      toDirectMessagePush({
        ...base,
        l10n: {
          bodyKey: "push:connection.request.body",
          params: { count: 3 },
        },
      })?.l10n,
    ).toBeUndefined();
  });

  it("drops the whole block when params exceeds the key-count cap", () => {
    const tooManyParams = Object.fromEntries(
      Array.from({ length: 20 }, (_, index) => [`k${index}`, "v"]),
    );
    expect(
      toDirectMessagePush({
        ...base,
        l10n: { bodyKey: "push:test.body", params: tooManyParams },
      })?.l10n,
    ).toBeUndefined();
  });

  it("drops the whole block when l10n itself isn't an object", () => {
    expect(
      toDirectMessagePush({ ...base, l10n: "push:test.body" })?.l10n,
    ).toBeUndefined();
  });

  it("otherwise still accepts the rest of a payload with a malformed l10n block", () => {
    const result = toDirectMessagePush({
      ...base,
      l10n: { bodyKey: "not-a-push-key" },
    });
    expect(result?.title).toBe("Ana");
    expect(result?.body).toBe("hi");
    expect(result?.l10n).toBeUndefined();
  });
});

describe("toDirectMessagePush — timestamp", () => {
  const base = { title: "Ana", body: "hi" };

  it("accepts a finite non-negative epoch-ms timestamp", () => {
    expect(
      toDirectMessagePush({ ...base, timestamp: 1_700_000_000_000 })?.timestamp,
    ).toBe(1_700_000_000_000);
    expect(toDirectMessagePush({ ...base, timestamp: 0 })?.timestamp).toBe(0);
  });

  it("is absent when the payload carries no timestamp", () => {
    expect(toDirectMessagePush(base)?.timestamp).toBeUndefined();
  });

  it("drops a negative timestamp", () => {
    expect(
      toDirectMessagePush({ ...base, timestamp: -1 })?.timestamp,
    ).toBeUndefined();
  });

  it("drops a non-finite timestamp (NaN, Infinity)", () => {
    expect(
      toDirectMessagePush({ ...base, timestamp: NaN })?.timestamp,
    ).toBeUndefined();
    expect(
      toDirectMessagePush({ ...base, timestamp: Infinity })?.timestamp,
    ).toBeUndefined();
  });

  it("drops a non-numeric timestamp", () => {
    expect(
      toDirectMessagePush({ ...base, timestamp: "1700000000000" })?.timestamp,
    ).toBeUndefined();
  });
});
