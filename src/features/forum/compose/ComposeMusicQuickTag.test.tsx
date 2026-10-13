import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ComposeMusicQuickTag } from "./ComposeMusicQuickTag";

describe("ComposeMusicQuickTag", () => {
  it("adds the music tag when pressed", () => {
    const onAdd = vi.fn();
    render(
      <TestProviders>
        <ComposeMusicQuickTag
          tags={[]}
          maxTags={4}
          onAdd={onAdd}
          onRemove={vi.fn()}
        />
      </TestProviders>,
    );
    const toggle = screen.getByRole("button", { name: /music & sound/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle);
    expect(onAdd).toHaveBeenCalledWith("music");
  });

  it("removes it when it is already there", () => {
    const onRemove = vi.fn();
    render(
      <TestProviders>
        <ComposeMusicQuickTag
          tags={["music"]}
          maxTags={4}
          onAdd={vi.fn()}
          onRemove={onRemove}
        />
      </TestProviders>,
    );
    fireEvent.click(screen.getByRole("button", { name: /music & sound/i }));
    expect(onRemove).toHaveBeenCalledWith("music");
  });

  it("stays focusable and adds nothing when the tags are full", () => {
    const onAdd = vi.fn();
    render(
      <TestProviders>
        <ComposeMusicQuickTag
          tags={["a", "b", "c", "d"]}
          maxTags={4}
          onAdd={onAdd}
          onRemove={vi.fn()}
        />
      </TestProviders>,
    );
    const toggle = screen.getByRole("button", { name: /music & sound/i });
    expect(toggle).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(toggle);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("points at the full-list hint when the tags are full", () => {
    render(
      <TestProviders>
        <ComposeMusicQuickTag
          tags={["a", "b", "c", "d"]}
          maxTags={4}
          onAdd={vi.fn()}
          onRemove={vi.fn()}
        />
      </TestProviders>,
    );
    const toggle = screen.getByRole("button", { name: /music & sound/i });
    expect(toggle).toHaveAccessibleDescription("Remove a tag to add this one");
    expect(screen.getByText("Remove a tag to add this one")).toBeVisible();
  });

  it("still removes the music tag when the list is full", () => {
    const onRemove = vi.fn();
    render(
      <TestProviders>
        <ComposeMusicQuickTag
          tags={["music", "b", "c", "d"]}
          maxTags={4}
          onAdd={vi.fn()}
          onRemove={onRemove}
        />
      </TestProviders>,
    );
    const toggle = screen.getByRole("button", { name: /music & sound/i });
    expect(toggle).not.toHaveAttribute("aria-disabled");
    expect(
      screen.queryByText("Remove a tag to add this one"),
    ).not.toBeInTheDocument();
    fireEvent.click(toggle);
    expect(onRemove).toHaveBeenCalledWith("music");
  });
});
