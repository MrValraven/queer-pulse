import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { conversations, type Conversation } from "../data";
import { ComposerMailboxBar } from "./ComposerMailboxBar";

function findConversation(id: string): Conversation {
  const found = conversations.find((conversation) => conversation.id === id);
  if (!found) throw new Error(`No demo conversation ${id}`);
  return found;
}

/** A demo thread as the switcher's seat decoration leaves it for staff. */
function seated(id: string): Conversation {
  const conversation = findConversation(id);
  return {
    ...conversation,
    mailboxSeatIdentityId: conversation.mailboxIdentityId,
  };
}

describe("ComposerMailboxBar (demo)", () => {
  it("says which business the member replies as and offers a claim", async () => {
    render(<ComposerMailboxBar active={seated("demo-cafe-lisboa-fatima")} />, {
      wrapper: TestProviders,
    });
    expect(
      await screen.findByText("Replying as Café Lisboa"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Claim" })).toBeInTheDocument();
  });

  it("names the colleague holding a thread and offers a confirmed take-over", async () => {
    render(<ComposerMailboxBar active={seated("demo-cafe-lisboa-nuno")} />, {
      wrapper: TestProviders,
    });
    expect(await screen.findByText("Rui is handling this")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Take over" }));
    expect(await screen.findByText("Take over from Rui?")).toBeInTheDocument();
  });

  it("offers a release on the member's own claim and names the take-over that gave it to them", async () => {
    render(<ComposerMailboxBar active={seated("demo-atelier-pulso-sara")} />, {
      wrapper: TestProviders,
    });
    expect(
      await screen.findByRole("button", { name: "Release" }),
    ).toBeInTheDocument();
    expect(screen.getByText("You're handling this")).toBeInTheDocument();
    expect(screen.getByText("You took over from Rui")).toBeInTheDocument();
  });

  // The provider set renders its own toast regions beside the bar, so each
  // empty case wraps the bar in a host of its own.
  it("renders nothing on a personal thread", () => {
    render(
      <div data-testid="bar-host">
        <ComposerMailboxBar active={findConversation("anika")} />
      </div>,
      { wrapper: TestProviders },
    );
    expect(screen.getByTestId("bar-host")).toBeEmptyDOMElement();
  });

  it("renders nothing on a read-only mailbox, whose composer is replaced", () => {
    render(
      <div data-testid="bar-host">
        <ComposerMailboxBar
          active={{
            ...seated("demo-estudio-norte-daniel"),
            isMailboxReadOnly: true,
          }}
        />
      </div>,
      { wrapper: TestProviders },
    );
    expect(screen.getByTestId("bar-host")).toBeEmptyDOMElement();
  });
});

/** Renders the bar from a cached list row, the way the thread panel does, so
 *  an action's optimistic patch reaches the bar. */
function CachedBar({ seed }: { seed: Conversation }) {
  const { data } = useQuery({
    queryKey: ["conversations", true, "focus-test"],
    queryFn: () => [seed],
    initialData: [seed],
    staleTime: Infinity,
  });
  return <ComposerMailboxBar active={data[0] ?? seed} />;
}

describe("ComposerMailboxBar keyboard focus (demo)", () => {
  it("keeps focus on the action button through Claim and Release", async () => {
    const user = userEvent.setup();
    render(<CachedBar seed={seated("demo-cafe-lisboa-fatima")} />, {
      wrapper: TestProviders,
    });
    const claimButton = await screen.findByRole("button", { name: "Claim" });
    claimButton.focus();
    await user.keyboard("{Enter}");
    const releaseButton = await screen.findByRole("button", {
      name: "Release",
    });
    expect(document.activeElement).toBe(releaseButton);
    await user.keyboard("{Enter}");
    const claimAgain = await screen.findByRole("button", { name: "Claim" });
    expect(document.activeElement).toBe(claimAgain);
  });

  it("returns focus to the action button after a confirmed take-over", async () => {
    const user = userEvent.setup();
    render(<CachedBar seed={seated("demo-cafe-lisboa-nuno")} />, {
      wrapper: TestProviders,
    });
    const takeOverButton = await screen.findByRole("button", {
      name: "Take over",
    });
    takeOverButton.focus();
    await user.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog");
    const confirmButton = Array.from(dialog.querySelectorAll("button")).find(
      (button) => button.textContent === "Take over",
    );
    if (!confirmButton) throw new Error("No confirm button");
    await user.click(confirmButton);
    const releaseButton = await screen.findByRole("button", {
      name: "Release",
    });
    await waitFor(() => expect(document.activeElement).toBe(releaseButton));
  });
});

describe("ComposerMailboxBar take-over confirm (demo)", () => {
  it("closes the confirm when the claim changes under it", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const seed = seated("demo-cafe-lisboa-nuno");
    render(<CachedBar seed={seed} />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <TestProviders queryClient={client}>{children}</TestProviders>
      ),
    });
    fireEvent.click(await screen.findByRole("button", { name: "Take over" }));
    expect(await screen.findByText("Take over from Rui?")).toBeInTheDocument();
    act(() => {
      client.setQueryData(
        ["conversations", true, "focus-test"],
        [{ ...seed, claimedBy: null, claimedAt: null }],
      );
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Claim" })).toBeInTheDocument();
  });
});
