import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useLocation } from "react-router-dom";
import { TestProviders } from "../../../test/TestProviders";
import { GatheringPreviewBar } from "./GatheringPreviewBar";
import { GatheringPreviewContext } from "./gatheringPreviewContext";
import type { GuestPreviewRole } from "./guestPreview";
import { awaitCatalog } from "../../../test/awaitCatalog";

function LocationProbe() {
  return <span data-testid="search">{useLocation().search}</span>;
}

async function renderBar(viewAs: GuestPreviewRole | null) {
  const view = render(
    <TestProviders initialEntries={["/gatherings/party?viewAs=member"]}>
      <GatheringPreviewContext.Provider
        value={{ viewAs, runGuestAction: () => undefined }}
      >
        <GatheringPreviewBar />
      </GatheringPreviewContext.Provider>
      <LocationProbe />
    </TestProviders>,
  );
  await awaitCatalog("gatherings");
  return view;
}

describe("GatheringPreviewBar", () => {
  it("marks the current perspective", async () => {
    await renderBar("member");
    expect(screen.getByRole("button", { name: "Member" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Going" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("switches perspective in the URL", async () => {
    await renderBar("member");
    await userEvent.click(screen.getByRole("button", { name: "Going" }));
    expect(screen.getByTestId("search")).toHaveTextContent("?viewAs=going");
  });

  it("exits the preview", async () => {
    await renderBar("member");
    await userEvent.click(screen.getByRole("button", { name: "Exit preview" }));
    expect(screen.getByTestId("search")).toHaveTextContent(/^$/);
  });

  it("renders nothing outside a preview", async () => {
    const { container } = await renderBar(null);
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.queryByText("Previewing as")).toBeNull();
    expect(container.querySelector("[data-preview-allow]")).toBeNull();
  });
});
