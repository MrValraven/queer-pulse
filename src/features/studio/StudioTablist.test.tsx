import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { tabPanelProps } from "../../shared/components/ui";
import { StudioTablist } from "./StudioTablist";

const TABS = [
  { id: "music", labelKey: "studio:artist.tabs.music" },
  { id: "about", labelKey: "studio:artist.tabs.about" },
] as const;

function Harness() {
  const [activeId, setActiveId] =
    useState<(typeof TABS)[number]["id"]>("music");
  return (
    <>
      <StudioTablist
        tabs={TABS}
        activeId={activeId}
        onChange={setActiveId}
        idPrefix="artist"
        label="Artist"
      />
      <div {...tabPanelProps("artist", activeId)}>{activeId}</div>
    </>
  );
}

describe("StudioTablist", () => {
  it("is a real tablist that arrow keys move along", async () => {
    render(
      <TestProviders>
        <Harness />
      </TestProviders>,
    );
    const music = await screen.findByRole("tab", { name: "Music" });
    expect(music).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      music.id,
    );
    fireEvent.keyDown(music, { key: "ArrowRight" });
    const about = screen.getByRole("tab", { name: "About" });
    expect(about).toHaveAttribute("aria-selected", "true");
    expect(about).toHaveFocus();
    expect(music).toHaveAttribute("tabindex", "-1");
  });
});
