import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "../../../test/msw/server";
import { API, API_V1 } from "../../../test/msw/handlers";
import type { AuthorSummary } from "../../../shared/contracts/contracts";
import type { ClaimState } from "../../../shared/api/conversationClaim";
import type { Conversation } from "../data";
import type {
  ClaimResponse,
  ReleaseClaimResponse,
  TakeOverClaimResponse,
} from "./mailboxes.api";
import type { ConversationResponse } from "./messages.api";

const MY_USER_ID = "user-tiago";
const RUI_USER_ID = "user-rui";
const ANA_USER_ID = "user-ana";
const THREAD_ID = "thread-cafe-1";
const LIST_KEY = ["conversations", false, "", "identity-cafe"] as const;

const apiMocks = vi.hoisted(() => ({
  claimConversation: vi.fn(),
  takeOverConversation: vi.fn(),
  releaseConversation: vi.fn(),
}));

vi.mock("./mailboxes.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./mailboxes.api")>()),
  ...apiMocks,
}));

vi.mock("../../../shared/api/claimCache", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../shared/api/claimCache")>();
  return {
    ...actual,
    patchConversationClaim: vi.fn(actual.patchConversationClaim),
  };
});

vi.mock("../../../app/providers/authContext", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/authContext")
  >()),
  useAuth: () => ({
    user: {
      id: MY_USER_ID,
      profile: { slug: "tiago", firstName: "Tiago", lastName: "Costa" },
    },
    loggedIn: true,
    checking: false,
    status: "active",
  }),
}));

const rui: AuthorSummary = {
  handle: "rui",
  displayName: "Rui Marçal",
  avatarUrl: null,
};
const ana: AuthorSummary = {
  handle: "ana",
  displayName: "Ana Lopes",
  avatarUrl: null,
};
const me: AuthorSummary = {
  handle: "tiago",
  displayName: "Tiago Costa",
  avatarUrl: null,
};
const ruiClaimant = { handle: "rui", name: "Rui Marçal", firstName: "Rui" };
const anaClaimant = { handle: "ana", name: "Ana Lopes", firstName: "Ana" };
const myClaimant = { handle: "tiago", name: "Tiago Costa", firstName: "Tiago" };

function claimResponse(
  claimedBy: AuthorSummary | null,
  claimedByUserId: string | null,
): ClaimResponse {
  return {
    claimedByUserId,
    isNewlyClaimed: claimedByUserId === MY_USER_ID,
    claimedBy,
    claimedAt: claimedBy ? "2026-09-22T10:00:00.000Z" : null,
  };
}

function seatedRow(claim: Partial<ClaimState> = {}): Conversation {
  return {
    id: THREAD_ID,
    name: "Fátima Mendes",
    initials: "FM",
    tint: "coral",
    pronouns: "she/her",
    connectedSince: "",
    time: "",
    preview: "",
    unread: false,
    messages: [],
    mailboxIdentityId: "identity-cafe",
    mailboxSeatIdentityId: "identity-cafe",
    claimedBy: null,
    claimedByUserId: null,
    claimedAt: null,
    claimTakenOverFrom: null,
    ...claim,
  };
}

/** A deferred promise, so a test can act while a request is in flight. */
function deferred<Value>() {
  let resolve: (value: Value) => void = () => {};
  const promise = new Promise<Value>((resolveWith) => {
    resolve = resolveWith;
  });
  return { promise, resolve };
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  vi.doUnmock("../Composer");
  server.resetHandlers();
  vi.unstubAllEnvs();
  window.localStorage.clear();
});
afterAll(() => server.close());

beforeEach(() => {
  window.localStorage.clear();
  apiMocks.claimConversation.mockReset();
  apiMocks.takeOverConversation.mockReset();
  apiMocks.releaseConversation.mockReset();
});

/** Live mode (demo with `isLive` false): re-import every module that reads
 *  `VITE_API_URL`, and the claim cache with them, so the test shares the
 *  hook's frame counter. */
