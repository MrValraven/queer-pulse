import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { AddEventMonthButton } from "./AddEventMonthButton";

const accessState = vi.hoisted(() => ({ canAddEventMonth: false }));

vi.mock("./useCanAddEventMonth", () => ({
  useCanAddEventMonth: () => accessState.canAddEventMonth,
}));

function renderButton(fromSlug?: string) {
  return render(
    <TestProviders>
      <AddEventMonthButton fromSlug={fromSlug} />
    </TestProviders>,
  );
}

describe("AddEventMonthButton", () => {
  beforeEach(() => {
    accessState.canAddEventMonth = true;
  });

  it("renders nothing for a member without access", () => {
    accessState.canAddEventMonth = false;
    renderButton();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("links to the month page", () => {
    renderButton();
    expect(
      screen.getByRole("link", { name: "Add a month of events" }),
    ).toHaveAttribute("href", "/create-gathering/month");
  });

  it("starts from this event when a slug is given", () => {
    renderButton("drag-night");
    expect(
      screen.getByRole("link", { name: "Add a month from this event" }),
    ).toHaveAttribute("href", "/create-gathering/month?from=drag-night");
  });
});
