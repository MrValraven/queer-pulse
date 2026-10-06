import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ForumThreadList } from "../ForumThreadList";
import {
  FundingCategoryBar,
  type FundingCategoryBarProps,
} from "./FundingCategoryBar";

function renderBar(overrides: Partial<FundingCategoryBarProps> = {}) {
  const props: FundingCategoryBarProps = {
    view: "all",
    onViewChange: vi.fn(),
    eligibility: [],
    onToggleEligibility: vi.fn(),
    scope: null,
    onScopeChange: vi.fn(),
    onClearFilters: vi.fn(),
    ...overrides,
  };
  render(
    <TestProviders>
      <FundingCategoryBar {...props} />
    </TestProviders>,
  );
  return props;
}

describe("FundingCategoryBar", () => {
  it("switches between the five views", () => {
    const props = renderBar();
    fireEvent.click(screen.getByRole("button", { name: "Open calls" }));
    expect(props.onViewChange).toHaveBeenCalledWith("open");
    expect(
      screen.getByRole("button", { name: "Fundraisers" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Discussion" }),
    ).toBeInTheDocument();
  });

  it("offers eligibility and scope on the call views only", () => {
    renderBar({ view: "asks" });
    expect(screen.queryByRole("group", { name: "Who can apply" })).toBeNull();
  });

  it("toggles an eligibility value and resets the scope to anywhere", () => {
    const props = renderBar({ view: "open", scope: "eu" });
    fireEvent.click(screen.getByRole("button", { name: /Students/ }));
    expect(props.onToggleEligibility).toHaveBeenCalledWith("students");
    fireEvent.click(screen.getByRole("button", { name: "Anywhere" }));
    expect(props.onScopeChange).toHaveBeenCalledWith(null);
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(props.onClearFilters).toHaveBeenCalled();
  });
});

describe("ForumThreadList in a server-ordered view", () => {
  it("hides the sort tabs the server ignores", () => {
    const noop = vi.fn();
    render(
      <TestProviders>
        <ForumThreadList
          loading={false}
          threads={[]}
          sort="active"
          setSort={noop}
          headerCount={0}
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
          hasServerOrder
        />
      </TestProviders>,
    );
    expect(screen.queryByRole("group", { name: "Sort posts" })).toBeNull();
  });
});
