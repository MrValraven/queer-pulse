import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type CohostAddDialogProps,
  type EventHostScope,
} from "./eventHostScope";
import { CohostManager } from "./CohostManager";

vi.mock("./api/useEventMutations", () => ({
  useRemoveCohost: () => ({ mutate: vi.fn() }),
  useSendCohostInvite: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("./CohostInviteComposerModal", () => ({
  CohostInviteComposerModal: () => <p>Invite composer</p>,
}));

function DirectAddStub({ onAdded }: CohostAddDialogProps) {
  return (
    <button
      type="button"
      onClick={() => onAdded({ slug: "nova", name: "Nova Reyes" })}
    >
      Direct add stub
    </button>
  );
}

const houseScope: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  isHouseEvent: true,
  CohostAddDialog: DirectAddStub,
};

const renderManager = (scope: EventHostScope) =>
  render(
    <TestProviders>
      <EventHostScopeContext.Provider value={scope}>
        <CohostManager slug="house-night" />
      </EventHostScopeContext.Provider>
    </TestProviders>,
  );

describe("CohostManager in the house scope", () => {
  it("adds a cohost through the direct add dialog", async () => {
    renderManager(houseScope);
    // The house cohosts note is an `admin:` string, so finding it first
    // proves that namespace has loaded before the toast is asserted.
    expect(
      await screen.findByText(/QueerPulse is the lead host/),
    ).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Add cohost" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Direct add stub" }),
    );
    expect(await screen.findByText("Nova Reyes")).toBeInTheDocument();
    expect(
      await screen.findByText("Nova Reyes is now a cohost"),
    ).toBeInTheDocument();
  });

  it("keeps the invite composer outside the house scope", async () => {
    renderManager(MEMBER_HOST_SCOPE);
    expect(
      await screen.findByText(/You stay the lead host/),
    ).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Add cohost" }));
    expect(await screen.findByText("Invite composer")).toBeInTheDocument();
    expect(screen.queryByText("Direct add stub")).toBeNull();
  });
});
