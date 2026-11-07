import { act, fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  type VjEffectId,
  type VjEffects,
} from "../../../../shared/contracts/vj";
import { PointerEventStub } from "../../../../test/pointerEventStub";
import { TestProviders } from "../../../../test/TestProviders";
import { awaitCatalogUnderFakeTimers } from "../../../../test/awaitCatalogUnderFakeTimers";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import type { VjPadSendHandler } from "./VjEffectPad";
import { VjPadsRow, type VjPadsRowProps } from "./VjPadsRow";

const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 2,
  isNoop: false,
  applyAt: null,
};

const DOCK_PADS: readonly VjEffectId[] = ["invert", "tint", "mirror"];

function createEffects(overrides: Partial<VjEffects> = {}): VjEffects {
  return { ...createVjStageState("show-pads", 0).effects, ...overrides };
}

async function renderRow(overrides: Partial<VjPadsRowProps> = {}) {
  const onPadSend = vi.fn<VjPadSendHandler>();
  const onOpenLibrary = vi.fn();
  const props: VjPadsRowProps = {
    pads: DOCK_PADS,
    effects: createEffects(),
    isOnOf: (_padId, serverIsOn) => serverIsOn,
    isPendingOf: () => false,
    isBlocked: false,
    layout: "phone",
    stateRevision: 1,
    onPadSend,
    setEffectSetting: vi.fn(() => Promise.resolve(OK_OUTCOME)),
    onOpenLibrary,
    serverNow: () => Date.now(),
    ...overrides,
  };
  const view = render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjPadsRow {...props} />
      </LazyMotion>
    </TestProviders>,
  );
  await awaitCatalogUnderFakeTimers("vj");
  const row = document.querySelector<HTMLElement>("[data-vj-pads-row]");
  if (row === null) throw new Error("pads row not rendered");
  return { ...view, row, onPadSend, onOpenLibrary };
}

function padIdsOf(row: HTMLElement): string[] {
  return Array.from(row.querySelectorAll<HTMLElement>("[data-vj-pad]")).map(
    (pad) => pad.dataset.vjPad ?? "",
  );
}

function describedByIdsOf(element: HTMLElement): string[] {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter((id) => id !== "");
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("PointerEvent", PointerEventStub);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("VjPadsRow", () => {
  it("renders strobe then the dock pads in order", async () => {
    const { row } = await renderRow();
    expect(padIdsOf(row)).toEqual(["strobe", "invert", "tint", "mirror"]);
    expect(row).toHaveAccessibleName("Effect pads");
    const lastButton = row.querySelectorAll("button")[4];
    // The face shows a short word; the full name stays the button's name.
    expect(lastButton).toHaveAccessibleName("All effects");
    expect(lastButton?.textContent?.trim()).not.toBe("");
  });

  it("All effects opens the library", async () => {
    const { onOpenLibrary } = await renderRow();
    fireEvent.click(screen.getByRole("button", { name: "All effects" }));
    expect(onOpenLibrary).toHaveBeenCalledOnce();
  });

  it("becomes a grid in split layout", async () => {
    const { row, rerender } = await renderRow();
    expect(row).toHaveAttribute("data-layout", "phone");
    rerender(
      <TestProviders>
        <LazyMotion features={domMax}>
          <VjPadsRow
            pads={DOCK_PADS}
            effects={createEffects()}
            isOnOf={(_padId, serverIsOn) => serverIsOn}
            isPendingOf={() => false}
            isBlocked={false}
            layout="split"
            stateRevision={1}
            onPadSend={vi.fn()}
            setEffectSetting={vi.fn(() => Promise.resolve(OK_OUTCOME))}
            onOpenLibrary={vi.fn()}
          />
        </LazyMotion>
      </TestProviders>,
    );
    expect(document.querySelector("[data-vj-pads-row]")).toHaveAttribute(
      "data-layout",
      "split",
    );
  });

  it("the strobe pad counts down from 10 s", async () => {
    const startedAt = Date.now();
    const { row } = await renderRow({
      effects: createEffects({ isStrobing: true, strobeStartedAt: startedAt }),
    });
    act(() => {
      vi.advanceTimersByTime(0);
    });
    const strobe = row.querySelector<HTMLElement>('[data-vj-pad="strobe"]');
    expect(strobe).toHaveAttribute("aria-pressed", "true");
    expect(strobe).toHaveAccessibleDescription(/10 s left/);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(strobe).toHaveAccessibleDescription(/7 s left/);
  });

  it("a strobe tap goes out as the strobe pad's send", async () => {
    const { row, onPadSend } = await renderRow();
    const strobe = row.querySelector<HTMLElement>('[data-vj-pad="strobe"]');
    if (strobe === null) throw new Error("strobe pad not rendered");
    fireEvent.pointerDown(strobe, { pointerId: 1, pointerType: "mouse" });
    fireEvent.pointerUp(strobe, { pointerId: 1, pointerType: "mouse" });
    expect(onPadSend).toHaveBeenCalledExactlyOnceWith("strobe", "on", strobe);
  });

  it("reads each pad's lit state through isOnOf", async () => {
    const { row } = await renderRow({
      effects: createEffects({
        settings: { tint: { isOn: true, amount: 1, variant: "coral" } },
      }),
      isOnOf: (padId, serverIsOn) => (padId === "invert" ? true : serverIsOn),
    });
    const pressedIds = Array.from(
      row.querySelectorAll<HTMLElement>('[data-vj-pad][aria-pressed="true"]'),
    ).map((pad) => pad.dataset.vjPad);
    expect(pressedIds).toEqual(["invert", "tint"]);
  });

  it("a blocked row points every pad at the reason line", async () => {
    const { row } = await renderRow({
      isBlocked: true,
      blockedReasonId: "status-line",
    });
    const pads = Array.from(row.querySelectorAll<HTMLElement>("[data-vj-pad]"));
    expect(pads).toHaveLength(4);
    for (const pad of pads) {
      expect(pad).toHaveAttribute("aria-disabled", "true");
      expect(describedByIdsOf(pad)).toContain("status-line");
    }
  });

  it("an open row names no reason on its pads", async () => {
    const { row } = await renderRow({ blockedReasonId: "status-line" });
    for (const pad of row.querySelectorAll<HTMLElement>("[data-vj-pad]")) {
      expect(describedByIdsOf(pad)).not.toContain("status-line");
    }
  });
});
