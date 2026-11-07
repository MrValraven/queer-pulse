import type { ReactElement } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  VJ_EFFECT_IDS,
  type VjEffectId,
  type VjEffects,
  type VjEffectSettings,
} from "../../../../../shared/contracts/vj";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalog } from "../../../../../test/awaitCatalog";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import type { useVjDockPads } from "../../hooks/useVjDockPads";
import type { VjActionDispatch } from "../../input/vjRemoteAction";
import { VJ_DEFAULT_DOCK_PADS } from "../../rules/vjDockPads";
import type { VjPadIsOn } from "./VjEffectRow";
import { VjEffectsLibrarySheet } from "./VjEffectsLibrarySheet";

const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 4,
  isNoop: false,
  applyAt: null,
};

type VjDockPadsControl = ReturnType<typeof useVjDockPads>;

function createDockPads(
  pads: readonly VjEffectId[] = VJ_DEFAULT_DOCK_PADS,
): VjDockPadsControl {
  return {
    pads: [...pads],
    add: vi.fn(() => "added" as const),
    remove: vi.fn(),
    move: vi.fn(),
  };
}

function createEffects(settings: VjEffectSettings = {}): VjEffects {
  const effects = createVjStageState("show-library", 0).effects;
  return { ...effects, settings };
}

async function renderSheet(
  overrides: {
    effects?: VjEffects;
    dockPads?: VjDockPadsControl;
    dispatch?: VjActionDispatch;
    setEffectSetting?: () => Promise<VjCommandOutcome>;
    isBlocked?: boolean;
    padIsOn?: VjPadIsOn;
  } = {},
) {
  const dispatch = overrides.dispatch ?? vi.fn();
  const dockPads = overrides.dockPads ?? createDockPads();
  const setEffectSetting =
    overrides.setEffectSetting ?? vi.fn(() => Promise.resolve(OK_OUTCOME));
  const setSpeed = vi.fn(() => Promise.resolve(OK_OUTCOME));
  const ui: ReactElement = (
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjEffectsLibrarySheet
          effects={overrides.effects ?? createEffects()}
          stateRevision={3}
          dockPads={dockPads}
          liveMediaKind="video"
          isBlocked={overrides.isBlocked ?? false}
          dispatch={dispatch}
          padIsOn={overrides.padIsOn}
          setEffectSetting={setEffectSetting}
          setSpeed={setSpeed}
          onClose={() => {}}
        />
      </LazyMotion>
    </TestProviders>
  );
  render(ui);
  await awaitCatalog("vj");
  return { dispatch, dockPads, setEffectSetting, setSpeed };
}

