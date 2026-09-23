// src/features/messages/api/useMessageSearch.demo.test.tsx
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_IDENTITY } from "../demoIdentities.data";
import { useMessageSearch } from "./useMessageSearch";

function wrapperAt(url: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders initialEntries={[url]}>{children}</TestProviders>;
  };
}

/** The hits of one demo thread, once the mailbox has resolved. */
async function hitsIn(conversationId: string, query: string, url: string) {
  const { result } = renderHook(() => useMessageSearch(query, "You"), {
    wrapper: wrapperAt(url),
  });
  await waitFor(() => expect(result.current.totalHits).toBeGreaterThan(0));
  return (
    result.current.groups.find(
      (group) => group.conversationId === conversationId,
    )?.hits ?? []
  );
}

describe("demo message search, business mailboxes", () => {
  it("names a colleague's reply by the business and the colleague's first name", async () => {
    const hits = await hitsIn(
      "demo-cafe-lisboa-nuno",
      "long table",
      `/messages?as=${DEMO_IDENTITY.cafeLisboa}`,
    );
    expect(hits.map((hit) => hit.senderName)).toEqual(["Rui from Café Lisboa"]);
  });

  it("names the member's own business reply as You", async () => {
    const hits = await hitsIn(
      "demo-atelier-pulso-sara",
      "Thursday",
      `/messages?as=${DEMO_IDENTITY.atelierPulso}`,
    );
    expect(hits.map((hit) => hit.senderName)).toEqual(["You"]);
  });
});
