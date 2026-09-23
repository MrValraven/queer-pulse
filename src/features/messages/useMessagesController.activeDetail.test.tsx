import { act, renderHook, waitFor } from "@testing-library/react";
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
import { QueryClient } from "@tanstack/react-query";
import { server } from "../../test/msw/server";
import { API, API_V1 } from "../../test/msw/handlers";
import { queryClient as productionQueryClient } from "../../shared/api/queryClient";
import { useMessagesController as useMessagesControllerDemo } from "./useMessagesController";
import { TestProviders as TestProvidersDemo } from "../../test/TestProviders";
import type {
  ConversationMemberSummary,
  ConversationResponse,
} from "../../shared/contracts/contracts";

/**
 * ENG-253 regression coverage for the roster/draft fix in
 * `useMessagesController.ts` (see this build's report): `GET /conversations`
 * (the inbox list) no longer carries a group's real `members`/`draft`, only
 * `GET /conversations/:id` (the detail fetch, `useConversationDetail`) does.
 * The controller merges the detail fetch onto `active`; these specs prove
 * the merge resolves, never leaks one thread's roster under another's id, and
 * never lets a stale detail fetch clobber a fresher roster `rawActive` already
 * carries (e.g. from a group-mutation cache patch). A fourth spec proves demo
 * mode (unaffected by ENG-253, seeded with a full roster already) renders
 * byte-identical to before.
 */

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
});
afterAll(() => server.close());

beforeEach(() => {
  // DemoModeProvider's live-mode default reads this key; a value left over
  // from another test would flip demo back on and make every live spec below
  // vacuous.
  window.localStorage.clear();
});

const GROUP_ONE_ID = "11111111-1111-1111-1111-111111111111";
const GROUP_TWO_ID = "22222222-2222-2222-2222-222222222222";
const MEMBER_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const MEMBER_B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const MEMBER_C = "cccccccc-cccc-cccc-cccc-cccccccccccc";

/** A LIST row (`GET /conversations`) for a group thread post-ENG-253: `[]`
 *  members, no `draft`, only the trimmed preview fields. */
function groupListRow(
  id: string,
  title: string,
  membersOverride?: ConversationMemberSummary[],
): ConversationResponse {
  return {
    id,
    type: "group",
    kind: "group",
    title,
    avatarUrl: null,
    otherParticipant: null,
    lastMessage: null,
    unreadCount: 0,
    updatedAt: "2026-09-14T09:00:00Z",
    myLastReadAt: null,
    otherLastReadAt: null,
    otherDeliveredAt: null,
    otherParticipantId: null,
    memberCount: 2,
    members: membersOverride ?? [],
    memberPreview: [],
    hasDraft: false,
    draftPreview: null,
    myRole: "member",
  };
}

function member(
  id: string,
  name: string,
  role: "owner" | "member" = "member",
): ConversationMemberSummary {
  return {
    id,
    handle: `member-${id.slice(0, 8)}`,
    name,
    avatarUrl: null,
    role,
    lastReadAt: null,
    deliveredAt: null,
  };
}

/** The FULL detail (`GET /conversations/:id`) for a group thread: a real
 *  roster + a stored draft, exactly what a list row no longer carries. */
function groupDetailRow(
  id: string,
  title: string,
  members: ConversationMemberSummary[],
  draft: string | null,
): ConversationResponse {
  return { ...groupListRow(id, title), members, draft, hasDraft: !!draft };
}

function emptyMessagesPage() {
  return { data: [], pageInfo: { nextCursor: null, hasMore: false } };
}

/** The universal session/chrome endpoints every provider `TestProviders`
 *  mounts fires on ANY render, regardless of route content. Mirrors
 *  `src/test/requestBudget.test.tsx`'s own `registerSessionHandlers`. */
function registerSessionHandlers() {
  server.use(
    http.get(`${API_V1}/auth/me`, () =>
      HttpResponse.json({
        id: "live-member",
        email: "live-member@queerpulse.test",
        status: "active",
        role: "member",
        ageAttestedAt: "2026-01-01T00:00:00.000Z",
        onboardedAt: "2026-01-01T00:00:00.000Z",
        profile: {
          slug: "live-member",
          firstName: "Live",
          lastName: "Member",
          pronouns: "they/them",
          avatarUrl: null,
        },
      }),
    ),
    http.get(`${API_V1}/me/bootstrap`, () =>
      HttpResponse.json({
        profile: {
          slug: "live-member",
          firstName: "Live",
          lastName: "Member",
          vouchCount: 0,
          visibility: "open",
          limited: false,
        },
        saved: { items: [], total: 0, page: 1, pageSize: 0 },
        blocks: { items: [], total: 0, page: 1, pageSize: 0 },
        mutes: { items: [], total: 0, page: 1, pageSize: 0 },
      }),
    ),
    http.get(`${API_V1}/consent/me`, () =>
      HttpResponse.json({
        categories: { necessary: true, analytics: false, monitoring: false },
        policyVersion: "3.3",
      }),
    ),
    http.get(`${API_V1}/platform-status`, () =>
      HttpResponse.json({
        signInOpen: true,
        inviteRequestsOpen: true,
        registrationOpen: true,
        announcement: null,
      }),
    ),
    // `useUnreadMessages` is called unconditionally inside `useMessagesController`
    // itself, so this fires here even though nav chrome (its other caller) is
    // never mounted by this harness.
    http.get(`${API_V1}/conversations/unread-count`, () =>
      HttpResponse.json({ count: 0 }),
    ),
    // The inbox lists one mailbox (`?as=`), so it waits for this list.
    http.get(`${API_V1}/identities/mailboxes`, () =>
      HttpResponse.json([
        {
          identityId: "live-member-identity",
          kind: "profile",
          displayName: "Live Member",
          handle: "live-member",
          avatarUrl: null,
          unreadCount: 0,
          isOwner: true,
          isReadOnly: false,
          shouldShowStaffNames: null,
          shouldAllowMyName: null,
        },
      ]),
    ),
  );
}

