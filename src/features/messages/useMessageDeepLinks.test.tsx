import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ApiError } from "../../shared/api/client";
import type { TFunction } from "../../shared/i18n/types";
import type { Conversation } from "./data";
import { cafeLisboaFatimaConversation } from "./demoBusinessThreads.data";
import { DEMO_IDENTITY } from "./demoIdentities.data";
import { useActiveMailbox } from "./mailboxes/useActiveMailbox";
import {
  resolveThreadMailbox,
  useMessageDeepLinks,
} from "./useMessageDeepLinks";

vi.mock("./api/messages.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getConversation: vi.fn(),
}));
vi.mock("./api/messages.adapters", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  conversationToView: vi.fn(),
}));

import { getConversation } from "./api/messages.api";
import { conversationToView } from "./api/messages.adapters";

// Demo mode: the URL paths the mailbox feature must never break. `?as=`
// survives a notification tap, a push into another mailbox's thread switches
// to it, and "Message <member>" always lands in the personal mailbox.

const FATIMA_ID = cafeLisboaFatimaConversation.id;
const FATIMA_MESSAGE_ID = "demo-msg-cafe-lisboa-fatima-001";

function wrapperAt(url: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders initialEntries={[url]}>{children}</TestProviders>;
  };
}

function searchOf(location: { search: string }) {
  return new URLSearchParams(location.search);
}

function renderDeepLinks(url: string, initialThreads: Conversation[]) {
  const openThread = vi.fn();
  const openThreadAtMessage = vi.fn();
  const latest = { search: "" };
  const searchAtStartThread: string[] = [];
  const startThread = vi.fn(() => {
    searchAtStartThread.push(latest.search);
  });
  const view = renderHook(
    ({ allThreads }: { allThreads: Conversation[] }) => {
      useMessageDeepLinks({
        allThreads,
        openThread,
        openThreadAtMessage,
        startThread,
      });
      const location = useLocation();
      latest.search = location.search;
      return {
        location,
        navigate: useNavigate(),
        mailbox: useActiveMailbox(),
      };
    },
    { wrapper: wrapperAt(url), initialProps: { allThreads: initialThreads } },
  );
  return {
    ...view,
    openThreadAtMessage,
    startThread,
    searchAtStartThread,
  };
}

describe("useMessageDeepLinks and the active mailbox (demo mode)", () => {
  it("clears only c and m after opening a notification tap, keeping ?as=", async () => {
    const { result, openThreadAtMessage } = renderDeepLinks(
      `/messages?as=${DEMO_IDENTITY.cafeLisboa}&c=${FATIMA_ID}&m=${FATIMA_MESSAGE_ID}&tab=unread`,
      [cafeLisboaFatimaConversation],
    );
    await waitFor(() =>
      expect(openThreadAtMessage).toHaveBeenCalledWith(
        FATIMA_ID,
        FATIMA_MESSAGE_ID,
      ),
    );
    await waitFor(() =>
      expect(searchOf(result.current.location).has("c")).toBe(false),
    );
    const params = searchOf(result.current.location);
    expect(params.has("m")).toBe(false);
    expect(params.get("as")).toBe(DEMO_IDENTITY.cafeLisboa);
    expect(params.get("tab")).toBe("unread");
  });

  it("switches to the thread's own mailbox for a push into another mailbox, then opens it", async () => {
    const { result, rerender, openThreadAtMessage } = renderDeepLinks(
      `/messages?c=${FATIMA_ID}`,
      [],
    );
    await waitFor(() =>
      expect(result.current.mailbox.active?.identityId).toBe(
        DEMO_IDENTITY.cafeLisboa,
      ),
    );
    expect(searchOf(result.current.location).get("c")).toBe(FATIMA_ID);
    expect(openThreadAtMessage).not.toHaveBeenCalled();

    rerender({ allThreads: [cafeLisboaFatimaConversation] });
    await waitFor(() =>
      expect(openThreadAtMessage).toHaveBeenCalledWith(FATIMA_ID, undefined),
    );
    await waitFor(() =>
      expect(searchOf(result.current.location).has("c")).toBe(false),
    );
    expect(searchOf(result.current.location).get("as")).toBe(
      DEMO_IDENTITY.cafeLisboa,
    );
  });

  it("stays in the active mailbox when the linked thread cannot be read", async () => {
    const { result } = renderDeepLinks(
      `/messages?as=${DEMO_IDENTITY.cafeLisboa}&c=demo-thread-unknown`,
      [],
    );
    await waitFor(() =>
      expect(result.current.mailbox.active?.identityId).toBe(
        DEMO_IDENTITY.cafeLisboa,
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(searchOf(result.current.location).get("as")).toBe(
      DEMO_IDENTITY.cafeLisboa,
    );
  });

  it("moves a Message <member> hand-off to the personal mailbox before starting the thread", async () => {
    const { result, startThread, searchAtStartThread } = renderDeepLinks(
      `/messages?as=${DEMO_IDENTITY.cafeLisboa}`,
      [],
    );
    await waitFor(() =>
      expect(result.current.mailbox.active?.identityId).toBe(
        DEMO_IDENTITY.cafeLisboa,
      ),
    );

    act(() => {
      void result.current.navigate(`/messages?as=${DEMO_IDENTITY.cafeLisboa}`, {
        state: { to: { slug: "new-member", name: "New Member" } },
      });
    });

    await waitFor(() => expect(startThread).toHaveBeenCalledTimes(1));
    expect(startThread).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "new-member" }),
    );
    expect(searchOf({ search: searchAtStartThread[0] ?? "" }).has("as")).toBe(
      false,
    );
    expect(result.current.mailbox.isPersonal).toBe(true);
  });
});

