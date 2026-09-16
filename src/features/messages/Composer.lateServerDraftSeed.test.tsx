import { act, render, screen, waitFor } from "@testing-library/react";
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
import { QueryClient } from "@tanstack/react-query";
import { server } from "../../test/msw/server";
import { API, API_V1 } from "../../test/msw/handlers";
import { queryClient as productionQueryClient } from "../../shared/api/queryClient";
import { Composer as ComposerDemo } from "./Composer";
import { TestProviders as TestProvidersDemo } from "../../test/TestProviders";
import type { Conversation } from "./data";
import type { AttachmentStaging } from "./useAttachmentStaging";

/**
 * SOC-16/ENG-253 regression coverage for the composer-level half of the
 * late-server-draft race `useMessagesController.activeDetail.test.tsx`
 * already proves at the controller level: `active.draft` can resolve AFTER
 * this component has already mounted, via a slower `GET /conversations/:id`
 * detail fetch. `shouldSeedLateServerDraft.test.ts` covers the decision
 * function in isolation; these specs drive the actual mounted `Composer` to
 * prove the effect is wired correctly: it seeds an untouched field, discards
 * once the member has typed, never beats a local draft, applies at most once
 * per thread, and never fires at all in demo mode.
 */

const textareaRef = { current: null };
const emptyStaging: AttachmentStaging = { screen: false, pendingStrip: null };

function baseConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "c1",
    name: "Alina C.",
    initials: "AC",
    tint: "plum",
    ...overrides,
  } as Conversation;
}

function getComposerField(): HTMLTextAreaElement {
  return screen.getByRole("combobox");
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllEnvs();
  window.localStorage.clear();
});
afterAll(() => server.close());

beforeEach(() => {
  // DemoModeProvider's live-mode default reads this key; a value left over
  // from another test would flip demo back on and make every live spec below
  // vacuous.
  window.localStorage.clear();
});

/** The universal session/chrome endpoints `TestProviders` fires on any live
 *  render, plus `GET /me/messaging-privacy` (`useComposerTyping`'s own
 *  `useMessagingPrivacy` call). Mirrors
 *  `useMessagesController.activeDetail.test.tsx`'s own `registerSessionHandlers`. */
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
    http.get(`${API_V1}/conversations/unread-count`, () =>
      HttpResponse.json({ count: 0 }),
    ),
    http.get(`${API_V1}/me/messaging-privacy`, () =>
      HttpResponse.json({
        shareReadReceipts: true,
        shareTyping: true,
        sharePresence: true,
        whoCanMessage: "everyone",
      }),
    ),
  );
}

/**
 * Mirrors `useMessagesController.activeDetail.test.tsx`'s own `loadLive()`:
 * `vi.resetModules()` + `vi.stubEnv("VITE_API_URL", ...)` BEFORE dynamically
 * re-importing every module that (transitively) reads `shared/api/config.ts`,
 * so `apiAvailable`/`demoConfigured` re-freeze against the stubbed env
 * instead of the suite-wide demo default.
 */
async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", API);
  const { TestProviders } = await import("../../test/TestProviders");
  const { Composer } = await import("./Composer");
  const prodDefaults = productionQueryClient.getDefaultOptions().queries;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { ...prodDefaults, retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { Composer, wrapper };
}

