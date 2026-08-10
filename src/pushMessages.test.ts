import { describe, expect, it } from "vitest";
import { formatPushCopy } from "./pushMessages";

describe("formatPushCopy", () => {
  const base = { title: "Ana", body: "hi" };

  it("resolves a known key in EN with params interpolated", () => {
    expect(
      formatPushCopy(
        {
          ...base,
          l10n: {
            titleKey: "push:connection.request.title",
            bodyKey: "push:connection.request.body",
            params: { name: "Ana" },
          },
        },
        "en",
      ),
    ).toEqual({
      title: "New connection request",
      body: "Ana wants to connect with you.",
    });
  });

  it("resolves the same key in PT", () => {
    expect(
      formatPushCopy(
        {
          ...base,
          l10n: {
            titleKey: "push:connection.request.title",
            bodyKey: "push:connection.request.body",
            params: { name: "Ana" },
          },
        },
        "pt",
      ),
    ).toEqual({
      title: "Novo pedido de ligação",
      body: "Ana quer ligar-se a ti.",
    });
  });

  it("falls back to the plain title/body when there is no l10n block", () => {
    expect(formatPushCopy(base, "pt")).toEqual({ title: "Ana", body: "hi" });
  });

  it("falls back to the plain title/body when the key isn't in the catalog", () => {
    expect(
      formatPushCopy(
        { ...base, l10n: { bodyKey: "push:does.not.exist" } },
        "en",
      ),
    ).toEqual({ title: "Ana", body: "hi" });
  });

  it("leaves an unknown token intact rather than blanking it", () => {
    expect(
      formatPushCopy(
        {
          ...base,
          l10n: {
            bodyKey: "push:connection.request.body",
            params: {},
          },
        },
        "en",
      ).body,
    ).toBe("{name} wants to connect with you.");
  });

  it("supports mixed title-only / body-only l10n, resolving only the given side", () => {
    const result = formatPushCopy(
      { ...base, l10n: { bodyKey: "push:test.body" } },
      "en",
    );
    expect(result.title).toBe("Ana"); // plain fallback — no titleKey given
    expect(result.body).toBe("This is a test — your notifications are working.");
  });

  it("resolves the messages.coalesced count/name summary", () => {
    expect(
      formatPushCopy(
        {
          ...base,
          l10n: {
            bodyKey: "push:messages.coalesced",
            params: { count: "3", name: "Priya" },
          },
        },
        "en",
      ).body,
    ).toBe("3 new messages from Priya");
  });
});
