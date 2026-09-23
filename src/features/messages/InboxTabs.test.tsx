import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { InboxTabs } from "./InboxTabs";

const NOOP = () => {};

describe("InboxTabs", () => {
  it("shows Requests, Favorites and Groups in the personal mailbox", async () => {
    render(
      <InboxTabs
        active="all"
        onChange={NOOP}
        requestsCount={2}
        isBusinessMailbox={false}
      />,
      { wrapper: TestProviders },
    );
    expect(
      await screen.findByRole("tab", { name: /favorites/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /groups/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /requests/i })).toBeInTheDocument();
  });

  // M6: Requests lists the member's OWN incoming first-contact requests, a
  // personal-mailbox concept. Inside a business, persona or company mailbox
  // it must not appear at all (nothing to route it to there), leaving five
  // tabs: All, Unread, Unclaimed, Mine, Archived.
  it("hides Requests inside a business mailbox, keeping Unclaimed and Mine", async () => {
    render(
      <InboxTabs
        active="all"
        onChange={NOOP}
        requestsCount={2}
        isBusinessMailbox
      />,
      { wrapper: TestProviders },
    );
    expect(
      await screen.findByRole("tab", { name: /unclaimed/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Mine" })).toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /requests/i }),
    ).not.toBeInTheDocument();
  });

  it("renders exactly five tabs inside a business mailbox (no Requests slot at all)", async () => {
    const onChange = vi.fn();
    render(
      <InboxTabs
        active="all"
        onChange={onChange}
        requestsCount={0}
        isBusinessMailbox
      />,
      { wrapper: TestProviders },
    );
    await screen.findByRole("tab", { name: "Mine" });
    expect(screen.queryAllByRole("tab")).toHaveLength(5);
  });
});
