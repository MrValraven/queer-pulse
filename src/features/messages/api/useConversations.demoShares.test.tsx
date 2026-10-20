import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import { DemoModeProvider } from "../../../app/providers/DemoModeProvider";
import { DeletedConversationsProvider } from "../../../app/providers/DeletedConversationsProvider";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import {
  DEMO_IDENTITY,
  DEMO_STAFFED_IDENTITY_IDS,
} from "../demoIdentities.data";
import type { ConversationListScope } from "../mailboxes/mailboxScope";
import { landDemoShare, resetLandedDemoShares } from "../share/demoShareSend";
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

beforeEach(() => resetLandedDemoShares());

describe("useConversations, demo shares", () => {
  it("keeps a landed share's preview on top after the demo inbox refetches", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useConversations(PERSONAL_SCOPE), {
      wrapper: wrapperWith(client),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.[0]?.id).not.toBe("priya");

    act(() => {
      landDemoShare(client, "priya", "Look at this", "client-inbox-1");
    });
    await act(async () => {
      await client.refetchQueries({ queryKey: ["conversations"] });
    });

    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(result.current.data?.[0]?.id).toBe("priya");
    expect(result.current.data?.[0]?.preview).toBe("Look at this");
  });
});
