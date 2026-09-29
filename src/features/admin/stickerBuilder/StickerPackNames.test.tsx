import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import { TestProviders } from "../../../test/TestProviders";
import { StickerPackNames } from "./StickerPackNames";

function packWith(namePt: string | null): AdminStickerPackResponse {
  return {
    id: "pack-1",
    slug: "pride-flags",
    name: "Pride flags",
    namePt,
    description: null,
    coverStickerId: null,
    status: "draft",
    sortOrder: 0,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    stickers: [],
  };
}

function renderNames(namePt: string | null) {
  render(
    <StickerPackNames
      pack={packWith(namePt)}
      onRename={vi.fn()}
      onRenamePt={vi.fn()}
    />,
    { wrapper: TestProviders },
  );
}

describe("StickerPackNames", () => {
  it("names the saved Portuguese name's button by its visible text first", async () => {
    renderNames("Bandeiras do orgulho");

    const button = await screen.findByRole("button", {
      name: /^In Portuguese: Bandeiras do orgulho/,
    });
    expect(button).not.toHaveAttribute("aria-label");
    expect(button).toHaveAccessibleName(
      /^In Portuguese: Bandeiras do orgulho\s+Edit$/,
    );
  });

  it("names the empty Portuguese line by its invitation alone", async () => {
    renderNames(null);

    const button = await screen.findByRole("button", {
      name: "Add a Portuguese name",
    });
    expect(button).not.toHaveAttribute("aria-label");
  });

  it("keeps the title's rename label, which contains the visible name", async () => {
    renderNames(null);

    expect(
      await screen.findByRole("button", { name: "Rename Pride flags" }),
    ).toBeInTheDocument();
  });
});