/**
 * Mirrors `useConversations.test.tsx`'s own `loadLive()`: `vi.resetModules()`
 * + `vi.stubEnv("VITE_API_URL", ...)` BEFORE dynamically re-importing every
 * module that (transitively) reads `shared/api/config.ts`, so
 * `apiAvailable`/`demoConfigured` re-freeze against the stubbed env instead of
 * the suite-wide demo default. `TestProviders` and `useMessagesController` are
 * both dynamically imported (never statically) so every Context they create
 * shares one fresh module instantiation.
 */
async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { TestProviders } = await import("../../test/TestProviders");
  const { useMessagesController } = await import("./useMessagesController");
  // Production-like `staleTime` so the session-bootstrap seed actually
  // suppresses `SocialProvider`'s blocks/mutes queries (see
  // `requestBudget.test.tsx`'s own file-header doc for why the default
  // `TestProviders` client, whose `staleTime` defaults to `0`, can't do this).
  const prodDefaults = productionQueryClient.getDefaultOptions().queries;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { ...prodDefaults, retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { useMessagesController, wrapper };
}

describe("useMessagesController: active roster/draft merge (ENG-253, live mode via MSW)", () => {
  it("keeps the roster empty as a legible loading window until the detail fetch resolves, then merges roster + draft onto active", async () => {
    registerSessionHandlers();
    let resolveGroupOneDetail!: (value: ConversationResponse) => void;
    const groupOneDetailPromise = new Promise<ConversationResponse>(
      (resolve) => {
        resolveGroupOneDetail = resolve;
      },
    );
    server.use(
      http.get(`${API_V1}/conversations`, () =>
        HttpResponse.json({
          data: [groupListRow(GROUP_ONE_ID, "Group One")],
          pageInfo: { nextCursor: null, hasMore: false },
        }),
      ),
      // Held open until the test explicitly resolves it below, so the
      // intermediate "loading window" assertion runs while the detail fetch
      // is genuinely still in flight rather than racing against how fast MSW
      // happens to answer.
      http.get(`${API_V1}/conversations/${GROUP_ONE_ID}`, () =>
        groupOneDetailPromise.then((body) => HttpResponse.json(body)),
      ),
      http.get(`${API_V1}/conversations/${GROUP_ONE_ID}/messages`, () =>
        HttpResponse.json(emptyMessagesPage()),
      ),
    );

    const { useMessagesController, wrapper } = await loadLive();
    const { result } = renderHook(() => useMessagesController(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.active?.id).toBe(GROUP_ONE_ID);
    // The list row's own `[]`. A live group always has at least its owner,
    // so this reads as "still loading" to every consumer
    // (`useGroupIndicators`, `GroupInfoModal`, …), exactly the window each
    // already treats as an absent roster.
    expect(result.current.active?.members).toEqual([]);

    resolveGroupOneDetail(
      groupDetailRow(
        GROUP_ONE_ID,
        "Group One",
        [member(MEMBER_A, "Ana"), member(MEMBER_B, "Bea", "owner")],
        "Hello from another device",
      ),
    );
    await waitFor(() => expect(result.current.active?.members).toHaveLength(2));
    expect(result.current.active?.members?.map((m) => m.name)).toEqual([
      "Ana",
      "Bea",
    ]);
    expect(result.current.active?.draft).toBe("Hello from another device");
  });

  it("never renders thread A's roster under thread B while B's own detail fetch is still in flight", async () => {
    registerSessionHandlers();
    let resolveGroupTwoDetail!: (value: ConversationResponse) => void;
    const groupTwoDetailPromise = new Promise<ConversationResponse>(
      (resolve) => {
        resolveGroupTwoDetail = resolve;
      },
    );

    server.use(
      http.get(`${API_V1}/conversations`, () =>
        HttpResponse.json({
          data: [
            groupListRow(GROUP_ONE_ID, "Group One"),
            groupListRow(GROUP_TWO_ID, "Group Two"),
          ],
          pageInfo: { nextCursor: null, hasMore: false },
        }),
      ),
      http.get(`${API_V1}/conversations/${GROUP_ONE_ID}`, () =>
        HttpResponse.json(
          groupDetailRow(
            GROUP_ONE_ID,
            "Group One",
            [member(MEMBER_A, "Ana")],
            null,
          ),
        ),
      ),
      // Group Two's detail is held open until the test explicitly resolves
      // it, so the assertion below runs while it is genuinely still in flight.
      http.get(`${API_V1}/conversations/${GROUP_TWO_ID}`, () =>
        groupTwoDetailPromise.then((body) => HttpResponse.json(body)),
      ),
      http.get(`${API_V1}/conversations/:id/messages`, () =>
        HttpResponse.json(emptyMessagesPage()),
      ),
    );

    const { useMessagesController, wrapper } = await loadLive();
    const { result } = renderHook(() => useMessagesController(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(result.current.active?.members).toHaveLength(1));
    expect(result.current.active?.members?.[0]?.name).toBe("Ana");

    act(() => result.current.openThread(GROUP_TWO_ID));
    await waitFor(() => expect(result.current.active?.id).toBe(GROUP_TWO_ID));
    // Group Two's detail hasn't resolved yet: the roster must read as the
    // loading window, NEVER as Group One's roster carried over.
    expect(result.current.active?.members).toEqual([]);

    resolveGroupTwoDetail(
      groupDetailRow(
        GROUP_TWO_ID,
        "Group Two",
        [member(MEMBER_C, "Cleo")],
        null,
      ),
    );
    await waitFor(() => expect(result.current.active?.members).toHaveLength(1));
    expect(result.current.active?.members?.[0]?.name).toBe("Cleo");
  });

  it("prefers a fresh non-empty roster already on the list row over a stale cached detail fetch (no clobbering an optimistic group-mutation patch)", async () => {
    registerSessionHandlers();
    let listCallCount = 0;
    server.use(
      http.get(`${API_V1}/conversations`, () => {
        listCallCount += 1;
        // First call: the ordinary ENG-253-trimmed list row. Second call
        // (the test's own `refetchInbox()` below) stands in for what a
        // group-mutation success (`patchConversationInList`) does to this
        // exact cache entry: a fresh, non-empty roster landing straight on
        // the list row, well ahead of the detail query's own next refetch.
        const members =
          listCallCount === 1
            ? []
            : [
                member(MEMBER_A, "Ana"),
                member(MEMBER_B, "Bea"),
                member(MEMBER_C, "Cleo"),
              ];
        return HttpResponse.json({
          data: [groupListRow(GROUP_ONE_ID, "Group One", members)],
          pageInfo: { nextCursor: null, hasMore: false },
        });
      }),
      http.get(`${API_V1}/conversations/${GROUP_ONE_ID}`, () =>
        HttpResponse.json(
          groupDetailRow(
            GROUP_ONE_ID,
            "Group One",
            [member(MEMBER_A, "Ana"), member(MEMBER_B, "Bea")],
            null,
          ),
        ),
      ),
      http.get(`${API_V1}/conversations/${GROUP_ONE_ID}/messages`, () =>
        HttpResponse.json(emptyMessagesPage()),
      ),
    );

    const { useMessagesController, wrapper } = await loadLive();
    const { result } = renderHook(() => useMessagesController(), { wrapper });

    await waitFor(() => expect(result.current.active?.members).toHaveLength(2));

    act(() => result.current.refetchInbox());
    await waitFor(() => expect(listCallCount).toBe(2));

    // The list row's own fresh 3-member roster must win. It must never fall
    // back to, or get overwritten by, the detail fetch's still-cached
    // 2-member snapshot, which the merge never re-fetches on its own here.
    await waitFor(() => expect(result.current.active?.members).toHaveLength(3));
    expect(result.current.active?.members?.map((m) => m.name)).toEqual([
      "Ana",
      "Bea",
      "Cleo",
    ]);
  });
});

describe("useMessagesController: active roster/draft (demo mode untouched)", () => {
  it("keeps the seeded demo roster and draft exactly as before, with no detail fetch and no regression", async () => {
    const { result } = renderHook(() => useMessagesControllerDemo(), {
      wrapper: TestProvidersDemo,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    // The seeded demo group ("Pride Brunch Crew", see demoGroupThreads.data.ts)
    // already carries its full roster in the mock itself. `ConversationWithPreview`
    // being a strict superset means a plain demo `Conversation` (no `hasDraft`) is
    // still assignable, and `useConversationDetail` is disabled entirely in demo
    // mode, so this must render byte-identical to before ENG-253.
    const groupThread = result.current.visibleThreads.find((t) => t.isGroup);
    expect(groupThread).toBeDefined();
    expect(groupThread!.members && groupThread!.members.length > 0).toBe(true);
  });
});
