import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "../../../test/TestProviders";
import { NowHistoryDisclosure } from "./NowHistoryDisclosure";
import type { NowInsights } from "../api/nowInsights.api";

const HISTORY: NowInsights["history"] = [
  {
    text: "Printing a run of risograph posters for the Anjos street party.",
    startedAt: "2024-06-01T00:00:00.000Z",
    endedAt: "2024-08-01T00:00:00.000Z",
  },
  {
    text: "Learning to sail on the Tejo, badly.",
    startedAt: "2024-03-01T00:00:00.000Z",
    endedAt: "2024-06-01T00:00:00.000Z",
  },
];

function renderDisclosure(history: NowInsights["history"]) {
  return render(
    <TestProviders>
      <NowHistoryDisclosure history={history} />
    </TestProviders>,
  );
}

describe("NowHistoryDisclosure", () => {
  it("renders nothing on an empty history", () => {
    renderDisclosure([]);
    expect(
      screen.queryByRole("button", { name: /Before this/ }),
    ).not.toBeInTheDocument();
  });

  it("shows the entry count collapsed", async () => {
    renderDisclosure(HISTORY);
    // The `members` namespace loads lazily (catalogs/index.ts), so the label
    // resolves after a post-commit effect fetches it. Await it rather than
    // reading the raw key.
    const trigger = await screen.findByRole("button", {
      name: "Before this 2 statuses",
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    // The visible numeral is hidden from the accessibility tree itself, or a
    // screen reader hears both: "Before this, 2, 2 statuses".
    expect(screen.getByText("2")).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByText(
        "Printing a run of risograph posters for the Anjos street party.",
      ),
    ).not.toBeVisible();
  });

  it("reveals the past statuses when opened", async () => {
    renderDisclosure(HISTORY);
    const trigger = await screen.findByRole("button", {
      name: /Before this/,
    });
    await userEvent.click(trigger);
    expect(screen.getByRole("button", { name: /Before this/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(
      screen.getByText(
        "Printing a run of risograph posters for the Anjos street party.",
      ),
    ).toBeVisible();
  });

  it("points aria-controls at the panel it opens", async () => {
    renderDisclosure(HISTORY);
    const trigger = await screen.findByRole("button", {
      name: /Before this/,
    });
    await userEvent.click(trigger);
    const panel = screen.getByRole("region", { name: /Before this/ });
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
  });

  it("shows each entry's date range", async () => {
    renderDisclosure(HISTORY);
    const trigger = await screen.findByRole("button", {
      name: /Before this/,
    });
    await userEvent.click(trigger);
    expect(screen.getByText("June 1, 2024 to August 1, 2024")).toBeVisible();
    expect(screen.getByText("March 1, 2024 to June 1, 2024")).toBeVisible();
  });
});
