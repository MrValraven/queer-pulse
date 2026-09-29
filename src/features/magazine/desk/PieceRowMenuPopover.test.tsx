import { useRef, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { PieceRowMenuPopover } from "./PieceRowMenuPopover";
import type { PieceRowMenuItem } from "./pieceRowMenuItems";

/** A trigger button plus the popover, wired the way `PieceRowMenu` wires
 *  them: `onClose` toggles the popover's mount and, when asked, returns
 *  focus to the trigger. */
function Harness({ items }: { items: PieceRowMenuItem[] }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <button ref={triggerRef} type="button">
        More actions
      </button>
      {isOpen && (
        <PieceRowMenuPopover
          items={items}
          triggerRef={triggerRef}
          label="More actions"
          onClose={(shouldRestoreFocus) => {
            setIsOpen(false);
            if (shouldRestoreFocus) triggerRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

function renderHarness(items: PieceRowMenuItem[]) {
  render(
    <TestProviders>
      <Harness items={items} />
    </TestProviders>,
  );
}

describe("PieceRowMenuPopover focus handling", () => {
  it("returns focus to the trigger before the selected item runs, so a dialog it opens can record the trigger as its opener", () => {
    let wasTriggerFocusedDuringSelect = false;
    const items: PieceRowMenuItem[] = [
      {
        key: "edit",
        label: "Edit",
        icon: FiEdit2,
        onSelect: () => {
          wasTriggerFocusedDuringSelect =
            document.activeElement === triggerButton;
        },
      },
    ];
    renderHarness(items);
    const triggerButton = screen.getByRole("button", { name: "More actions" });

    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(wasTriggerFocusedDuringSelect).toBe(true);
    expect(triggerButton).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    const items: PieceRowMenuItem[] = [
      { key: "edit", label: "Edit", icon: FiEdit2, onSelect: vi.fn() },
    ];
    renderHarness(items);
    const menu = screen.getByRole("menu", { name: "More actions" });

    fireEvent.keyDown(menu, { key: "Escape" });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("button", { name: "More actions" })).toHaveFocus();
  });

  it("closes on Tab and returns focus to the trigger, so Tab never walks out of the open menu", () => {
    const items: PieceRowMenuItem[] = [
      { key: "edit", label: "Edit", icon: FiEdit2, onSelect: vi.fn() },
    ];
    renderHarness(items);
    const menu = screen.getByRole("menu", { name: "More actions" });

    fireEvent.keyDown(menu, { key: "Tab" });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("button", { name: "More actions" })).toHaveFocus();
  });
});
