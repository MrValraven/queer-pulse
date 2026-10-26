import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { CodeInput } from "./CodeInput";
import { FormField } from "./FormField";
import { digitsOnly, typedText, writeDigits } from "./codeInput.helpers";

interface HarnessProps {
  initialValue?: string;
  onComplete?: (code: string) => void;
  isDisabled?: boolean;
}

function Harness({
  initialValue = "",
  onComplete = () => {},
  isDisabled,
}: HarnessProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <CodeInput
      value={value}
      onChange={setValue}
      onComplete={onComplete}
      isDisabled={isDisabled}
    />
  );
}

/** Names the control the Tab test expects focus to land on after the group. */
const AFTER_LABEL = "After";

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestProviders });
}

function boxes() {
  return screen.getAllByRole<HTMLInputElement>("textbox");
}

/** One box by index, typed for noUncheckedIndexedAccess. */
function box(index: number): HTMLInputElement {
  const element = boxes()[index];
  if (!element) throw new Error(`missing box ${index}`);
  return element;
}

function typedValue() {
  return boxes()
    .map((element) => element.value)
    .join("");
}

describe("codeInput helpers", () => {
  it("keeps only the digits of a pasted message", () => {
    expect(digitsOnly("Your code: 12-34 56")).toBe("123456");
  });

  it("writes digits from the given box on", () => {
    expect(writeDigits("12", 2, "3456").value).toBe("123456");
  });

  it("writes at the end of the value when the index is past it", () => {
    expect(writeDigits("12", 5, "9").value).toBe("129");
  });

  it("drops digits past the code length", () => {
    expect(writeDigits("1234", 4, "789").value).toBe("123478");
  });

  it("keeps only the typed digit beside a box's current digit", () => {
    expect(typedText("37", "3")).toBe("7");
    expect(typedText("73", "3")).toBe("7");
  });

  it("passes a whole autofilled code through", () => {
    expect(typedText("123456", "1")).toBe("123456");
    expect(typedText("5", "")).toBe("5");
  });
});

describe("CodeInput", () => {
  it("renders six numeric one-time-code boxes", () => {
    renderWithProviders(<Harness />);
    const all = boxes();
    expect(all).toHaveLength(6);
    for (const element of all)
      expect(element).toHaveAttribute("inputmode", "numeric");
    expect(box(0)).toHaveAttribute("autocomplete", "one-time-code");
    expect(box(0)).toHaveAccessibleName("Digit 1 of 6");
  });

  it("moves focus forward as digits are typed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    await user.click(box(0));
    await user.keyboard("12");
    expect(typedValue()).toBe("12");
    expect(box(2)).toHaveFocus();
  });

  it("ignores letters", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    await user.click(box(0));
    await user.keyboard("a");
    expect(typedValue()).toBe("");
    expect(box(0)).toHaveFocus();
  });

  it("fills every box from a pasted code with separators", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness initialValue="12345" />);
    await user.click(box(3));
    expect(box(3)).toHaveFocus();
    await user.paste("123 456");
    expect(typedValue()).toBe("123456");
  });

  it("fills from the first box when a whole code lands in a later box", () => {
    const onComplete = vi.fn();
    renderWithProviders(<Harness initialValue="1" onComplete={onComplete} />);
    fireEvent.change(box(1), { target: { value: "123456" } });
    expect(typedValue()).toBe("123456");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("lets Tab leave the group while the code is partial", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <Harness />
        <button type="button" aria-label={AFTER_LABEL} />
      </>,
    );
    await user.click(box(0));
    await user.tab();
    expect(screen.getByRole("button", { name: AFTER_LABEL })).toHaveFocus();
  });

  it("names the group from its label", () => {
    renderWithProviders(
      <CodeInput
        label="Code"
        value=""
        onChange={() => {}}
        onComplete={() => {}}
      />,
    );
    expect(screen.getByRole("group", { name: "Code" })).toBeInTheDocument();
  });

  it("fires onComplete once for a full paste", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithProviders(<Harness onComplete={onComplete} />);
    await user.click(box(0));
    await user.paste("123-456");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("fires onComplete when the sixth digit is typed", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderWithProviders(<Harness onComplete={onComplete} />);
    await user.click(box(0));
    await user.keyboard("12345");
    expect(onComplete).not.toHaveBeenCalled();
    await user.keyboard("6");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("walks back on Backspace in an empty box", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness initialValue="12" />);
    await user.click(box(2));
    expect(box(2)).toHaveFocus();
    await user.keyboard("{Backspace}");
    expect(box(1)).toHaveFocus();
    expect(typedValue()).toBe("1");
  });

  it("takes the id and aria wiring from FormField", () => {
    const { container } = renderWithProviders(
      <FormField label="Code" error="x">
        <CodeInput value="" onChange={() => {}} onComplete={() => {}} />
      </FormField>,
    );
    const label = container.querySelector("label");
    const all = boxes();
    expect(label?.htmlFor).toBeTruthy();
    expect(label?.htmlFor).toBe(box(0).id);
    for (const element of all)
      expect(element).toHaveAttribute("aria-invalid", "true");
  });

  it("refocuses the first empty box when a check finishes", () => {
    const renderCode = (isDisabled: boolean) => (
      <TestProviders>
        <CodeInput
          value="12"
          onChange={() => {}}
          onComplete={() => {}}
          isDisabled={isDisabled}
          shouldAutoFocus
        />
      </TestProviders>
    );
    const { rerender } = render(renderCode(true));
    expect(box(2)).not.toHaveFocus();
    rerender(renderCode(false));
    expect(box(2)).toHaveFocus();
  });

  it("disables every box while isDisabled", () => {
    renderWithProviders(<Harness isDisabled />);
    for (const element of boxes()) expect(element).toBeDisabled();
  });
});
