import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ComposeFooter } from "./ComposeFooter";

function renderFooter(isReviewOnly: boolean) {
  const onPublish = vi.fn();
  render(
    <TestProviders>
      <ComposeFooter
        draftStatus="idle"
        blockers={[]}
        canPublish
        onCancel={vi.fn()}
        onPublish={onPublish}
        isReviewOnly={isReviewOnly}
      />
    </TestProviders>,
  );
  return { onPublish };
}

describe("ComposeFooter", () => {
  it("offers a fundraiser review as its only way out, with no schedule menu", () => {
    const { onPublish } = renderFooter(true);
    fireEvent.click(
      screen.getByRole("button", { name: "Ask a moderator to read it first" }),
    );
    expect(onPublish).toHaveBeenCalledWith("review");
    expect(
      screen.queryByRole("button", { name: "More ways to publish" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Publish post" })).toBeNull();
  });

  it("keeps Publish and the menu caret for every other kind", () => {
    const { onPublish } = renderFooter(false);
    expect(
      screen.getByRole("button", { name: "More ways to publish" }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "More ways to publish" }),
    );
    expect(
      screen.getByRole("menuitem", { name: /Schedule/ }),
    ).toBeInTheDocument();
    expect(onPublish).not.toHaveBeenCalled();
  });
});
