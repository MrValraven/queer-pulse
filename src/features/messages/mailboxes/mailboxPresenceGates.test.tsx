import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Conversation } from "../data";
import { MessagesThreadRow } from "../MessagesThreadRow";
import { useCounterpartStatus } from "../useCounterpartStatus";

// The demo `online` fallback: no participant id, and the row says online.
const person = {
  id: "thread-person",
  name: "Anika Kovač",
  slug: "anika",
  initials: "AK",
  tint: "plum",
  pronouns: "",
  connectedSince: "",
  time: "",
  preview: "See you there",
  unread: false,
  online: true,
} as Conversation;
const business = {
  ...person,
  id: "thread-cafe",
  name: "Café Lisboa",
  slug: "cafe-lisboa",
  counterpartIdentityKind: "listing",
} as Conversation;
const formerBusiness = {
  ...person,
  id: "thread-former",
  name: "Former business",
  slug: undefined,
  isCounterpartFormerBusiness: true,
} as Conversation;

const noop = () => undefined;

function renderRow(thread: Conversation) {
  return render(
    <MessagesThreadRow
      thread={thread}
      activeId=""
      readIds={new Set()}
      pinnedCount={0}
      onOpen={noop}
      onRequestDelete={noop}
      onMarkThreadRead={noop}
      onMarkThreadUnread={noop}
    />,
    { wrapper: TestProviders },
  );
}

describe("MessagesThreadRow presence gate", () => {
  it("shows a person's online ring", async () => {
    renderRow(person);
    expect(await screen.findByText("Online now")).toBeInTheDocument();
  });

  it("never rings a business or a deleted business", async () => {
    renderRow(business);
    expect(await screen.findByText("Café Lisboa")).toBeInTheDocument();
    renderRow(formerBusiness);
    expect(screen.queryByText("Online now")).not.toBeInTheDocument();
    expect(
      screen.queryByText("messages:thread.presenceOnline"),
    ).not.toBeInTheDocument();
  });
});

describe("useCounterpartStatus presence gate", () => {
  const statusOf = (active: Conversation) =>
    renderHook(() => useCounterpartStatus(active, "me"), {
      wrapper: TestProviders,
    }).result.current.isCounterpartOnline;

  it("reports a person online", () => {
    expect(statusOf(person)).toBe(true);
  });

  it("never reports a business or a deleted business online", () => {
    expect(statusOf(business)).toBe(false);
    expect(statusOf(formerBusiness)).toBe(false);
  });
});