describe("VjEffectsLibrarySheet", () => {
  it("lists the five groups with all 34 effects", async () => {
    await renderSheet();
    const dialog = screen.getByRole("dialog", { name: "All effects" });
    for (const groupName of ["Colour", "Texture", "Geometry", "Time", "Beat"]) {
      expect(
        within(dialog).getByRole("heading", { name: groupName }),
      ).toBeInTheDocument();
    }
    expect(within(dialog).getAllByRole("switch")).toHaveLength(
      VJ_EFFECT_IDS.length,
    );
    expect(VJ_EFFECT_IDS).toHaveLength(34);
  });

  it("the switch turns an effect on through dispatch", async () => {
    const { dispatch } = await renderSheet();
    const invertSwitch = screen.getByRole("switch", { name: "Invert" });
    expect(invertSwitch).toHaveAttribute("aria-checked", "false");
    fireEvent.click(invertSwitch);
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      { kind: "pad", padId: "invert" },
      "press",
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      { kind: "pad", padId: "invert" },
      "release",
    );
  });

  it("a blocked switch sends nothing", async () => {
    const { dispatch } = await renderSheet({ isBlocked: true });
    const glitchSwitch = screen.getByRole("switch", { name: "Glitch" });
    expect(glitchSwitch).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(glitchSwitch);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("flash-capable effects carry the flashing light marker", async () => {
    await renderSheet();
    for (const effectName of ["Invert", "Glitch", "Beat pulse"]) {
      expect(
        screen.getByRole("switch", { name: effectName }),
      ).toHaveAccessibleDescription(expect.stringContaining("Flashes"));
    }
    expect(
      screen.getByRole("switch", { name: "Saturate" }),
    ).not.toHaveAccessibleDescription(expect.stringContaining("Flashes"));
  });

  it("Add to the dock adds a pad", async () => {
    const { dockPads } = await renderSheet();
    fireEvent.click(
      screen.getByRole("button", { name: "Add Hue cycle to the dock" }),
    );
    expect(dockPads.add).toHaveBeenCalledWith("hueCycle");
    fireEvent.click(
      screen.getByRole("button", { name: "Remove Invert from the dock" }),
    );
    expect(dockPads.remove).toHaveBeenCalledWith("invert");
  });

  it("a full dock says it holds 12 pads", async () => {
    const fullPads = VJ_EFFECT_IDS.slice(0, 12);
    const { dockPads } = await renderSheet({
      dockPads: createDockPads(fullPads),
    });
    expect(
      screen.getByText("The dock holds 12 pads. Remove one first"),
    ).toBeInTheDocument();
    const addButton = screen.getByRole("button", {
      name: "Add Mirror to the dock",
    });
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(addButton);
    expect(dockPads.add).not.toHaveBeenCalled();
  });

  it("Move left reorders the dock", async () => {
    const { dockPads } = await renderSheet();
    fireEvent.click(screen.getByRole("button", { name: "Move Invert left" }));
    expect(dockPads.move).toHaveBeenCalledWith("invert", -1);
    fireEvent.click(screen.getByRole("button", { name: "Move Invert right" }));
    expect(dockPads.move).toHaveBeenCalledWith("invert", 1);

    const firstLeft = screen.getByRole("button", {
      name: "Move Black and white left",
    });
    expect(firstLeft).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(firstLeft);
    expect(dockPads.move).toHaveBeenCalledTimes(2);
  });

  it("the amount slider sends the final value on release", async () => {
    const { setEffectSetting } = await renderSheet();
    fireEvent.click(screen.getByRole("button", { name: "Saturate settings" }));
    const slider = await screen.findByRole("slider", { name: "Amount" });
    fireEvent.change(slider, { target: { value: "40" } });
    fireEvent.change(slider, { target: { value: "70" } });
    fireEvent.pointerUp(slider);
    await act(() => Promise.resolve());
    expect(setEffectSetting).toHaveBeenLastCalledWith("saturate", {
      amount: 0.7,
    });
  });

  it("a variant chip sends the variant", async () => {
    const { setEffectSetting } = await renderSheet();
    fireEvent.click(screen.getByRole("button", { name: "Mirror settings" }));
    await act(async () => {
      fireEvent.click(await screen.findByRole("button", { name: "Four ways" }));
    });
    expect(setEffectSetting).toHaveBeenCalledWith("mirror", {
      variant: "quad",
    });
  });

  it("says how many of 8 effects are on", async () => {
    await renderSheet({
      effects: createEffects({
        invert: { isOn: true, amount: 1, variant: "steady" },
        vhs: { isOn: true, amount: 0.6, variant: null },
        freeze: { isOn: true, amount: 1, variant: null },
        dream: { isOn: false, amount: 0.5, variant: null },
      }),
    });
    expect(screen.getByText("3 of 8 effects on")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "VHS" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("keeps the on count in the footer row beside Close effects", async () => {
    await renderSheet();
    const footerStart = screen
      .getByText("0 of 8 effects on")
      .closest("[data-vj-sheet-footer-start]");
    expect(footerStart).not.toBeNull();
    expect(footerStart?.parentElement).toContainElement(
      screen.getByRole("button", { name: "Close effects" }),
    );
  });

  it("the switch shows the optimistic pad state before the server echoes", async () => {
    const padIsOn = vi.fn<VjPadIsOn>((padId, serverIsOn) =>
      padId === "invert" ? true : serverIsOn,
    );
    await renderSheet({ padIsOn });
    expect(padIsOn).toHaveBeenCalledWith("invert", false);
    expect(screen.getByRole("switch", { name: "Invert" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("switch", { name: "Glitch" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("an optimistic off wins over a server on", async () => {
    await renderSheet({
      effects: createEffects({
        vhs: { isOn: true, amount: 0.6, variant: null },
      }),
      padIsOn: (padId, serverIsOn) => (padId === "vhs" ? false : serverIsOn),
    });
    expect(screen.getByRole("switch", { name: "VHS" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });
});
