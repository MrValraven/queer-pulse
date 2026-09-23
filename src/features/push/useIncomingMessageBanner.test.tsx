import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mailboxesQueryKey } from "../../shared/api/mailboxViewer";
import type {
  AuthorSummary,
  MessageResponse,
} from "../../shared/contracts/contracts";
import type { ServerToClientEvents } from "../../shared/contracts/realtime";
import {
  isOwnSideOrClaimedByColleagueMessage,
  useIncomingMessageBanner,
} from "./useIncomingMessageBanner";

/**
 * Final review I1. `useIncomingMessageBanner` must never toast a message
 * already on the viewer's own side (a colleague's reply sent as a business
 * the viewer staffs), nor a customer message on a staffed mailbox thread a
 * colleague currently claims. Both used to slip through: the frame handler
 * ran no own-side or claim check at all before this fix.
 *
 * `useDemoMode`, `useAuth`, `useToast`, `useTranslation`, `useHidePushPreviews`
 * and the realtime hooks are mocked so the frame handler can be driven
 * directly and deterministically; `isFromViewerSide` and
 * `readStaffedIdentityIds` (from `shared/api/mailboxViewer`) run for real
 * against a seeded `QueryClient`, exactly as the hook uses them.
 */

type ConversationMessageFrame = ServerToClientEvents["conversation:message"];

const state = vi.hoisted(() => ({
  demoMode: false,
  myUserId: "user-me",
  myHandle: "me",
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: state.demoMode }),
}));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => ({
    user: { id: state.myUserId, profile: { slug: state.myHandle } },
  }),
}));