async function loadProviders(isLive = true) {
  vi.resetModules();
  if (isLive) vi.stubEnv("VITE_API_URL", API);
  const { useConversationClaim } = await import("./useConversationClaim");
  const claimCache = await import("../../../shared/api/claimCache");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const { ToastProvider } =
    await import("../../../shared/components/feedback/ToastProvider");
  const { DeletedConversationsProvider } =
    await import("../../../app/providers/DeletedConversationsProvider");
  const { useTranslation } =
    await import("../../../shared/i18n/useTranslation");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>
          <DeletedConversationsProvider>
            <ToastProvider>{children}</ToastProvider>
          </DeletedConversationsProvider>
        </DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useConversationClaim, useTranslation, claimCache, client, wrapper };
}

async function renderClaim(row: Conversation, isLive = true) {
  const loaded = await loadProviders(isLive);
  loaded.client.setQueryData(LIST_KEY, [row]);
  const { result: probe } = renderHook(
    () => ({
      actions: loaded.useConversationClaim(row),
      translate: loaded.useTranslation().t,
    }),
    { wrapper: loaded.wrapper },
  );
  // The messages catalog loads lazily: wait for it, so each toast renders
  // its copy.
  await waitFor(() =>
    expect(probe.current.translate("messages:mailbox.claim.claim")).toBe(
      "Claim",
    ),
  );
  const result = {
    get current() {
      return probe.current.actions;
    },
  };
  const readRow = () =>
    loaded.client.getQueryData<Conversation[]>(LIST_KEY)?.[0];
  return { ...loaded, result, readRow };
}

