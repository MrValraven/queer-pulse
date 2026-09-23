import { describe, expect, it } from "vitest";
import {
  type ShownPushCopyInput,
  decideCoalesce,
  resolveShownPushCopy,
  sumAppBadgeCount,
} from "./pushCoalesce";

describe("sumAppBadgeCount", () => {
  it("is 0 with nothing on screen", () => {
    expect(sumAppBadgeCount([])).toBe(0);
  });

  it("sums the coalesced count of every message notification", () => {
    expect(
      sumAppBadgeCount([
        { tag: "c1", data: { conversationId: "c1", count: 3 } },
        { tag: "c2", data: { conversationId: "c2", count: 2 } },
      ]),
    ).toBe(5);
  });

  it("counts a message notification without a usable count as 1", () => {
    expect(
      sumAppBadgeCount([
        { tag: "c1", data: { conversationId: "c1" } },
        { tag: "c2", data: { conversationId: "c2", count: "4" } },
        { tag: "c3", data: { conversationId: "c3", count: -2 } },
      ]),
    ).toBe(3);
  });

  it("ignores notifications that are not about a conversation", () => {
    expect(
      sumAppBadgeCount([
        { tag: "notification:1", data: { url: "/notifications" } },
        { tag: "qp-fallback", data: { url: "/" } },
        { tag: "c0", data: { conversationId: "", count: 9 } },
        { tag: "none", data: null },
        {},
        { tag: "c1", data: { conversationId: "c1", count: 2 } },
      ]),
    ).toBe(2);
  });

  it("leaves out the notification with the excluded tag", () => {
    expect(
      sumAppBadgeCount(
        [
          { tag: "c1", data: { conversationId: "c1", count: 3 } },
          { tag: "c2", data: { conversationId: "c2", count: 2 } },
        ],
        "c1",
      ),
    ).toBe(2);
  });
});

describe("resolveShownPushCopy", () => {
  const single = { count: 1, coalesced: false };
  const burst = { count: 3, coalesced: true };

  function input(overrides: Partial<ShownPushCopyInput>): ShownPushCopyInput {
    return {
      payload: {
        title: "Ana",
        body: "see you at eight",
        data: { conversationId: "c1", url: "/messages?c=c1" },
      },
      lang: "en",
      isDirectMessagePush: true,
      decision: single,
      shouldHidePreviews: false,
      ...overrides,
    };
  }

  const groupPayload = {
    title: "Terrace crew",
    body: "Bo: the terrace is booked",
    data: { conversationId: "g1", url: "/messages?c=g1", isGroup: true },
  };

  it("renders a single message push from its own copy", () => {
    expect(resolveShownPushCopy(input({}))).toEqual({
      title: "Ana",
      body: "see you at eight",
    });
  });

  it("renders a DM burst as 'new messages from' the sender", () => {
    expect(resolveShownPushCopy(input({ decision: burst }))).toEqual({
      title: "Ana",
      body: "3 new messages from Ana",
    });
  });

  it("renders a group burst as 'new messages in' the group, in EN and PT", () => {
    expect(
      resolveShownPushCopy(input({ payload: groupPayload, decision: burst })),
    ).toEqual({
      title: "Terrace crew",
      body: "3 new messages in Terrace crew",
    });
    expect(
      resolveShownPushCopy(
        input({ payload: groupPayload, decision: burst, lang: "pt" }),
      ),
    ).toEqual({
      title: "Terrace crew",
      body: "3 novas mensagens em Terrace crew",
    });
  });

  it("renders a single group push from its own copy", () => {
    expect(resolveShownPushCopy(input({ payload: groupPayload }))).toEqual({
      title: "Terrace crew",
      body: "Bo: the terrace is booked",
    });
  });

  it("localizes an attachment-only message from its l10n key", () => {
    expect(
      resolveShownPushCopy(
        input({
          lang: "pt",
          payload: {
            title: "Ana",
            body: "Photo",
            l10n: { bodyKey: "push:messages.attachment.photo" },
            data: { conversationId: "c1" },
          },
        }),
      ),
    ).toEqual({ title: "Ana", body: "Foto" });
  });

  it("hides a single message behind the message-specific generic copy", () => {
    expect(resolveShownPushCopy(input({ shouldHidePreviews: true }))).toEqual({
      title: "QueerPulse",
      body: "You have a new message.",
    });
  });

  it("keeps the burst count when previews are hidden, naming nobody", () => {
    expect(
      resolveShownPushCopy(
        input({
          payload: groupPayload,
          decision: burst,
          shouldHidePreviews: true,
        }),
      ),
    ).toEqual({ title: "QueerPulse", body: "3 new messages." });
    expect(
      resolveShownPushCopy(
        input({ decision: burst, shouldHidePreviews: true, lang: "pt" }),
      ),
    ).toEqual({ title: "QueerPulse", body: "3 mensagens novas." });
  });

  it("keeps the generic notification copy for pushes that are not messages", () => {
    expect(
      resolveShownPushCopy(
        input({
          isDirectMessagePush: false,
          shouldHidePreviews: true,
          payload: { title: "Ana", body: "Ana wants to connect with you." },
        }),
      ),
    ).toEqual({ title: "QueerPulse", body: "You have a new notification." });
  });

  it("treats a burst of server-hidden message pushes as hidden", () => {
    expect(
      resolveShownPushCopy(
        input({
          decision: burst,
          payload: {
            title: "QueerPulse",
            body: "You have a new message.",
            l10n: {
              titleKey: "push:preview.hidden.title",
              bodyKey: "push:preview.hidden.message",
            },
            data: { conversationId: "c1" },
          },
        }),
      ),
    ).toEqual({ title: "QueerPulse", body: "3 new messages." });
  });

  it("never prints 'in QueerPulse' for a server-hidden group burst", () => {
    const serverHiddenGroupPayload = {
      title: "QueerPulse",
      body: "You have a new message.",
      l10n: {
        titleKey: "push:preview.hidden.title",
        bodyKey: "push:preview.hidden.message",
      },
      data: { conversationId: "g1", url: "/messages?c=g1", isGroup: true },
    };
    expect(
      resolveShownPushCopy(
        input({ payload: serverHiddenGroupPayload, decision: burst }),
      ),
    ).toEqual({ title: "QueerPulse", body: "3 new messages." });
    expect(
      resolveShownPushCopy(
        input({
          payload: serverHiddenGroupPayload,
          decision: burst,
          lang: "pt",
        }),
      ),
    ).toEqual({ title: "QueerPulse", body: "3 mensagens novas." });
    expect(
      resolveShownPushCopy(input({ payload: serverHiddenGroupPayload })),
    ).toEqual({ title: "QueerPulse", body: "You have a new message." });
  });

  it("treats any push:preview.hidden body key on a message push as hidden", () => {
    expect(
      resolveShownPushCopy(
        input({
          decision: burst,
          payload: {
            title: "QueerPulse",
            body: "You have a new notification.",
            l10n: {
              titleKey: "push:preview.hidden.title",
              bodyKey: "push:preview.hidden.body",
            },
            data: { conversationId: "g1", isGroup: true },
          },
        }),
      ),
    ).toEqual({ title: "QueerPulse", body: "3 new messages." });
  });
});

