// src/features/messages/api/useConversations.identityBlocks.test.tsx
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { DemoModeProvider } from "../../../app/providers/DemoModeProvider";
import { DeletedConversationsProvider } from "../../../app/providers/DeletedConversationsProvider";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { identityBlocksQueryKey } from "../../social/api/identityBlocks.data";
import {
  DEMO_IDENTITY,
  DEMO_STAFFED_IDENTITY_IDS,
} from "../demoIdentities.data";
import type { ConversationListScope } from "../mailboxes/mailboxScope";
import { useConversations } from "./useConversations";

const PERSONAL_SCOPE: ConversationListScope = {
  identityId: DEMO_IDENTITY.viewerProfile,
  isPersonal: true,
  isReadOnly: false,
  staffedIdentityIds: DEMO_STAFFED_IDENTITY_IDS,
};

function wrapperWith(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <I18nProvider>
          <DemoModeProvider>
            <DeletedConversationsProvider>
              {children}
            </DeletedConversationsProvider>
          </DemoModeProvider>
        </I18nProvider>
      </QueryClientProvider>
    );
  };
}

describe("useConversations, demo identity blocks (I-2)", () => {
  it("drops a blocked business's thread from the personal mailbox list", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useConversations(PERSONAL_SCOPE), {
      wrapper: wrapperWith(client),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(
      result.current.data?.some((row) => row.id === "demo-livraria-aurora"),
    ).toBe(true);

    // The block a customer makes from the thread, written the same way
    // `useBlockIdentity` does in demo mode.
    act(() => {
      client.setQueryData(identityBlocksQueryKey(true), [
        {
          id: "demo-identity-block-livraria-aurora",
          identity: {
            id: DEMO_IDENTITY.livrariaAurora,
            kind: "listing" as const,
            displayName: "Livraria Aurora",
            handle: "livraria-aurora",
            avatarUrl: null,
          },
          createdAt: new Date().toISOString(),
        },
      ]);
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ["conversations"] });
    });

    await waitFor(() =>
      expect(
        result.current.data?.some((row) => row.id === "demo-livraria-aurora"),
      ).toBe(false),
    );
  });
});
