import { afterEach, describe, expect, it, vi } from "vitest";
import {
  findFirstInvalidControl,
  focusFirstError,
  focusFirstErrorAfterRender,
} from "./focusFirstError";

/**
 * Mounts a form and returns it. jsdom has no layout engine, so every element
 * reports 0×0 with no offsetParent — the util treats "no layout information at
 * all" as focusable rather than filtering out the whole document, which is what
 * makes these assertions meaningful here.
 */
function mountForm(html: string): HTMLFormElement {
  const form = document.createElement("form");
  form.innerHTML = html;
  document.body.append(form);
  return form;
}

afterEach(() => {
  document.body.innerHTML = "";
  document.documentElement.removeAttribute("data-reduce-motion");
  vi.restoreAllMocks();
});

describe("findFirstInvalidControl", () => {
  it("returns the first invalid control in DOCUMENT order, not attribute order", () => {
    const form = mountForm(`
      <input id="a" />
      <input id="b" aria-invalid="true" />
      <input id="c" aria-invalid="true" />
    `);
    expect(findFirstInvalidControl(form)?.id).toBe("b");
  });

  it("ignores aria-invalid=\"false\" and absent attributes", () => {
    const form = mountForm(`
      <input id="a" aria-invalid="false" />
      <input id="b" />
    `);
    expect(findFirstInvalidControl(form)).toBeNull();
  });

  it("skips a disabled invalid control and moves to the next one", () => {
    // Focusing a disabled control silently does nothing, which would look
    // exactly like the silent-failure bug this utility exists to fix.
    const form = mountForm(`
      <input id="a" aria-invalid="true" disabled />
      <input id="b" aria-invalid="true" />
    `);
    expect(findFirstInvalidControl(form)?.id).toBe("b");
  });

  it("skips a hidden invalid control", () => {
    const form = mountForm(`
      <input id="a" aria-invalid="true" hidden />
      <textarea id="b" aria-invalid="true"></textarea>
    `);
    expect(findFirstInvalidControl(form)?.id).toBe("b");
  });

  it("descends into a wrapper that flags itself invalid", () => {
    // A composite control (role=group, custom combobox) marks the wrapper, not
    // the focusable node.
    const form = mountForm(`
      <div aria-invalid="true"><span>label</span><input id="inner" /></div>
    `);
    expect(findFirstInvalidControl(form)?.id).toBe("inner");
  });

  it("returns null for an unfocusable invalid element with nothing focusable inside", () => {
    const form = mountForm(`<div aria-invalid="true"><span>nope</span></div>`);
    expect(findFirstInvalidControl(form)).toBeNull();
  });

  it("finds select and textarea, not just input", () => {
    const form = mountForm(`<select id="s" aria-invalid="true"></select>`);
    expect(findFirstInvalidControl(form)?.id).toBe("s");
  });

  it("is scoped to the given root — a second form's errors are not stolen", () => {
    const a = mountForm(`<input id="a" />`);
    mountForm(`<input id="b" aria-invalid="true" />`);
    expect(findFirstInvalidControl(a)).toBeNull();
  });

  it("tolerates a null root", () => {
    expect(findFirstInvalidControl(null)).toBeNull();
    expect(findFirstInvalidControl(undefined)).toBeNull();
  });
});

describe("focusFirstError", () => {
  it("focuses the first invalid control and reports success", () => {
    const form = mountForm(`
      <input id="a" />
      <input id="b" aria-invalid="true" />
    `);
    expect(focusFirstError(form)).toBe(true);
    expect(document.activeElement?.id).toBe("b");
  });

  it("returns false and leaves focus alone when nothing is invalid", () => {
    const form = mountForm(`<input id="a" />`);
    const before = document.activeElement;
    expect(focusFirstError(form)).toBe(false);
    expect(document.activeElement).toBe(before);
  });

  it("focuses with preventScroll, then scrolls deliberately", () => {
    // The browser's own focus scroll pins the field to the top edge, where the
    // sticky Navbar can cover it — so we suppress it and centre the field.
    const form = mountForm(`<input id="b" aria-invalid="true" />`);
    const target = form.querySelector("input")!;
    const focusSpy = vi.spyOn(target, "focus");
    const scrollSpy = vi.fn();
    target.scrollIntoView = scrollSpy;

    focusFirstError(form, { reducedMotion: false });

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
  });

  it("uses instant scrolling when reduced motion is requested", () => {
    const form = mountForm(`<input id="b" aria-invalid="true" />`);
    const target = form.querySelector("input")!;
    const scrollSpy = vi.fn();
    target.scrollIntoView = scrollSpy;

    focusFirstError(form, { reducedMotion: true });

    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: "auto",
      block: "center",
    });
  });

  it("honours the in-app reduce-motion toggle when no override is given", () => {
    // AccessibilityProvider stamps this on <html>; the util reads the same
    // signal the usePrefersReducedMotion hook subscribes to.
    document.documentElement.dataset.reduceMotion = "true";
    const form = mountForm(`<input id="b" aria-invalid="true" />`);
    const target = form.querySelector("input")!;
    const scrollSpy = vi.fn();
    target.scrollIntoView = scrollSpy;

    focusFirstError(form);

    expect(scrollSpy).toHaveBeenCalledWith({
      behavior: "auto",
      block: "center",
    });
  });

  it("still focuses when scroll is turned off", () => {
    const form = mountForm(`<input id="b" aria-invalid="true" />`);
    const target = form.querySelector("input")!;
    const scrollSpy = vi.fn();
    target.scrollIntoView = scrollSpy;

    expect(focusFirstError(form, { scroll: false })).toBe(true);
    expect(document.activeElement?.id).toBe("b");
    expect(scrollSpy).not.toHaveBeenCalled();
  });
});

describe("focusFirstErrorAfterRender", () => {
  it("defers to the next frame, so React has committed the aria-invalid render", async () => {
    const form = mountForm(`<input id="b" />`);
    const target = form.querySelector("input")!;

    focusFirstErrorAfterRender(form);
    // Nothing is invalid yet — this mirrors calling the helper in the same tick
    // as the setState that reveals the errors.
    expect(document.activeElement?.id).not.toBe("b");

    target.setAttribute("aria-invalid", "true");
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    expect(document.activeElement?.id).toBe("b");
  });

  it("can be cancelled before the frame runs", async () => {
    const form = mountForm(`<input id="b" aria-invalid="true" />`);
    const cancel = focusFirstErrorAfterRender(form);
    cancel();

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    expect(document.activeElement?.id).not.toBe("b");
  });
});