describe("Composer: late server-draft seed (live mode)", () => {
  it("seeds an untouched, empty composer once the server draft resolves after mount", async () => {
    registerSessionHandlers();
    const { Composer, wrapper } = await loadLive();
    const Wrapper = wrapper;
    const convo = baseConversation({ draft: undefined });

    const { rerender } = render(
      <Wrapper>
        <Composer
          active={convo}
          conversationId={convo.id}
          onSend={() => {}}
          blocked={false}
          textareaRef={textareaRef}
          staging={emptyStaging}
        />
      </Wrapper>,
    );
    await waitFor(() => expect(getComposerField().value).toBe(""));

    rerender(
      <Wrapper>
        <Composer
          active={baseConversation({ draft: "hello from another device" })}
          conversationId={convo.id}
          onSend={() => {}}
          blocked={false}
          textareaRef={textareaRef}
          staging={emptyStaging}
        />
      </Wrapper>,
    );

    await waitFor(() =>
      expect(getComposerField().value).toBe("hello from another device"),
    );
  });

  it("discards a late server draft once the member has already typed something", async () => {
    registerSessionHandlers();
    const user = userEvent.setup();
    const { Composer, wrapper } = await loadLive();
    const Wrapper = wrapper;
    const convo = baseConversation({ draft: undefined });

    const { rerender } = render(
      <Wrapper>
        <Composer
          active={convo}
          conversationId={convo.id}
          onSend={() => {}}
          blocked={false}
          textareaRef={textareaRef}
          staging={emptyStaging}
        />
      </Wrapper>,
    );
    await waitFor(() => expect(getComposerField().value).toBe(""));
    await user.type(getComposerField(), "my own message");
    expect(getComposerField().value).toBe("my own message");

    rerender(
      <Wrapper>
        <Composer
          active={baseConversation({ draft: "hello from another device" })}
          conversationId={convo.id}
          onSend={() => {}}
          blocked={false}
          textareaRef={textareaRef}
          staging={emptyStaging}
        />
      </Wrapper>,
    );

    // Give the effect a tick to (not) fire, then assert the typed text held.
    await act(async () => {
      await Promise.resolve();
    });
    expect(getComposerField().value).toBe("my own message");
  });

  it("keeps a local draft winning over a late-arriving server draft", async () => {
    registerSessionHandlers();
    const { Composer, wrapper } = await loadLive();
    const Wrapper = wrapper;
    // Seed this device's own local draft BEFORE mount, exactly like a member
    // who already typed something on this device.
    window.localStorage.setItem(
      "qp.messages.drafts.v1",
      JSON.stringify({ c1: "device's own local draft" }),
    );
    const convo = baseConversation({ draft: undefined });

    const { rerender } = render(
      <Wrapper>
        <Composer
          active={convo}
          conversationId={convo.id}
          onSend={() => {}}
          blocked={false}
          textareaRef={textareaRef}
          staging={emptyStaging}
        />
      </Wrapper>,
    );
    await waitFor(() =>
      expect(getComposerField().value).toBe("device's own local draft"),
    );

    rerender(
      <Wrapper>
        <Composer
          active={baseConversation({ draft: "hello from another device" })}
          conversationId={convo.id}
          onSend={() => {}}
          blocked={false}
          textareaRef={textareaRef}
          staging={emptyStaging}
        />
      </Wrapper>,
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(getComposerField().value).toBe("device's own local draft");
  });

  it("applies the late seed at most once, even across repeated detail refetches", async () => {
    registerSessionHandlers();
    const user = userEvent.setup();
    const { Composer, wrapper } = await loadLive();
    const Wrapper = wrapper;
    const convo = baseConversation({ draft: undefined });

    const { rerender } = render(
      <Wrapper>
        <Composer
          active={convo}
          conversationId={convo.id}
          onSend={() => {}}
          blocked={false}
          textareaRef={textareaRef}
          staging={emptyStaging}
        />
      </Wrapper>,
    );
    await waitFor(() => expect(getComposerField().value).toBe(""));

    // First resolution of the detail fetch: seeds normally.
    rerender(
      <Wrapper>
        <Composer
          active={baseConversation({ draft: "first device's draft" })}
          conversationId={convo.id}
          onSend={() => {}}
          blocked={false}
          textareaRef={textareaRef}
          staging={emptyStaging}
        />
      </Wrapper>,
    );
    await waitFor(() =>
      expect(getComposerField().value).toBe("first device's draft"),
    );

    // The member edits what landed.
    await user.type(getComposerField(), " plus more");
    expect(getComposerField().value).toBe("first device's draft plus more");

    // A refetch (react-query revalidation / window refocus) resolves the
    // SAME query again with a different value: must not reapply.
    rerender(
      <Wrapper>
        <Composer
          active={baseConversation({ draft: "a second, different draft" })}
          conversationId={convo.id}
          onSend={() => {}}
          blocked={false}
          textareaRef={textareaRef}
          staging={emptyStaging}
        />
      </Wrapper>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(getComposerField().value).toBe("first device's draft plus more");
  });
});

describe("Composer: late server-draft seed (demo mode is unaffected)", () => {
  it("never seeds a late-arriving draft in demo mode; the row already carries it at mount", async () => {
    const convo = baseConversation({ draft: undefined });
    const { rerender } = render(
      <ComposerDemo
        active={convo}
        conversationId={convo.id}
        onSend={() => {}}
        blocked={false}
        textareaRef={textareaRef}
        staging={emptyStaging}
      />,
      { wrapper: TestProvidersDemo },
    );
    expect(getComposerField().value).toBe("");

    // Simulate what, in live mode, would be the detail fetch resolving late.
    // In demo mode this must never be adopted: there is no async detail
    // fetch, and the seed effect is explicitly gated on `!demoMode`.
    rerender(
      <ComposerDemo
        active={baseConversation({ draft: "should never appear" })}
        conversationId={convo.id}
        onSend={() => {}}
        blocked={false}
        textareaRef={textareaRef}
        staging={emptyStaging}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(getComposerField().value).toBe("");
  });
});
