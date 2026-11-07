import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  ADD_MONTH_PLEDGE_ANCHORS,
  AddMonthPublishSection,
} from "./AddMonthPublishSection";
import type { AddMonthBlock } from "./addMonthState";
import { awaitCatalog } from "../../../test/awaitCatalog";

const TOO_LARGE_TEXT =
  "This month has too much text to publish in one go. Shorten a few descriptions, or publish some dates now and the rest after.";

async function renderSection(
  overrides: {
    block?: AddMonthBlock | null;
    isPublishing?: boolean;
    pledges?: [boolean, boolean];
  } = {},
) {
  const onTogglePledge = vi.fn();
  const onPublish = vi.fn();
  const onBlockedPress = vi.fn();
  render(
    <TestProviders>
      <AddMonthPublishSection
        count={8}
        pledges={overrides.pledges ?? [true, true]}
        onTogglePledge={onTogglePledge}
        block={overrides.block ?? null}
        isPublishing={overrides.isPublishing ?? false}
        onPublish={onPublish}
        onBlockedPress={onBlockedPress}
      />
    </TestProviders>,
  );
  await awaitCatalog("gatherings");
  return { onTogglePledge, onPublish, onBlockedPress };
}

/** The pledge checkbox with this anchor id, failing the test when it is missing. */
function pledgeAt(anchorId: string): HTMLElement {
  const pledge = document.getElementById(anchorId);
  if (!pledge) throw new Error(`No pledge carries the id ${anchorId}`);
  return pledge;
}

describe("AddMonthPublishSection", () => {
  it("names the count on the button", async () => {
    await renderSection();
    expect(
      screen.getByRole("button", { name: "Publish 8 events" }),
    ).toBeInTheDocument();
  });

  it("publishes on a press when nothing blocks it", async () => {
    const { onPublish, onBlockedPress } = await renderSection();
    await userEvent.click(
      screen.getByRole("button", { name: "Publish 8 events" }),
    );
    expect(onPublish).toHaveBeenCalledTimes(1);
    expect(onBlockedPress).not.toHaveBeenCalled();
  });

  it("keeps the blocked button focusable, says why, and reports the press", async () => {
    const { onPublish, onBlockedPress } = await renderSection({
      block: { reason: "rowsInvalid", invalidRowCount: 2 },
    });
    const button = screen.getByRole("button", { name: "Publish 8 events" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    expect(
      screen.getByText("2 dates need a change before publishing."),
    ).toBeInTheDocument();
    await userEvent.click(button);
    expect(onBlockedPress).toHaveBeenCalled();
    expect(onPublish).not.toHaveBeenCalled();
  });

  it("toggles each pledge", async () => {
    const { onTogglePledge } = await renderSection({ pledges: [false, true] });
    const pledgeGroup = screen.getByRole("group", {
      name: "Before you publish",
    });
    expect(within(pledgeGroup).getAllByRole("checkbox")).toHaveLength(2);
    const firstPledge = pledgeAt(ADD_MONTH_PLEDGE_ANCHORS[0]);
    const secondPledge = pledgeAt(ADD_MONTH_PLEDGE_ANCHORS[1]);
    expect(firstPledge).toHaveAttribute("role", "checkbox");
    expect(firstPledge).toHaveAttribute("aria-checked", "false");
    expect(secondPledge).toHaveAttribute("aria-checked", "true");
    await userEvent.click(firstPledge);
    await userEvent.click(secondPledge);
    expect(onTogglePledge).toHaveBeenNthCalledWith(1, 0);
    expect(onTogglePledge).toHaveBeenNthCalledWith(2, 1);
  });

  it("names the open pledges when they block publishing", async () => {
    await renderSection({
      block: { reason: "pledgesOpen" },
      pledges: [true, false],
    });
    expect(
      screen.getByText("Tick both pledges to publish."),
    ).toBeInTheDocument();
  });

  it("words both pledges for every event in the month and keeps the Code of Care link", async () => {
    await renderSection();
    expect(
      screen.getByText("These events follow the QueerPulse Code of Care."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The accessibility answers on these events are accurate to the best of my knowledge.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Read the Code of Care" }),
    ).toBeInTheDocument();
  });

  it("holds Publish back while the starting event loads and says why", async () => {
    await renderSection({ block: { reason: "templateLoading" } });
    expect(
      screen.getByRole("button", { name: "Publish 8 events" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByText(
        "The starting event is still loading. Publish once its details show.",
      ),
    ).toBeInTheDocument();
  });

  it("shows progress while publishing and ignores a second press", async () => {
    const { onPublish, onBlockedPress } = await renderSection({
      isPublishing: true,
    });
    const button = screen.getByRole("button", { name: "Publishing 8 events" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(button);
    expect(onPublish).not.toHaveBeenCalled();
    expect(onBlockedPress).not.toHaveBeenCalled();
  });

  it("blocks a month over the size limit and names the cause", async () => {
    await renderSection({ block: { reason: "tooLarge" } });
    expect(
      screen.getByRole("button", { name: "Publish 8 events" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText(TOO_LARGE_TEXT)).toBeInTheDocument();
  });

  it("says every date publishes together", async () => {
    await renderSection();
    expect(
      screen.getByText(
        "Every date publishes together. If one can't, none are published.",
      ),
    ).toBeInTheDocument();
  });
});
