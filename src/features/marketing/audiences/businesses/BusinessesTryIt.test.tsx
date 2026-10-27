import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { BusinessesTryIt } from "./BusinessesTryIt";

describe("BusinessesTryIt", () => {
  it("switching to Out and about shows the area view", async () => {
    render(
      <TestProviders>
        <BusinessesTryIt />
      </TestProviders>,
    );
    const firstTab = await screen.findByRole("tab", {
      name: "A place people visit",
    });
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });
    const onlineTab = screen.getByRole("tab", { name: "Online only" });
    fireEvent.keyDown(onlineTab, { key: "ArrowRight" });
    const mobileTab = screen.getByRole("tab", { name: "Out and about" });
    expect(mobileTab).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby", mobileTab.id);
    expect(await within(panel).findByText("All of Lisbon")).toBeInTheDocument();
  });
});
