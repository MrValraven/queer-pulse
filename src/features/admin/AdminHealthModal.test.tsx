import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminHealthModal } from "./AdminHealthModal";
import { COMMUNITIES } from "./adminCommunities.data";

function renderModal(breakdown: [number, number, number | null, number]) {
  const community = { ...COMMUNITIES[0]!, breakdown };
  return render(
    <TestProviders>
      <AdminHealthModal
        community={community}
        onClose={() => {}}
        onOfferSupport={() => {}}
      />
    </TestProviders>,
  );
}

describe("AdminHealthModal", () => {
  it("says a null signal is not measured rather than rendering it as zero", () => {
    // A zero would read as "this community has terrible sentiment" when the
    // truth is that nothing on the platform measures sentiment at all.
    renderModal([91, 100, null, 90]);
    expect(screen.getByText("Not measured yet")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("still renders the measured signals alongside the unmeasured one", () => {
    renderModal([91, 100, null, 90]);
    expect(screen.getByText("91")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("renders a numeric sentiment normally if one ever arrives", () => {
    renderModal([91, 100, 88, 90]);
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.queryByText("Not measured yet")).not.toBeInTheDocument();
  });
});
