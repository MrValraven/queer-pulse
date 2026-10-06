import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ThreadTagsModal } from "./ThreadTagsModal";

function renderModal(
  threadKind: string | null,
  shouldShowAskReviewNote = false,
) {
  const onSave = vi.fn();
  render(
    <TestProviders>
      <ThreadTagsModal
        initialTags={["open-call", "grants"]}
        busy={false}
        onSave={onSave}
        onClose={vi.fn()}
        threadKind={threadKind}
        shouldShowAskReviewNote={shouldShowAskReviewNote}
      />
    </TestProviders>,
  );
  return { onSave };
}

describe("ThreadTagsModal on a Funding & Grants thread", () => {
  it("edits only the member's own tags on a call and caps them at four", () => {
    renderModal("call");
    expect(screen.queryByText("#open-call")).toBeNull();
    expect(screen.getByText("#grants")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Up to 4 tags, chosen from the list so people can find this later.",
      ),
    ).toBeInTheDocument();
  });

  it("saves without open-call, which the server adds back itself", () => {
    const { onSave } = renderModal("call");
    fireEvent.click(screen.getByRole("button", { name: "Remove tag grants" }));
    fireEvent.click(screen.getByRole("button", { name: "Save tags" }));
    expect(onSave).toHaveBeenCalledWith([]);
  });

  it("warns the author of a fundraiser that saving sends it back to review", () => {
    renderModal("ask", true);
    expect(
      screen.getByText(
        "Saving sends your fundraiser back to moderators before it shows again.",
      ),
    ).toBeInTheDocument();
  });
});
