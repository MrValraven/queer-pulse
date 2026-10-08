import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useLocation } from "react-router-dom";
import { TestProviders } from "../../test/TestProviders";
import { GatheringHostMenu } from "./GatheringHostMenu";

function LocationProbe() {
  const location = useLocation();
  return (
    <>
      <span data-testid="search">{location.search}</span>
      <span data-testid="state">{JSON.stringify(location.state)}</span>
    </>
  );
}

function renderMenu() {
  return render(
    <TestProviders initialEntries={["/gatherings/party"]}>
      <GatheringHostMenu
        slug="party"
        title="Party night"
        isCancelled={false}
        isCancelPending={false}
        isDeletePending={false}
        onEdit={() => undefined}
        onCancel={() => undefined}
        onDelete={() => undefined}
      />
      <LocationProbe />
    </TestProviders>,
  );
}

describe("GatheringHostMenu", () => {
  it("opens the guest preview as a member", async () => {
    renderMenu();

    await userEvent.click(
      screen.getByRole("button", { name: "Host tools for Party night" }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Preview as guest" }),
    );

    expect(screen.getByTestId("search")).toHaveTextContent("?viewAs=member");
    expect(screen.getByTestId("state")).toHaveTextContent(
      '{"isGuestPreviewEntry":true}',
    );
  });
});
