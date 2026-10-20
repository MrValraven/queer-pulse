import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinDateControl } from "./SkinDateControl";
import { SkinToggleControl } from "./SkinToggleControl";

/**
 * The chapter editor's `toggle` and `date` controls over a stand-in editor
 * that serves fixed values and records every write. The label is read from
 * the rendered `<label>`, so the test holds whether or not the lazy
 * `subprofiles` catalog has its copy yet.
 */
const privateStudioControl: SkinBlockControl = {
  path: "tattooStudio.isPrivateStudio",
  kind: "toggle",
  labelKey: "subprofiles:skinBlock.tattoo.tattooStudio.isPrivateStudio",
};

const nextOpeningControl: SkinBlockControl = {
  path: "tattoo.nextOpening",
  kind: "date",
  labelKey: "subprofiles:skinBlock.tattoo.tattoo.nextOpening",
};

function editorStub(
  values: Record<string, unknown>,
  setValue: (path: string, value: unknown) => void,
): SubprofileSkinBlocksEditor {
  return {
    getValue: (path: string) => values[path],
    setValue,
  } as unknown as SubprofileSkinBlocksEditor;
}

function visibleLabelText(container: HTMLElement): string {
  const label = container.querySelector("label");
  if (!label) throw new Error("no visible label");
  return label.textContent ?? "";
}

describe("SkinToggleControl", () => {
  it("stores true when switched on and drops the key when off", async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    const { container, rerender } = render(
      <TestProviders>
        <SkinToggleControl
          control={privateStudioControl}
          editor={editorStub({}, setValue)}
        />
      </TestProviders>,
    );

    const switchOff = screen.getByRole("switch", {
      name: visibleLabelText(container),
    });
    expect(switchOff).toHaveAttribute("aria-checked", "false");
    await user.click(switchOff);
    expect(setValue).toHaveBeenLastCalledWith(
      "tattooStudio.isPrivateStudio",
      true,
    );

    rerender(
      <TestProviders>
        <SkinToggleControl
          control={privateStudioControl}
          editor={editorStub(
            { "tattooStudio.isPrivateStudio": true },
            setValue,
          )}
        />
      </TestProviders>,
    );
    const switchOn = screen.getByRole("switch", {
      name: visibleLabelText(container),
    });
    expect(switchOn).toHaveAttribute("aria-checked", "true");
    await user.click(switchOn);
    expect(setValue).toHaveBeenLastCalledWith(
      "tattooStudio.isPrivateStudio",
      undefined,
    );
  });
});

describe("SkinDateControl", () => {
  it("clears a stored day", async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    render(
      <TestProviders>
        <SkinDateControl
          control={nextOpeningControl}
          editor={editorStub({ "tattoo.nextOpening": "2026-11-03" }, setValue)}
        />
      </TestProviders>,
    );

    await user.click(await screen.findByRole("button", { name: "Clear" }));
    expect(setValue).toHaveBeenLastCalledWith("tattoo.nextOpening", "");
  });
});
