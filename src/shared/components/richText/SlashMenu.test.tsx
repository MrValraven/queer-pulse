import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { SlashMenu } from "./SlashMenu";

const OPTIONS = [
  { id: "paragraph", label: "Paragraph", hint: "Text" },
  { id: "note", label: "Callout" },
  { id: "section", label: "New section" },
];

function renderMenu(onPick = vi.fn(), onClose = vi.fn()) {
  render(
    <I18nProvider>
      <SlashMenu
        at={{ x: 10, y: 10 }}
        options={OPTIONS}
        onPick={onPick}
        onClose={onClose}
      />
    </I18nProvider>,
  );
  return { onPick, onClose };
}

describe("SlashMenu", () => {
  it("renders one menu item per option, with its hint", () => {
    renderMenu();
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("ParagraphText");
  });

  it("hands the picked option id back", async () => {
    const { onPick } = renderMenu();
    await userEvent.click(screen.getByRole("menuitem", { name: "Callout" }));
    expect(onPick).toHaveBeenCalledWith("note");
  });

  it("cycles focus with the arrow keys and closes on Escape", async () => {
    const { onClose } = renderMenu();
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "New section" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
