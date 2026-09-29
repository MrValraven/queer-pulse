import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { AtTheTableBlock } from "./QuestBlocks";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/**
 * `AtTheTableBlock` is the Quest skin's `afterBio` slot. `skinData` has no
 * server schema, so the block must drop stored values outside the fixed
 * vocabularies and render nothing at all when no known value is left (a
 * cosplayer who never fills it in). Only `TestProviders` for the lazy
 * `subprofiles` catalog, so translated text comes via `findBy*`.
 */
function personaWith(atTheTable: unknown): SkinExtrasPersona {
  return {
    skinData: { atTheTable } as SkinExtrasPersona["skinData"],
    sections: [],
  };
}

describe("AtTheTableBlock", () => {
  it("renders format, vibe, systems and safety tools", async () => {
    render(
      <TestProviders>
        <AtTheTableBlock
          persona={personaWith({
            format: "online",
            where: "Foundry + Discord",
            systems: ["D&D 5e", "  ", "Monsterhearts"],
            safetyTools: ["x_card", "session_zero"],
            vibe: ["queer_led", "cool", "beginner_friendly"],
            price: "Free",
          })}
        />
      </TestProviders>,
    );

    expect(
      await screen.findByRole("heading", { level: 2, name: "At the table" }),
    ).toBeInTheDocument();
    expect(screen.getByText("D&D 5e, Monsterhearts")).toBeInTheDocument();
    expect(await screen.findByText("Session zero")).toBeInTheDocument();
    // Safety tools render in canonical order: session zero before X-card.
    const itemTexts = screen
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(itemTexts.indexOf("Session zero")).toBeGreaterThanOrEqual(0);
    expect(itemTexts.indexOf("Session zero")).toBeLessThan(
      itemTexts.indexOf("X-card"),
    );
    // The unknown vibe "cool" is skipped.
    expect(itemTexts).not.toContain("cool");
  });

  it("renders nothing for an empty or junk block", () => {
    const { container } = render(
      <TestProviders>
        <AtTheTableBlock
          persona={personaWith({
            vibe: "queer_led",
            format: "zoom",
            systems: ["", "   "],
            note: 42,
          })}
        />
      </TestProviders>,
    );

    expect(container.querySelector(".quest-table")).toBeNull();
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
  });
});
