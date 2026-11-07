import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { TattooBlock } from "./TattooBlock";
import { TattooEditProvider } from "./TattooEditContext";
import { TattooStatusPill } from "./TattooStatusPill";
import { awaitCatalog } from "../../../../test/awaitCatalog";

// Unrun per repo policy: verified statically.

function renderFlashBlock(hasContent: boolean) {
  return (
    <TattooBlock
      blockKey="flash"
      heading="Flash"
      hasContent={hasContent}
      emptyBodyKey="subprofiles:tattoo.block.flash.empty"
      emptyActionKey="subprofiles:tattoo.block.flash.action"
    >
      <p>Sheet one</p>
    </TattooBlock>
  );
}

describe("TattooBlock", () => {
  it("hides an empty block from visitors", async () => {
    render(<TestProviders>{renderFlashBlock(false)}</TestProviders>);
    await awaitCatalog("subprofiles");
    expect(screen.queryByRole("region", { name: "Flash" })).toBeNull();
  });

  it("shows the owner an empty block with its add link", async () => {
    render(
      <TestProviders>
        <TattooEditProvider subprofileId="sp-1" isOwner>
          {renderFlashBlock(false)}
        </TattooEditProvider>
      </TestProviders>,
    );
    await awaitCatalog("subprofiles");
    expect(screen.getByText("Add the designs people can book.")).toBeTruthy();
    const link = screen.getByRole("link", { name: "Add flash" });
    expect(
      link
        .getAttribute("href")
        ?.startsWith(
          "/account/subprofiles/sp-1/edit?pane=skinBlocks&chapter=flash",
        ),
    ).toBe(true);
  });

  it("shows a filled block to everyone, named by its heading", async () => {
    render(<TestProviders>{renderFlashBlock(true)}</TestProviders>);
    await awaitCatalog("subprofiles");
    const region = screen.getByRole("region", { name: "Flash" });
    expect(region.textContent).toContain("Sheet one");
  });
});

describe("TattooStatusPill", () => {
  it("shows the next opening for a closed book", async () => {
    render(
      <TestProviders>
        <TattooStatusPill
          status="closed"
          nextOpening="2026-11-03"
          waitNote=""
        />
      </TestProviders>,
    );
    await awaitCatalog("subprofiles");
    expect(screen.getByText("Books closed")).toBeTruthy();
    expect(screen.getByText(/Books open again/)).toBeTruthy();
  });

  it("renders nothing without a status", async () => {
    const { container } = render(
      <TestProviders>
        <TattooStatusPill status={null} nextOpening="" waitNote="" />
      </TestProviders>,
    );
    await awaitCatalog("subprofiles");
    expect(container.textContent).toBe("");
  });
});
