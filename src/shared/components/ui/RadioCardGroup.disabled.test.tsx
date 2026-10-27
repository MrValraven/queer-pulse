import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioCardGroup, type RadioCardOption } from "./RadioCardGroup";

type LayoutId = "portrait" | "banner" | "bannerAvatar";

function buildOptions(
  disabledIds: LayoutId[] = [],
): RadioCardOption<LayoutId>[] {
  return (["portrait", "banner", "bannerAvatar"] as const).map((layoutId) => ({
    id: layoutId,
    render: layoutId,
    isDisabled: disabledIds.includes(layoutId) || undefined,
  }));
}

function renderGroup(
  value: LayoutId | "",
  onChange: (id: LayoutId) => void,
  disabledIds: LayoutId[] = [],
) {
  return render(
    <RadioCardGroup
      value={value}
      onChange={onChange}
      options={buildOptions(disabledIds)}
      ariaLabel="Layout"
    />,
  );
}

/**
 * `isDisabled` is additive: a group with no disabled option keeps the plain
 * APG radiogroup behaviour, and a disabled option stays in the DOM, focusable
 * and announced, while clicks and arrow movement pass over it.
 */
describe("RadioCardGroup isDisabled", () => {
  it("marks a disabled option with aria-disabled and keeps it a focusable button", () => {
    renderGroup("portrait", vi.fn(), ["banner"]);
    const bannerOption = screen.getByRole("radio", { name: "banner" });
    expect(bannerOption.getAttribute("aria-disabled")).toBe("true");
    expect(bannerOption.hasAttribute("data-disabled")).toBe(true);
    expect(bannerOption.hasAttribute("disabled")).toBe(false);
    const portraitOption = screen.getByRole("radio", { name: "portrait" });
    expect(portraitOption.hasAttribute("aria-disabled")).toBe(false);
  });

  it("does not call onChange when a disabled option is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup("portrait", onChange, ["banner"]);
    await user.click(screen.getByRole("radio", { name: "banner" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("skips a disabled option on arrow movement", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup("portrait", onChange, ["banner"]);
    screen.getByRole("radio", { name: "portrait" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("bannerAvatar");
    expect(document.activeElement).toBe(
      screen.getByRole("radio", { name: "bannerAvatar" }),
    );
  });

  it("does nothing on arrows when every other option is disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup("portrait", onChange, ["banner", "bannerAvatar"]);
    screen.getByRole("radio", { name: "portrait" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("portrait");
    await user.keyboard("{ArrowLeft}");
    expect(onChange).not.toHaveBeenCalledWith("banner");
    expect(onChange).not.toHaveBeenCalledWith("bannerAvatar");
  });

  it("keeps a disabled selected option shown as checked", () => {
    renderGroup("banner", vi.fn(), ["banner"]);
    const bannerOption = screen.getByRole("radio", { name: "banner" });
    expect(bannerOption.getAttribute("aria-checked")).toBe("true");
  });

  it("moves to the next option on arrows when nothing is disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup("portrait", onChange);
    screen.getByRole("radio", { name: "portrait" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("banner");
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith("bannerAvatar");
  });

  it("calls onChange on click when nothing is disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderGroup("portrait", onChange);
    await user.click(screen.getByRole("radio", { name: "banner" }));
    expect(onChange).toHaveBeenCalledWith("banner");
  });
});
