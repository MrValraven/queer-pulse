import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { loadNamespace } from "../../../shared/i18n/catalogs";
import { CommunityFlairChip } from "./CommunityFlairChip";
import { CommunityFlairRing } from "./CommunityFlairRing";

const LANGUAGE_STORAGE_KEY = "qp.lang";

afterEach(() => {
  window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
});

describe("CommunityFlairChip", () => {
  it("shows the badge name with a hidden Badge prefix", async () => {
    render(
      <TestProviders>
        <CommunityFlairChip
          flair={{
            name: "Old friend",
            starterKey: null,
            iconKey: "clock",
            tint: "plum",
          }}
        />
      </TestProviders>,
    );
    await awaitCatalog("communities");

    expect(screen.getByText("Old friend")).toBeInTheDocument();
    const prefix = screen.getByText("Badge:");
    expect(prefix).toHaveClass("visuallyHidden");
    expect(prefix.tagName).toBe("SPAN");
  });

  it("shows a translated starter name in Portuguese", async () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "pt");
    render(
      <TestProviders>
        <CommunityFlairChip
          flair={{
            name: "Old friend",
            starterKey: "old_friend",
            iconKey: "clock",
            tint: "plum",
          }}
        />
      </TestProviders>,
    );
    await act(async () => {
      await loadNamespace("pt", "communities");
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByText("Amizade antiga")).toBeInTheDocument();
    expect(screen.queryByText("Old friend")).not.toBeInTheDocument();
  });

  it("falls back to the jade tint for an unknown tint", async () => {
    const { container } = render(
      <TestProviders>
        <CommunityFlairChip
          flair={{
            name: "Mystery",
            starterKey: null,
            iconKey: "rocket",
            tint: "teal",
          }}
        />
      </TestProviders>,
    );
    await awaitCatalog("communities");

    const chip = screen.getByText("Mystery").parentElement;
    expect(chip?.className).toMatch(/tintJade/);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("uses the larger text class at the md size", async () => {
    render(
      <TestProviders>
        <CommunityFlairChip
          size="md"
          flair={{
            name: "Regulars",
            starterKey: null,
            iconKey: "award",
            tint: "amber",
          }}
        />
      </TestProviders>,
    );
    await awaitCatalog("communities");

    expect(screen.getByText("Regulars").parentElement?.className).toMatch(
      /chipMd/,
    );
  });
});

describe("CommunityFlairRing", () => {
  it("draws no ring without a tint", () => {
    render(
      <CommunityFlairRing tint={null}>
        <span data-testid="avatar">A</span>
      </CommunityFlairRing>,
    );

    const wrapper = screen.getByTestId("avatar").parentElement;
    expect(wrapper?.tagName).toBe("SPAN");
    expect(wrapper?.className ?? "").not.toMatch(/ring/);
  });

  it("draws a ring in the tint when one is given", () => {
    render(
      <CommunityFlairRing tint="rose">
        <span data-testid="avatar">A</span>
      </CommunityFlairRing>,
    );

    const wrapper = screen.getByTestId("avatar").parentElement;
    expect(wrapper?.className).toMatch(/ringRose/);
  });

  it("falls back to the jade ring for an unknown tint", () => {
    render(
      <CommunityFlairRing tint="teal">
        <span data-testid="avatar">A</span>
      </CommunityFlairRing>,
    );

    expect(screen.getByTestId("avatar").parentElement?.className).toMatch(
      /ringJade/,
    );
  });
});