describe("resolveShownPushCopy: staff attribution", () => {
  it("names the business, never one staff member, on a coalesced burst", () => {
    const copy = resolveShownPushCopy({
      payload: {
        title: "Café Lisboa",
        body: "See you Saturday",
        l10n: {
          titleKey: "push:messages.staffTitle",
          params: { name: "Rui", business: "Café Lisboa" },
        },
        data: { conversationId: "c1" },
      } as never,
      lang: "en",
      isDirectMessagePush: true,
      decision: { count: 3, coalesced: true },
      shouldHidePreviews: false,
    });
    expect(copy.title).toBe("Café Lisboa");
    expect(copy.body).toBe("3 new messages from Café Lisboa");
  });
});

describe("decideCoalesce", () => {
  it("returns count 1 and coalesced=false when there is no existing notification", () => {
    expect(decideCoalesce([])).toEqual({ count: 1, coalesced: false });
  });

  it("increments from an existing notification's stored count", () => {
    expect(decideCoalesce([{ data: { count: 2 } }])).toEqual({
      count: 3,
      coalesced: true,
    });
  });

  it("treats an existing notification with no stored count as count 1 (increments to 2)", () => {
    expect(decideCoalesce([{ data: {} }])).toEqual({
      count: 2,
      coalesced: true,
    });
    expect(decideCoalesce([{ data: null }])).toEqual({
      count: 2,
      coalesced: true,
    });
    expect(decideCoalesce([{}])).toEqual({ count: 2, coalesced: true });
  });

  it("ignores a malformed stored count (non-number, negative, non-finite)", () => {
    expect(decideCoalesce([{ data: { count: "3" } }])).toEqual({
      count: 2,
      coalesced: true,
    });
    expect(decideCoalesce([{ data: { count: -1 } }])).toEqual({
      count: 2,
      coalesced: true,
    });
    expect(decideCoalesce([{ data: { count: NaN } }])).toEqual({
      count: 2,
      coalesced: true,
    });
  });

  it("only reads the first existing notification (tag lookup normally returns at most one)", () => {
    expect(
      decideCoalesce([{ data: { count: 5 } }, { data: { count: 99 } }]),
    ).toEqual({ count: 6, coalesced: true });
  });
});
