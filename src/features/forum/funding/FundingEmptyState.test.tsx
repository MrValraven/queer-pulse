import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ForumThreadList } from "../ForumThreadList";
import { FundingEmptyState } from "./FundingEmptyState";

function renderEmpty(hasFilters: boolean) {
  const onClearFilters = vi.fn();
  const onSeeAll = vi.fn();
  render(
    <TestProviders>
      <FundingEmptyState
        view="closing"
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
        onSeeAll={onSeeAll}
      />
    </TestProviders>,
  );
  return { onClearFilters, onSeeAll };
}

describe("FundingEmptyState", () => {
  it("speaks for the empty view and clears the filters that narrowed it", () => {
    const { onClearFilters, onSeeAll } = renderEmpty(true);
    expect(screen.getByText("Nothing closing this week")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Calls with a deadline in the next 7 days show up here.",
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(onSeeAll).not.toHaveBeenCalled();
  });

  it("leads back to every funding post when no filter is set", () => {
    const { onSeeAll } = renderEmpty(false);
    fireEvent.click(
      screen.getByRole("button", { name: "See all funding posts" }),
    );
    expect(onSeeAll).toHaveBeenCalledTimes(1);
  });

  it("invites a member to share a call through the composer", () => {
    renderEmpty(false);
    expect(
      screen.getByRole("link", { name: "Share an open call" }),
    ).toHaveAttribute("href", "/forum/new");
  });
});

describe("ForumThreadList in a Funding & Grants view", () => {
  it("shows the view's own empty state and no category count", () => {
    const noop = vi.fn();
    render(
      <TestProviders>
        <ForumThreadList
          loading={false}
          threads={[]}
          sort="active"
          setSort={noop}
          headerCount={null}
          onClearTag={noop}
          onTagClick={noop}
          onVote={noop}
          filtered
          onShowAll={noop}
          canEditThread={() => false}
          onEditTitle={noop}
          onDelete={noop}
          onRestore={noop}
          onHistory={noop}
          onTogglePin={noop}
          emptyStateSlot={
            <FundingEmptyState
              view="discussion"
              hasFilters={false}
              onClearFilters={noop}
              onSeeAll={noop}
            />
          }
        />
      </TestProviders>,
    );
    expect(screen.getByText("No discussions yet")).toBeInTheDocument();
    expect(screen.queryByText(/^0 threads$/)).toBeNull();
    expect(screen.queryByText("Nothing in this category yet")).toBeNull();
    expect(
      screen.getByRole("group", { name: "Sort posts" }),
    ).toBeInTheDocument();
  });
});
