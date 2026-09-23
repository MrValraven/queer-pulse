// src/features/messages/api/demoClaims.test.tsx
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  DEMO_IDENTITY,
  DEMO_STAFFED_IDENTITY_IDS,
} from "../demoIdentities.data";
import type { Conversation } from "../data";
import type { ConversationListScope } from "../mailboxes/mailboxScope";
import { resetDemoClaims } from "./demoClaims";
import { useConversationClaim } from "./useConversationClaim";
import { useConversations } from "./useConversations";

const NUNO_THREAD_ID = "demo-cafe-lisboa-nuno";

const CAFE_SCOPE: ConversationListScope = {
  identityId: DEMO_IDENTITY.cafeLisboa,
  isPersonal: false,
  isReadOnly: false,
  staffedIdentityIds: DEMO_STAFFED_IDENTITY_IDS,
};

afterEach(() => resetDemoClaims());

/** Stands in for the Nuno row until the demo list has resolved, so the claim
 *  hook always has a conversation to read. */
const PENDING_ROW = {
  id: NUNO_THREAD_ID,
  name: "",
  initials: "",
  tint: "plum",
  pronouns: "",
  connectedSince: "",
  time: "",
  preview: "",
  unread: false,
  messages: [],
} as unknown as Conversation;

/** The Café Lisboa list plus the claim actions of the thread Rui holds. */
function useListAndClaim() {
  const list = useConversations(CAFE_SCOPE);
  const row = list.data?.find(
    (conversation) => conversation.id === NUNO_THREAD_ID,
  );
  return { list, row, claim: useConversationClaim(row ?? PENDING_ROW) };
}

describe("demo claims survive the demo list rebuild", () => {
  it("keeps a released thread unclaimed when the list re-derives", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestProviders queryClient={client}>{children}</TestProviders>
    );
    const { result } = renderHook(useListAndClaim, { wrapper });
    await waitFor(() =>
      expect(result.current.row?.claimedBy?.firstName).toBe("Rui"),
    );

    await act(() => result.current.claim.release());
    await waitFor(() => expect(result.current.row?.claimedBy).toBeNull());

    await act(async () => {
      await client.invalidateQueries({ queryKey: ["conversations"] });
    });
    await waitFor(() => expect(result.current.list.isFetching).toBe(false));
    expect(result.current.row?.claimedBy).toBeNull();
  });

  it("keeps a thread the member claimed when the list re-derives", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TestProviders queryClient={client}>{children}</TestProviders>
    );
    const { result } = renderHook(useListAndClaim, { wrapper });
    await waitFor(() =>
      expect(result.current.row?.claimedBy?.firstName).toBe("Rui"),
    );

    await act(() => result.current.claim.takeOver());
    await waitFor(() =>
      expect(result.current.row?.claimedBy?.handle).toBe("tiago"),
    );

    await act(async () => {
      await client.invalidateQueries({ queryKey: ["conversations"] });
    });
    await waitFor(() => expect(result.current.list.isFetching).toBe(false));
    expect(result.current.row?.claimedBy?.handle).toBe("tiago");
  });
});
