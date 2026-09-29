import { createRef, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeskMenu, type DeskMenuItem, type DeskMenuProps } from "./DeskMenu";
import { foldForTypeahead } from "./useDeskMenuKeyboard";

function sortItems(onSelect: () => void = vi.fn()): DeskMenuItem[] {
  return [
    {
      kind: "action",
      id: "archive",
      label: "Archive",
      onSelect,
      isDisabled: true,
    },
    { kind: "action", id: "newest", label: "Newest first", onSelect },
    { kind: "action", id: "oldest", label: "Oldest first", onSelect },
    { kind: "separator", id: "rule" },
    { kind: "action", id: "deadline", label: "Deadline", onSelect },
  ];
}

function renderMenu(items: DeskMenuItem[], props: Partial<DeskMenuProps> = {}) {
  render(
    <>
      <DeskMenu
        label="Sort pieces"
        items={items}
        renderTrigger={(triggerProps) => (
          <button {...triggerProps}>Sort</button>
        )}
        {...props}
      />
      <button type="button">After</button>
    </>,
  );
  return screen.getByRole("button", { name: "Sort" });
}

async function expectFocused(name: string) {
  await waitFor(() =>
    expect(screen.getByRole("menuitem", { name })).toHaveFocus(),
  );
}

describe("DeskMenu keyboard and dismissal", () => {
  it("wires the trigger to the menu with the menu button attributes", async () => {
    const user = userEvent.setup();
    const trigger = renderMenu(sortItems());
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-controls");

    await user.click(trigger);
    const menu = screen.getByRole("menu", { name: "Sort pieces" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
  });

  it("opens on the first enabled item with ArrowDown, Enter and a click", async () => {
    const user = userEvent.setup();
    const trigger = renderMenu(sortItems());
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await expectFocused("Newest first");

    await user.keyboard("{Escape}");
    await user.keyboard("{Enter}");
    await expectFocused("Newest first");

    await user.keyboard("{Escape}");
    await user.click(trigger);
    await expectFocused("Newest first");
  });

  it("opens on the last item with ArrowUp", async () => {
    const user = userEvent.setup();
    const trigger = renderMenu(sortItems());
    trigger.focus();
    await user.keyboard("{ArrowUp}");
    await expectFocused("Deadline");
  });

  it("roves with the arrow keys, wraps, skips disabled items and jumps with Home and End", async () => {
    const user = userEvent.setup();
    const trigger = renderMenu(sortItems());
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await expectFocused("Newest first");

    await user.keyboard("{ArrowDown}");
    await expectFocused("Oldest first");
    await user.keyboard("{ArrowDown}");
    await expectFocused("Deadline");
    await user.keyboard("{ArrowDown}");
    await expectFocused("Newest first");
    await user.keyboard("{ArrowUp}");
    await expectFocused("Deadline");
    await user.keyboard("{Home}");
    await expectFocused("Newest first");
    await user.keyboard("{End}");
    await expectFocused("Deadline");
  });

  it("jumps to an item by its first letter", async () => {
    const user = userEvent.setup();
    const trigger = renderMenu(sortItems());
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await expectFocused("Newest first");

    await user.keyboard("d");
    await expectFocused("Deadline");
  });

  it("closes on Escape and hands focus back to the trigger", async () => {
    const user = userEvent.setup();
    const trigger = renderMenu(sortItems());
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await expectFocused("Newest first");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes on Tab", async () => {
    const user = userEvent.setup();
    const trigger = renderMenu(sortItems());
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await expectFocused("Newest first");

    await user.keyboard("{Tab}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on a press outside", async () => {
    const user = userEvent.setup();
    const trigger = renderMenu(sortItems());
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "After" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("DeskMenu selection and type-ahead", () => {
  it("runs an action, closes, and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const trigger = renderMenu(sortItems(onSelect));
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Oldest first" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("ignores a disabled action", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const trigger = renderMenu(sortItems(onSelect));
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Archive" }));

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("keeps the menu open while checkbox items are toggled", async () => {
    const user = userEvent.setup();
    function FilterMenu() {
      const [isUrgentOnly, setIsUrgentOnly] = useState(false);
      return (
        <DeskMenu
          label="Filter pieces"
          items={[
            { kind: "heading", id: "show", label: "Show" },
            {
              kind: "checkbox",
              id: "urgent",
              label: "Urgent only",
              description: "Due in the next two days",
              isChecked: isUrgentOnly,
              onSelect: () => setIsUrgentOnly((previous) => !previous),
            },
          ]}
          renderTrigger={(triggerProps) => (
            <button {...triggerProps}>Filter</button>
          )}
        />
      );
    }
    render(<FilterMenu />);
    await user.click(screen.getByRole("button", { name: "Filter" }));
    const urgent = screen.getByRole("menuitemcheckbox", {
      name: "Urgent only",
    });
    expect(urgent).toHaveAttribute("aria-checked", "false");
    expect(urgent).toHaveAccessibleDescription("Due in the next two days");
    expect(screen.getByRole("group", { name: "Show" })).toContainElement(
      urgent,
    );

    await user.click(urgent);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Urgent only" }),
    ).toHaveAttribute("aria-checked", "true");

    await user.keyboard(" ");
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Urgent only" }),
    ).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes after a checkbox when shouldCloseOnSelect is true", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderMenu(
      [
        {
          kind: "checkbox",
          id: "mine",
          label: "Mine",
          isChecked: false,
          onSelect,
        },
      ],
      { shouldCloseOnSelect: true },
    );
    await user.click(screen.getByRole("button", { name: "Sort" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Mine" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("folds accents and case in type-ahead", async () => {
    expect(foldForTypeahead("Última")).toBe("ultima");
    expect(foldForTypeahead("Área")).toBe("area");

    const user = userEvent.setup();
    const onSelect = vi.fn();
    const trigger = renderMenu([
      { kind: "action", id: "index", label: "Índice", onSelect },
      { kind: "action", id: "area", label: "Área", onSelect },
      { kind: "action", id: "last", label: "Última edição", onSelect },
    ]);
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await expectFocused("Índice");
    await user.keyboard("u");
    await expectFocused("Última edição");

    // A fresh open starts with an empty type-ahead buffer.
    await user.keyboard("{Escape}");
    await user.keyboard("{ArrowDown}");
    await expectFocused("Índice");
    await user.keyboard("a");
    await expectFocused("Área");
  });

  it("marks the chosen radio and closes after a radio pick", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderMenu([
      {
        kind: "radio",
        id: "deadline",
        label: "Deadline",
        isChecked: true,
        onSelect,
      },
      {
        kind: "radio",
        id: "newest",
        label: "Newest first",
        isChecked: false,
        onSelect,
      },
    ]);
    await user.click(screen.getByRole("button", { name: "Sort" }));
    expect(
      screen.getByRole("menuitemradio", { name: "Deadline" }),
    ).toHaveAttribute("aria-checked", "true");

    await user.click(
      screen.getByRole("menuitemradio", { name: "Newest first" }),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("DeskMenu placement and trigger composition", () => {
  it("follows its trigger when the trigger moves while open", async () => {
    const user = userEvent.setup();
    let triggerRight = 300;
    // jsdom lays nothing out: give the page a width and the trigger a box.
    Object.defineProperty(document.documentElement, "clientWidth", {
      configurable: true,
      get: () => 1024,
    });
    function MovingFilter() {
      const [count, setCount] = useState(0);
      return (
        <DeskMenu
          label="Filter pieces"
          align="end"
          items={[
            {
              kind: "checkbox",
              id: "urgent",
              label: "Urgent only",
              isChecked: count > 0,
              onSelect: () => setCount((previous) => previous + 1),
            },
          ]}
          renderTrigger={(triggerProps) => (
            <button {...triggerProps}>
              {count > 0 ? `Filter ${count}` : "Filter"}
            </button>
          )}
        />
      );
    }
    render(<MovingFilter />);
    const trigger = screen.getByRole("button", { name: "Filter" });
    trigger.getBoundingClientRect = () => ({
      x: triggerRight - 80,
      y: 20,
      left: triggerRight - 80,
      right: triggerRight,
      top: 20,
      bottom: 50,
      width: 80,
      height: 30,
      toJSON: () => ({}),
    });

    try {
      await user.click(trigger);
      const menu = screen.getByRole("menu");
      await waitFor(() => expect(menu.style.left).toBe("300px"));

      // The label grows, the trigger's right edge moves, and the menu
      // re-renders with it: the per-commit re-place must pick that up.
      triggerRight = 260;
      await user.click(
        screen.getByRole("menuitemcheckbox", { name: "Urgent only" }),
      );
      await waitFor(() => expect(menu.style.left).toBe("260px"));
    } finally {
      Reflect.deleteProperty(document.documentElement, "clientWidth");
    }
  });

  it("hands the trigger node to a caller's triggerRef", async () => {
    const user = userEvent.setup();
    const callerRef = createRef<HTMLButtonElement>();
    const trigger = renderMenu(sortItems(), { triggerRef: callerRef });
    expect(callerRef.current).toBe(trigger);

    await user.click(trigger);
    await expectFocused("Newest first");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("runs onTriggerKeyDown first and skips the menu's handling when it prevents default", async () => {
    const user = userEvent.setup();
    const onTriggerKeyDown = vi.fn(
      (event: { key: string; preventDefault: () => void }) => {
        if (event.key === "ArrowUp") event.preventDefault();
      },
    );
    const trigger = renderMenu(sortItems(), { onTriggerKeyDown });
    trigger.focus();

    await user.keyboard("{ArrowUp}");
    expect(onTriggerKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.keyboard("{ArrowDown}");
    expect(onTriggerKeyDown).toHaveBeenCalledTimes(2);
    await expectFocused("Newest first");
  });
});