describe("useConversationClaim (live mode)", () => {
  it("claims a thread it wins and says so", async () => {
    apiMocks.claimConversation.mockResolvedValue(claimResponse(me, MY_USER_ID));
    const { result, readRow } = await renderClaim(seatedRow());
    await act(() => result.current.claim());
    expect(apiMocks.claimConversation).toHaveBeenCalledWith(THREAD_ID);
    expect(readRow()?.claimedBy).toEqual(myClaimant);
    expect(readRow()?.claimedByUserId).toBe(MY_USER_ID);
    expect(
      await screen.findByText("You're handling this conversation"),
    ).toBeInTheDocument();
  });

  it("shows the colleague who won a lost claim", async () => {
    apiMocks.claimConversation.mockResolvedValue(
      claimResponse(rui, RUI_USER_ID),
    );
    const { result, readRow } = await renderClaim(seatedRow());
    await act(() => result.current.claim());
    expect(readRow()?.claimedBy).toEqual(ruiClaimant);
    expect(readRow()?.claimedByUserId).toBe(RUI_USER_ID);
    expect(
      await screen.findByText("Someone on your team got there first"),
    ).toBeInTheDocument();
  });

  it("keeps a claim frame that landed while the claim was in flight", async () => {
    const response = deferred<ClaimResponse>();
    apiMocks.claimConversation.mockReturnValue(response.promise);
    const { result, readRow, claimCache, client } =
      await renderClaim(seatedRow());
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.claim();
    });
    const anaState: ClaimState = {
      claimedBy: anaClaimant,
      claimedByUserId: ANA_USER_ID,
      claimedAt: "2026-09-22T10:01:00.000Z",
      claimTakenOverFrom: null,
    };
    claimCache.recordClaimFrame(THREAD_ID);
    claimCache.patchConversationClaim(client, THREAD_ID, anaState);
    await act(async () => {
      response.resolve(claimResponse(me, MY_USER_ID));
      await pending;
    });
    expect(readRow()?.claimedBy).toEqual(anaClaimant);
    expect(readRow()?.claimedByUserId).toBe(ANA_USER_ID);
    // The frame's patch stays the last write: the late response wrote none.
    expect(claimCache.patchConversationClaim).toHaveBeenLastCalledWith(
      client,
      THREAD_ID,
      anaState,
    );
  });

  it("releases a thread and says so", async () => {
    const released: ReleaseClaimResponse = {
      ...claimResponse(null, null),
      isNewlyClaimed: false,
      isReleased: true,
    };
    apiMocks.releaseConversation.mockResolvedValue(released);
    const { result, readRow } = await renderClaim(
      seatedRow({ claimedBy: myClaimant, claimedByUserId: MY_USER_ID }),
    );
    await act(() => result.current.release());
    expect(apiMocks.releaseConversation).toHaveBeenCalledWith(THREAD_ID);
    expect(readRow()?.claimedBy).toBeNull();
    expect(readRow()?.claimedByUserId).toBeNull();
    expect(
      await screen.findByText("Released for your team"),
    ).toBeInTheDocument();
  });

  it("names the colleague who took the thread over before a release landed", async () => {
    const notReleased: ReleaseClaimResponse = {
      ...claimResponse(rui, RUI_USER_ID),
      isNewlyClaimed: false,
      isReleased: false,
    };
    apiMocks.releaseConversation.mockResolvedValue(notReleased);
    const { result, readRow } = await renderClaim(
      seatedRow({ claimedBy: myClaimant, claimedByUserId: MY_USER_ID }),
    );
    await act(() => result.current.release());
    expect(readRow()?.claimedBy).toEqual(ruiClaimant);
    expect(await screen.findByText("Rui is handling this")).toBeInTheDocument();
  });

  it("takes over a REST-loaded row from the claimant's cached user id in one request", async () => {
    const { conversationToView } = await import("./messages.adapters");
    const restRow = conversationToView(
      {
        id: THREAD_ID,
        kind: "direct",
        type: "dm",
        unreadCount: 0,
        updatedAt: "2026-09-22T09:00:00.000Z",
        members: [],
        memberPreview: [],
        memberCount: 0,
        lastMessage: null,
        otherParticipant: {
          handle: "fatima",
          displayName: "Fátima Mendes",
          avatarUrl: null,
        },
        mailboxIdentityId: "identity-cafe",
        claimedBy: rui,
        claimedByUserId: RUI_USER_ID,
        claimedAt: "2026-09-22T09:00:00.000Z",
        claimTakenOverFrom: null,
        claimReleasedBy: null,
        claimReleasedAt: null,
      } as unknown as ConversationResponse,
      (key: string) => key,
    );
    expect(restRow.claimedByUserId).toBe(RUI_USER_ID);
    const takenOver: TakeOverClaimResponse = {
      ...claimResponse(me, MY_USER_ID),
      previousClaimant: rui,
    };
    apiMocks.takeOverConversation.mockResolvedValue(takenOver);
    const { result, readRow } = await renderClaim({
      ...restRow,
      mailboxSeatIdentityId: "identity-cafe",
    });
    await act(() => result.current.takeOver());
    expect(apiMocks.claimConversation).not.toHaveBeenCalled();
    expect(apiMocks.takeOverConversation).toHaveBeenCalledTimes(1);
    expect(apiMocks.takeOverConversation).toHaveBeenCalledWith(
      THREAD_ID,
      RUI_USER_ID,
    );
    expect(readRow()?.claimedBy).toEqual(myClaimant);
    expect(readRow()?.claimTakenOverFrom).toEqual(ruiClaimant);
    expect(
      await screen.findByText("You took over from Rui"),
    ).toBeInTheDocument();
  });

  it("shows whoever holds the thread when a take-over lost its race", async () => {
    const notTaken: TakeOverClaimResponse = {
      ...claimResponse(ana, ANA_USER_ID),
      previousClaimant: null,
    };
    apiMocks.takeOverConversation.mockResolvedValue(notTaken);
    const { result, readRow } = await renderClaim(
      seatedRow({ claimedBy: ruiClaimant, claimedByUserId: RUI_USER_ID }),
    );
    await act(() => result.current.takeOver());
    expect(apiMocks.takeOverConversation).toHaveBeenCalledWith(
      THREAD_ID,
      RUI_USER_ID,
    );
    expect(readRow()?.claimedBy).toEqual(anaClaimant);
    expect(
      await screen.findByText("Someone on your team got there first"),
    ).toBeInTheDocument();
  });

  it("rolls back and drops the lost mailbox on IDENTITY_NOT_STAFF", async () => {
    const { result, readRow, client } = await renderClaim(seatedRow());
    // Imported after the module reset, so it is the class the hook checks.
    const { ApiError } = await import("../../../shared/api/client");
    apiMocks.claimConversation.mockRejectedValue(
      new ApiError(403, "Forbidden", { code: "IDENTITY_NOT_STAFF" }),
    );
    const invalidate = vi.spyOn(client, "invalidateQueries");
    await act(() => result.current.claim());
    expect(readRow()?.claimedBy).toBeNull();
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["conversations-unread-count", "mailboxes"],
    });
    expect(
      await screen.findByText("That didn't go through. Try again."),
    ).toBeInTheDocument();
  });
});