// M10: a live `?c=` read that fails outright (most often a mailbox the
// member was staffing and lost the seat on) is a distinct outcome from the
// ordinary "found, but the reader is only a customer here" case: it lets
// the cross-mailbox effect clear the dangling link and explain why. Unit-
// tested directly against `resolveThreadMailbox`: `TestProviders` forces
// demo mode on for every rendered-hook test in this suite (see its own
// doc), so the live branch is only reachable this way.
describe("resolveThreadMailbox (live)", () => {
  // A real server conversation id (UUID-shaped): `isServerConversationId`
  // gates the network call on this shape. The demo `FATIMA_ID` above is a
  // demo-registry id, a different shape entirely.
  const SERVER_CONVERSATION_ID = "11111111-1111-1111-1111-111111111111";
  const noopT: TFunction = (key) => key;

  function freshClient() {
    return new QueryClient({ defaultOptions: { queries: { retry: false } } });
  }

  afterEach(() => {
    vi.mocked(getConversation).mockReset();
    vi.mocked(conversationToView).mockReset();
  });

  it("returns the resolved mailbox id off a successful live read", async () => {
    vi.mocked(getConversation).mockResolvedValue({
      id: SERVER_CONVERSATION_ID,
    } as never);
    vi.mocked(conversationToView).mockReturnValue({
      mailboxIdentityId: DEMO_IDENTITY.cafeLisboa,
    } as never);

    const result = await resolveThreadMailbox(
      SERVER_CONVERSATION_ID,
      false,
      freshClient(),
      noopT,
    );

    expect(result).toEqual({ mailboxIdentityId: DEMO_IDENTITY.cafeLisboa });
  });

  it('returns "refused" when the live read fails', async () => {
    vi.mocked(getConversation).mockRejectedValue(
      new ApiError(404, "Conversation not found"),
    );

    const result = await resolveThreadMailbox(
      SERVER_CONVERSATION_ID,
      false,
      freshClient(),
      noopT,
    );

    expect(result).toBe("refused");
  });

  it("never calls the network for a still-placeholder (non-UUID) id", async () => {
    const result = await resolveThreadMailbox(
      "just-a-slug-not-a-uuid",
      false,
      freshClient(),
      noopT,
    );

    expect(result).toBeNull();
    expect(getConversation).not.toHaveBeenCalled();
  });
});