const showToast = vi.fn();
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}|${JSON.stringify(options)}` : key,
  }),
}));

vi.mock("../settings/api/useHidePushPreviews", () => ({
  useHidePushPreviews: () => ({ isHidingPreviews: false }),
}));

let capturedHandler: ((frame: ConversationMessageFrame) => void) | null = null;
vi.mock("../../shared/api/realtime", () => ({
  useRealtime: () => ({ getActiveConversationId: () => null }),
  useConversationMessageFrames: (
    handler: (frame: ConversationMessageFrame) => void,
  ) => {
    capturedHandler = handler;
  },
}));

const BUSINESS_MAILBOX_ID = "biz-1";
const COLLEAGUE_USER_ID = "user-colleague";

function makeSender(overrides: Partial<AuthorSummary>): AuthorSummary {
  return {
    handle: "sender-handle",
    displayName: "Sender",
    avatarUrl: null,
    ...overrides,
  };
}

function makeMessage(
  overrides: Partial<MessageResponse> & { sender: AuthorSummary },
): MessageResponse {
  return {
    id: "message-1",
    conversationId: "conversation-1",
    body: "hello",
    createdAt: "2026-09-22T10:00:00.000Z",
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

function setUpQueryClient(options: {
  conversationRow: Record<string, unknown>;
  staffedIdentityIds?: string[];
}) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(
    ["conversations", false, "", "some-scope"],
    [{ id: "conversation-1", name: "Thread", ...options.conversationRow }],
  );
  queryClient.setQueryData(
    mailboxesQueryKey(false),
    (options.staffedIdentityIds ?? []).map((identityId) => ({
      identityId,
      kind: "company",
    })),
  );
  return queryClient;
}

function renderBanner(queryClient: QueryClient) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/feed"]}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return renderHook(() => useIncomingMessageBanner(), { wrapper });
}

async function fireFrame(frame: ConversationMessageFrame) {
  await act(async () => {
    capturedHandler?.(frame);
    // Flush the microtasks `presentIncomingMessage` awaits (the cached-row
    // lookup) before assertions run.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

afterEach(() => {
  vi.clearAllMocks();
  capturedHandler = null;
  state.demoMode = false;
  state.myUserId = "user-me";
  state.myHandle = "me";
});

describe("isOwnSideOrClaimedByColleagueMessage", () => {
  const viewer = {
    myHandle: "me",
    staffedIdentityIds: new Set([BUSINESS_MAILBOX_ID]),
  };

  it("is true for a message sent as an identity the viewer staffs", () => {
    expect(
      isOwnSideOrClaimedByColleagueMessage({
        sender: { handle: "colleague", identityId: BUSINESS_MAILBOX_ID },
        viewer,
        mailboxIdentityId: BUSINESS_MAILBOX_ID,
        claimedByUserId: null,
        myUserId: "user-me",
      }),
    ).toBe(true);
  });

  it("is true for a customer message on a staffed thread a colleague claims", () => {
    expect(
      isOwnSideOrClaimedByColleagueMessage({
        sender: { handle: "customer-1" },
        viewer,
        mailboxIdentityId: BUSINESS_MAILBOX_ID,
        claimedByUserId: COLLEAGUE_USER_ID,
        myUserId: "user-me",
      }),
    ).toBe(true);
  });

  it("is false for a customer message on an unclaimed staffed thread", () => {
    expect(
      isOwnSideOrClaimedByColleagueMessage({
        sender: { handle: "customer-1" },
        viewer,
        mailboxIdentityId: BUSINESS_MAILBOX_ID,
        claimedByUserId: null,
        myUserId: "user-me",
      }),
    ).toBe(false);
  });

  it("is false for a customer message on a thread the viewer themself claims", () => {
    expect(
      isOwnSideOrClaimedByColleagueMessage({
        sender: { handle: "customer-1" },
        viewer,
        mailboxIdentityId: BUSINESS_MAILBOX_ID,
        claimedByUserId: "user-me",
        myUserId: "user-me",
      }),
    ).toBe(false);
  });
});

describe("useIncomingMessageBanner", () => {
  it("does not toast a colleague's reply sent as a business the viewer staffs", async () => {
    const queryClient = setUpQueryClient({
      conversationRow: { mailboxIdentityId: BUSINESS_MAILBOX_ID },
      staffedIdentityIds: [BUSINESS_MAILBOX_ID],
    });
    renderBanner(queryClient);

    await fireFrame({
      conversationId: "conversation-1",
      message: makeMessage({
        sender: makeSender({
          handle: "colleague",
          displayName: "Rui",
          identityId: BUSINESS_MAILBOX_ID,
        }),
      }),
    });

    expect(showToast).not.toHaveBeenCalled();
  });

  it("does not toast a customer message on a staffed thread a colleague claims", async () => {
    const queryClient = setUpQueryClient({
      conversationRow: {
        mailboxIdentityId: BUSINESS_MAILBOX_ID,
        claimedByUserId: COLLEAGUE_USER_ID,
      },
      staffedIdentityIds: [BUSINESS_MAILBOX_ID],
    });
    renderBanner(queryClient);

    await fireFrame({
      conversationId: "conversation-1",
      message: makeMessage({
        sender: makeSender({ handle: "customer-1", displayName: "Nuno" }),
      }),
    });

    expect(showToast).not.toHaveBeenCalled();
  });

  it("still toasts a customer message on an unclaimed staffed thread", async () => {
    const queryClient = setUpQueryClient({
      conversationRow: {
        mailboxIdentityId: BUSINESS_MAILBOX_ID,
        claimedByUserId: null,
      },
      staffedIdentityIds: [BUSINESS_MAILBOX_ID],
    });
    renderBanner(queryClient);

    await fireFrame({
      conversationId: "conversation-1",
      message: makeMessage({
        sender: makeSender({ handle: "customer-1", displayName: "Nuno" }),
      }),
    });

    expect(showToast).toHaveBeenCalledTimes(1);
  });

  it("still toasts a customer message on a thread the viewer themself claims", async () => {
    const queryClient = setUpQueryClient({
      conversationRow: {
        mailboxIdentityId: BUSINESS_MAILBOX_ID,
        claimedByUserId: "user-me",
      },
      staffedIdentityIds: [BUSINESS_MAILBOX_ID],
    });
    renderBanner(queryClient);

    await fireFrame({
      conversationId: "conversation-1",
      message: makeMessage({
        sender: makeSender({ handle: "customer-1", displayName: "Nuno" }),
      }),
    });

    expect(showToast).toHaveBeenCalledTimes(1);
  });
});
