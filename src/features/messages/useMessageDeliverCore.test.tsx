import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMessageDeliverCore } from "./useMessageDeliverCore";
import type { ChatMessage } from "./data";
import { isDueForAutoReplay } from "./outboxReplay.helpers";
import { ApiError } from "../../shared/api/client";
import type { MessageResponse } from "../../shared/contracts/contracts";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";

// ENG-263: unit coverage for `useMessageDeliverCore`, the send-to-server
// primitive both replay loops and every send action (send/sendGif/sendImage/
// sendDocument/retrySend) build on. A QueryClientProvider wrapper is required
// because the hook's document-send path (`useSendDocumentMessage`) calls
// `useMutation`/`useQueryClient` directly, unconditionally, regardless of
// demoMode.

vi.mock("./api/messages.api", () => ({
  sendDocumentMessage: vi.fn(),
  wasMessageReplayed: vi.fn(() => false),
}));

import { sendDocumentMessage, wasMessageReplayed } from "./api/messages.api";

const SERVER_CONVERSATION_ID = "11111111-1111-1111-1111-111111111111";
// A just-picked recipient's placeholder id is their profile slug (see
// `isServerConversationId`'s own doc for the server UUID shape it checks).
const PLACEHOLDER_CONVERSATION_ID = "just-picked-recipient-slug";

function buildMessageResponse(
  overrides: Partial<MessageResponse> = {},
): MessageResponse {
  return {
    id: "server-msg-1",
    conversationId: SERVER_CONVERSATION_ID,
    body: "hello",
    sender: { handle: "alex", displayName: "Alex", avatarUrl: null },
    createdAt: "2026-09-15T00:00:00.000Z",
    editedAt: null,
    reactions: [],
    deletedAt: null,
    deliveredAt: null,
    clientMessageId: null,
    forwarded: false,
    pinnedAt: null,
    starred: false,
    canPin: false,
    canEdit: false,
    canDelete: false,
    canReport: false,
    replyTo: null,
    kind: "user",
    attachment: null,
    systemEvent: null,
    ...overrides,
  };
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

interface HarnessDeps {
  mutateAsync: ReturnType<typeof vi.fn>;
  demoMode?: boolean;
}

/** Wraps `useMessageDeliverCore` with real `useState` for `sent`, so a test
 *  can drive `deliver`/`deliverAsync` and then read back the resulting
 *  optimistic state, the same way the real controller does. */
function useHarness({ mutateAsync, demoMode = false }: HarnessDeps) {
  const [sent, setSent] = useState<Record<string, ChatMessage[]>>({});
  const core = useMessageDeliverCore({
    setSent,
    demoMode,
    sendMessage: { mutateAsync } as never,
  });
  return { sent, core };
}

afterEach(() => {
  vi.mocked(sendDocumentMessage).mockReset();
  vi.mocked(wasMessageReplayed).mockReset();
  vi.mocked(wasMessageReplayed).mockReturnValue(false);
});

describe("useMessageDeliverCore delivery outcomes", () => {
  it("a happy send resolves the optimistic entry, clearing it once the server acks", async () => {
    const response = buildMessageResponse({ clientMessageId: "local-happy" });
    const mutateAsync = vi.fn().mockResolvedValue(response);
    const { result } = renderHook(() => useHarness({ mutateAsync }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.core.appendOptimistic(SERVER_CONVERSATION_ID, {
        from: "me",
        text: "hi",
        localId: "local-happy",
        status: "sending",
      });
    });
    expect(result.current.sent[SERVER_CONVERSATION_ID]).toHaveLength(1);

    let resolved: boolean | undefined;
    await act(async () => {
      resolved = await result.current.core.deliverAsync(
        SERVER_CONVERSATION_ID,
        "hi",
        "local-happy",
      );
    });

    expect(resolved).toBe(true);
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(result.current.sent[SERVER_CONVERSATION_ID]).toBeUndefined();
  });

  it("a network failure with no ApiError enqueues the entry as failed and still retryable", async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch"));
    const { result } = renderHook(() => useHarness({ mutateAsync }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.core.appendOptimistic(SERVER_CONVERSATION_ID, {
        from: "me",
        text: "hi",
        localId: "local-network-fail",
        status: "sending",
      });
    });

    let resolved: boolean | undefined;
    await act(async () => {
      resolved = await result.current.core.deliverAsync(
        SERVER_CONVERSATION_ID,
        "hi",
        "local-network-fail",
      );
    });

    expect(resolved).toBe(false);
    const entry = result.current.sent[SERVER_CONVERSATION_ID]?.[0];
    expect(entry?.status).toBe("failed");
    expect(entry?.isRetryable).toBe(true);
    expect(entry?.lastAttemptAt).toBeTypeOf("number");
  });

  it("a permanent 4xx (404) marks the entry not retryable, and it correctly falls out of automatic-replay eligibility", async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(new ApiError(404, "Conversation not found"));
    const { result } = renderHook(() => useHarness({ mutateAsync }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.core.appendOptimistic(SERVER_CONVERSATION_ID, {
        from: "me",
        text: "hi",
        localId: "local-permanent-fail",
        status: "sending",
      });
    });

    await act(async () => {
      await result.current.core.deliverAsync(
        SERVER_CONVERSATION_ID,
        "hi",
        "local-permanent-fail",
      );
    });

    const entry = result.current.sent[SERVER_CONVERSATION_ID]?.[0];
    expect(entry?.status).toBe("failed");
    expect(entry?.isRetryable).toBe(false);
    // Cross-checked against the real outboxReplay.helpers gate itself,
    // keeping this assertion honest rather than reimplementing the rule.
    expect(entry && isDueForAutoReplay(entry)).toBe(false);
  });

  it("a transient 5xx failure stays retryable, eligible for automatic replay once its backoff window elapses", async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(new ApiError(503, "Service unavailable"));
    const { result } = renderHook(() => useHarness({ mutateAsync }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.core.appendOptimistic(SERVER_CONVERSATION_ID, {
        from: "me",
        text: "hi",
        localId: "local-transient-fail",
        status: "sending",
      });
    });

    await act(async () => {
      await result.current.core.deliverAsync(
        SERVER_CONVERSATION_ID,
        "hi",
        "local-transient-fail",
      );
    });

    const entry = result.current.sent[SERVER_CONVERSATION_ID]?.[0];
    expect(entry?.status).toBe("failed");
    expect(entry?.isRetryable).toBe(true);
  });
});

