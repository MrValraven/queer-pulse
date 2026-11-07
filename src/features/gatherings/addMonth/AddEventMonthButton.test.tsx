import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { AddEventMonthButton } from "./AddEventMonthButton";
import { awaitCatalog } from "../../../test/awaitCatalog";

const accessState = vi.hoisted(() => ({ canAddEventMonth: false }));

vi.mock("./useCanAddEventMonth", () => ({
  useCanAddEventMonth: () => accessState.canAddEventMonth,
}));

async function renderButton(fromSlug?: string) {
  const view = render(
    <TestProviders>
      <AddEventMonthButton fromSlug={fromSlug} />
    </TestProviders>,
  );
  await awaitCatalog("gatherings");
  return view;
}

describe("AddEventMonthButton", () => {
  beforeEach(() => {
    accessState.canAddEventMonth = true;
  });

  it("renders nothing for a member without access", async () => {
    accessState.canAddEventMonth = false;
    await renderButton();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("links to the month page", async () => {
    await renderButton();
    expect(
      screen.getByRole("link", { name: "Add a month of events" }),
    ).toHaveAttribute("href", "/create-gathering/month");
  });

  it("starts from this event when a slug is given", async () => {
    await renderButton("drag-night");
    expect(
      screen.getByRole("link", { name: "Add a month from this event" }),
    ).toHaveAttribute("href", "/create-gathering/month?from=drag-night");
  });
});
