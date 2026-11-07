import { act, fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  VJ_EFFECT_CATALOG,
  type VjEffectId,
  type VjEffectSetting,
} from "../../../../shared/contracts/vj";
import { PointerEventStub } from "../../../../test/pointerEventStub";
import { TestProviders } from "../../../../test/TestProviders";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import { VjEffectPad, type VjPadSendHandler } from "./VjEffectPad";

const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 7,
  isNoop: false,
  applyAt: null,
};

const mouse = { pointerId: 1, pointerType: "mouse", button: 0 } as const;

function settingOf(
  effectId: VjEffectId,
  overrides: Partial<VjEffectSetting> = {},
): VjEffectSetting {
  const entry = VJ_EFFECT_CATALOG[effectId];
  return {
    isOn: false,
    amount: entry.defaultAmount,
    variant: entry.defaultVariant,
    ...overrides,
  };
}

function renderPad(
  options: {
    effectId?: VjEffectId;
    isOn?: boolean;
    setting?: Partial<VjEffectSetting>;
  } = {},
) {
  const effectId = options.effectId ?? "invert";
  const isOn = options.isOn ?? false;
  const onPadSend = vi.fn<VjPadSendHandler>();
  const setEffectSetting = vi.fn(
    (_effectId: VjEffectId, _patch: Partial<VjEffectSetting>) =>
      Promise.resolve(OK_OUTCOME),
  );
  render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjEffectPad
          effectId={effectId}
          setting={settingOf(effectId, { isOn, ...options.setting })}
          isOn={isOn}
          isPending={false}
          isBlocked={false}
          stateRevision={3}
          onPadSend={onPadSend}
          setEffectSetting={setEffectSetting}
        />
      </LazyMotion>
    </TestProviders>,
  );
  const pad = document.querySelector<HTMLButtonElement>(
    `[data-vj-pad="${effectId}"]`,
  );
  if (pad === null) throw new Error("pad not rendered");
  return { pad, onPadSend, setEffectSetting };
}

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("PointerEvent", PointerEventStub);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("VjEffectPad", () => {
  it("a short press latches", () => {
    const { pad, onPadSend } = renderPad();
    fireEvent.pointerDown(pad, mouse);
    advance(100);
    fireEvent.pointerUp(pad, mouse);
    expect(onPadSend.mock.calls).toEqual([["invert", "on", pad]]);
  });

  it("a long press is momentary", () => {
    const { pad, onPadSend } = renderPad();
    fireEvent.pointerDown(pad, mouse);
    advance(300);
    fireEvent.pointerUp(pad, mouse);
    expect(onPadSend.mock.calls).toEqual([
      ["invert", "on", pad],
      ["invert", "off", pad],
    ]);
  });

  it("a latched pad held 500 ms opens the tuner", () => {
    const { pad, onPadSend } = renderPad({ isOn: true });
    fireEvent.pointerDown(pad, mouse);
    advance(500);
    fireEvent.pointerUp(pad, mouse);
    expect(
      screen.getByRole("dialog", { name: "Invert settings" }),
    ).toBeInTheDocument();
    expect(onPadSend).not.toHaveBeenCalled();
  });

  it("the tuner's amount sends at most one value per 50 ms and the final value", () => {
    const { pad, setEffectSetting } = renderPad({
      effectId: "saturate",
      isOn: true,
    });
    fireEvent.contextMenu(pad);
    const slider = screen.getByRole("slider", { name: "Amount" });
    fireEvent.change(slider, { target: { value: "40" } });
    advance(10);
    fireEvent.change(slider, { target: { value: "50" } });
    advance(10);
    fireEvent.change(slider, { target: { value: "60" } });
    expect(setEffectSetting.mock.calls).toEqual([
      ["saturate", { amount: 0.4 }],
    ]);
    fireEvent.pointerUp(slider, mouse);
    expect(setEffectSetting.mock.calls).toEqual([
      ["saturate", { amount: 0.4 }],
      ["saturate", { amount: 0.6 }],
    ]);
  });

  it("a variant chip sends the variant", () => {
    const { pad, setEffectSetting } = renderPad({ isOn: true });
    fireEvent.contextMenu(pad);
    const beatChip = screen.getByRole("button", { name: "On the beat" });
    expect(beatChip).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(beatChip);
    expect(setEffectSetting).toHaveBeenCalledExactlyOnceWith("invert", {
      variant: "beat",
    });
    expect(beatChip).toHaveAttribute("aria-pressed", "true");
  });

  it("Turn off sends the pad off", () => {
    const { pad, onPadSend } = renderPad({ isOn: true });
    fireEvent.contextMenu(pad);
    fireEvent.click(screen.getByRole("button", { name: "Turn off Invert" }));
    expect(onPadSend).toHaveBeenCalledExactlyOnceWith("invert", "off", pad);
  });

  it("mirror shows no amount slider", () => {
    const { pad } = renderPad({ effectId: "mirror", isOn: true });
    fireEvent.contextMenu(pad);
    expect(
      screen.getByRole("dialog", { name: "Mirror settings" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("slider")).toBeNull();
    expect(pad.querySelector("[data-vj-pad-amount]")).toBeNull();
    expect(screen.getByRole("button", { name: "Four ways" })).toBeVisible();
  });

  it("flash-capable pads carry the flash marker", () => {
    const { pad } = renderPad({ effectId: "invert" });
    expect(pad).toHaveAccessibleDescription(/Flashes/);
    expect(pad.querySelector('[data-kind="flash"]')).not.toBeNull();
  });

  it("a pad that cannot flash has no flash marker", () => {
    const { pad } = renderPad({ effectId: "monochrome" });
    expect(pad.querySelector('[data-kind="flash"]')).toBeNull();
    expect(pad).not.toHaveAccessibleDescription(/Flashes/);
  });

  it("the face shows the pad label and the full name stays the accessible name", () => {
    const { pad } = renderPad({ effectId: "kaleidoscope" });
    expect(pad).toHaveAccessibleName(
      "Kaleidoscope. Tap to keep it on, hold to use it while pressed",
    );
    const face = pad.querySelector("[data-vj-pad-face]");
    expect(face?.textContent).toMatch(/^Kaleido/);
  });

  it("the face falls back to the full name when no short label exists", () => {
    const { pad } = renderPad({ effectId: "invert" });
    expect(pad).toHaveTextContent("Invert");
  });

  it("names the pad and shows its latched state", () => {
    const { pad } = renderPad({ isOn: true });
    expect(pad).toHaveAttribute("aria-pressed", "true");
    expect(pad).toHaveAccessibleName(
      "Invert. Tap to keep it on, hold to use it while pressed",
    );
  });
});