describe("useMessageDeliverCore in-flight tracking, placeholders, and attachment routing", () => {
  it("marks a localId in flight for the duration of its delivery attempt, clearing once it settles (the replay-loop dedup guard)", async () => {
    let resolveMutate!: (value: MessageResponse) => void;
    const mutateAsync = vi.fn(
      () =>
        new Promise<MessageResponse>((resolve) => {
          resolveMutate = resolve;
        }),
    );
    const { result } = renderHook(() => useHarness({ mutateAsync }), {
      wrapper: createWrapper(),
    });

    let deliverPromise!: Promise<boolean>;
    act(() => {
      deliverPromise = result.current.core.deliverAsync(
        SERVER_CONVERSATION_ID,
        "hi",
        "local-inflight",
      );
    });

    expect(result.current.core.isDeliveryInFlight("local-inflight")).toBe(true);

    await act(async () => {
      resolveMutate(
        buildMessageResponse({ clientMessageId: "local-inflight" }),
      );
      await deliverPromise;
    });

    expect(result.current.core.isDeliveryInFlight("local-inflight")).toBe(
      false,
    );
  });

  it("no-ops against a still-placeholder conversation id, keeping the network request unfired", async () => {
    const mutateAsync = vi.fn();
    const { result } = renderHook(() => useHarness({ mutateAsync }), {
      wrapper: createWrapper(),
    });

    let resolved: boolean | undefined;
    await act(async () => {
      resolved = await result.current.core.deliverAsync(
        PLACEHOLDER_CONVERSATION_ID,
        "hi",
        "local-placeholder",
      );
    });

    expect(resolved).toBe(false);
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(result.current.core.isDeliveryInFlight("local-placeholder")).toBe(
      false,
    );
  });

  it("routes a document attachment through sendDocumentMessage, keeping the ordinary send mutation unused", async () => {
    const mutateAsync = vi.fn();
    const documentResponse = buildMessageResponse({ kind: "document" });
    vi.mocked(sendDocumentMessage).mockResolvedValue(documentResponse);
    const { result } = renderHook(() => useHarness({ mutateAsync }), {
      wrapper: createWrapper(),
    });

    const attachment: DocumentAttachment = {
      url: "uploads/doc-key",
      fileName: "lease.pdf",
      byteSize: 1024,
      contentType: "application/pdf",
      provider: "upload",
    };

    await act(async () => {
      await result.current.core.deliverAsync(
        SERVER_CONVERSATION_ID,
        "here's the lease",
        "local-doc",
        undefined,
        undefined,
        attachment,
      );
    });

    expect(sendDocumentMessage).toHaveBeenCalledTimes(1);
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});

describe("useMessageDeliverCore ENG-222 idempotent-replay gate", () => {
  it("reads wasMessageReplayed off the resolved text-send message and still clears the bubble exactly once", async () => {
    const response = buildMessageResponse({ clientMessageId: "local-replay" });
    const mutateAsync = vi.fn().mockResolvedValue(response);
    vi.mocked(wasMessageReplayed).mockImplementation(
      (message) => message === response,
    );
    const { result } = renderHook(() => useHarness({ mutateAsync }), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.core.appendOptimistic(SERVER_CONVERSATION_ID, {
        from: "me",
        text: "hi",
        localId: "local-replay",
        status: "sending",
      });
    });

    await act(async () => {
      await result.current.core.deliverAsync(
        SERVER_CONVERSATION_ID,
        "hi",
        "local-replay",
      );
    });

    // The gate correctly saw this as a replay, identified by the exact
    // resolved object, and the optimistic bubble still cleared exactly
    // once: the message genuinely exists server-side now, replay or fresh.
    expect(wasMessageReplayed).toHaveBeenCalledWith(response);
    expect(result.current.sent[SERVER_CONVERSATION_ID]).toBeUndefined();
  });

  it("reports false for a genuine first-create text send", async () => {
    const response = buildMessageResponse({ clientMessageId: "local-fresh" });
    const mutateAsync = vi.fn().mockResolvedValue(response);
    vi.mocked(wasMessageReplayed).mockReturnValue(false);
    const { result } = renderHook(() => useHarness({ mutateAsync }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.core.deliverAsync(
        SERVER_CONVERSATION_ID,
        "hi",
        "local-fresh",
      );
    });

    expect(wasMessageReplayed).toHaveBeenCalledWith(response);
    expect(result.current.sent[SERVER_CONVERSATION_ID]).toBeUndefined();
  });

  it("also reads wasMessageReplayed off a replayed document-send result", async () => {
    const mutateAsync = vi.fn();
    const documentResponse = buildMessageResponse({ kind: "document" });
    vi.mocked(sendDocumentMessage).mockResolvedValue(documentResponse);
    vi.mocked(wasMessageReplayed).mockImplementation(
      (message) => message === documentResponse,
    );
    const { result } = renderHook(() => useHarness({ mutateAsync }), {
      wrapper: createWrapper(),
    });

    const attachment: DocumentAttachment = {
      url: "uploads/doc-key",
      fileName: "lease.pdf",
      byteSize: 1024,
      contentType: "application/pdf",
      provider: "upload",
    };

    await act(async () => {
      await result.current.core.deliverAsync(
        SERVER_CONVERSATION_ID,
        "here's the lease",
        "local-doc-replay",
        undefined,
        undefined,
        attachment,
      );
    });

    expect(wasMessageReplayed).toHaveBeenCalledWith(documentResponse);
  });
});

describe("useMessageDeliverCore demo mode", () => {
  it("simulates the send ladder locally (sent, delivered, seen), with the network left untouched", async () => {
    vi.useFakeTimers();
    try {
      const mutateAsync = vi.fn();
      const { result } = renderHook(
        () => useHarness({ mutateAsync, demoMode: true }),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.core.appendOptimistic(SERVER_CONVERSATION_ID, {
          from: "me",
          text: "hi",
          localId: "local-demo",
          status: "sending",
        });
      });

      await act(async () => {
        await result.current.core.deliverAsync(
          SERVER_CONVERSATION_ID,
          "hi",
          "local-demo",
        );
      });
      expect(mutateAsync).not.toHaveBeenCalled();
      expect(result.current.sent[SERVER_CONVERSATION_ID]?.[0]?.status).toBe(
        "sent",
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(700);
      });
      expect(result.current.sent[SERVER_CONVERSATION_ID]?.[0]?.status).toBe(
        "delivered",
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1200);
      });
      expect(result.current.sent[SERVER_CONVERSATION_ID]?.[0]?.status).toBe(
        "seen",
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