describe("useConversationClaim (live mode, removed persona)", () => {
  it("refetches the mailboxes on IDENTITY_REMOVED", async () => {
    const { result, readRow, client } = await renderClaim(
      seatedRow({ claimedBy: myClaimant, claimedByUserId: MY_USER_ID }),
    );
    const { ApiError } = await import("../../../shared/api/client");
    apiMocks.releaseConversation.mockRejectedValue(
      new ApiError(403, "Forbidden", { code: "IDENTITY_REMOVED" }),
    );
    const invalidate = vi.spyOn(client, "invalidateQueries");
    await act(() => result.current.release());
    expect(readRow()?.claimedBy).toEqual(myClaimant);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["conversations-unread-count", "mailboxes"],
    });
  });
});

describe("useConversationClaim (demo mode)", () => {
  it("applies the claim locally and never touches the network", async () => {
    const { result, readRow } = await renderClaim(seatedRow(), false);
    await act(() => result.current.claim());
    expect(apiMocks.claimConversation).not.toHaveBeenCalled();
    expect(readRow()?.claimedBy?.handle).toBe("tiago");
  });
});

describe("the send path (live mode)", () => {
  it("never claims after a reply; the server claims with the message", async () => {
    server.use(
      http.get(`${API_V1}/identities/mailboxes`, () => HttpResponse.json([])),
    );
    const loaded = await loadProviders();
    // The composer itself is stubbed to one send button: this test pins the
    // dock's send wiring, which is the one place a claim could be added.
    vi.doMock("../Composer", () => ({
      Composer: ({ onSend }: { onSend: (body: string) => void }) => (
        <button type="button" onClick={() => onSend("Yes, step-free!")}>
          Send
        </button>
      ),
    }));
    const { ComposerDockContent } = await import("../ComposerDockContent");
    const { AttachmentQueueProvider } =
      await import("../AttachmentQueueContext");
    const onSend = vi.fn();
    const Wrapper = loaded.wrapper;
    render(
      <Wrapper>
        <AttachmentQueueProvider
          onSendGif={() => {}}
          onSendImage={() => {}}
          onSendDocument={() => {}}
        >
          <ComposerDockContent
            active={seatedRow()}
            onSend={onSend}
            blocked={false}
            showJumpPill={false}
            newMessagesCount={0}
            onJumpToLatest={() => {}}
          />
        </AttachmentQueueProvider>
      </Wrapper>,
    );
    expect(
      await screen.findByText("Replying as Unnamed mailbox"),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith("Yes, step-free!");
    expect(apiMocks.claimConversation).not.toHaveBeenCalled();
    expect(apiMocks.takeOverConversation).not.toHaveBeenCalled();
  });
});
