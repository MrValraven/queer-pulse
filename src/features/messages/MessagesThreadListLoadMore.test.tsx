import { render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { MessagesThreadListLoadMore } from "./MessagesThreadListLoadMore";
import { useMessagesController } from "./useMessagesController";

/**
 * ENG-253: the inbox's own "load more" affordance (`useConversations`'
 * `fetchNextPage`/`hasNextPage`/`isFetchingNextPage` had nothing in the UI
 * consuming them before this build). See this build's report for exactly
 * where `MessagesPage.tsx` still needs a small hookup this suite's allowlist
 * doesn't cover.
 */

describe("MessagesThreadListLoadMore", () => {
  it("renders nothing once the server reports no further page", () => {
    render(
      <MessagesThreadListLoadMore
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={() => {}}
      />,
      { wrapper: TestProviders },
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows a Load more affordance and calls onLoadMore when tapped", async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    render(
      <MessagesThreadListLoadMore
        hasNextPage
        isFetchingNextPage={false}
        onLoadMore={onLoadMore}
      />,
      { wrapper: TestProviders },
    );
    // Real, resolved copy, proving the button actually renders text rather
    // than a raw i18n key: it reuses the generic `messages:mediaGallery.
    // loadMore` string (see the component's own TODO comment on why, rather
    // than a dedicated catalog key).
    expect(await screen.findByText("Load more")).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).not.toHaveAttribute("aria-disabled");
    await user.click(button);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("marks only its own footer busy while fetching the next page, and ignores a tap while busy", async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    render(
      <MessagesThreadListLoadMore
        hasNextPage
        isFetchingNextPage
        onLoadMore={onLoadMore}
      />,
      { wrapper: TestProviders },
    );
    expect(await screen.findByText("Loading more…")).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-disabled");
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
    await user.click(button);
    expect(onLoadMore).not.toHaveBeenCalled();
  });
});

describe("useMessagesController pagination (ENG-253, demo mode)", () => {
  it("keeps hasMoreThreads false in demo mode, since the seeded inbox is a single page", async () => {
    const { result } = renderHook(() => useMessagesController(), {
      wrapper: TestProviders,
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMoreThreads).toBe(false);
    expect(result.current.isLoadingMoreThreads).toBe(false);
  });
});
