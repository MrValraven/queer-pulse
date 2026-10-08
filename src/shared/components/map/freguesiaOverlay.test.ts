import type { Map as MapLibreMap } from "maplibre-gl";
import { describe, expect, it, vi } from "vitest";
import { createFreguesiaOverlay } from "./freguesiaOverlay";

/** Just enough of a MapLibre map to record the feature states it is given. */
function fakeMap() {
  const featureStates = new Map<string, Record<string, unknown>>();
  const map = {
    getStyle: () => ({ layers: [] }),
    getFilter: vi.fn(),
    setFilter: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getSource: vi.fn(() => ({ setData: vi.fn() })),
    getCanvas: () => ({ style: {} }),
    setFeatureState: vi.fn(
      (target: { id: string }, state: Record<string, unknown>) => {
        featureStates.set(target.id, {
          ...featureStates.get(target.id),
          ...state,
        });
      },
    ),
  };
  return { map: map as unknown as MapLibreMap, featureStates };
}

function overlayOn(map: MapLibreMap, selected: string[] = []) {
  return createFreguesiaOverlay(map, {
    counts: {},
    selected: new Set(selected),
    onSelect: () => {},
  });
}

describe("createFreguesiaOverlay highlight", () => {
  it("shades exactly the parishes in the set", () => {
    const { map, featureStates } = fakeMap();
    const overlay = overlayOn(map);
    overlay.setHighlighted(new Set(["Arroios", "Estrela"]));
    expect(featureStates.get("Arroios")?.highlighted).toBe(true);
    expect(featureStates.get("Estrela")?.highlighted).toBe(true);
    expect(featureStates.get("Ajuda")?.highlighted).toBe(false);
  });

  it("clears the shading with an empty set", () => {
    const { map, featureStates } = fakeMap();
    const overlay = overlayOn(map);
    overlay.setHighlighted(new Set(["Arroios"]));
    overlay.setHighlighted(new Set());
    expect(featureStates.get("Arroios")?.highlighted).toBe(false);
  });

  it("leaves the selected parish alone, so a single-selection caller is unchanged", () => {
    const { map, featureStates } = fakeMap();
    const overlay = overlayOn(map, ["Beato"]);
    overlay.setHighlighted(new Set(["Arroios"]));
    expect(featureStates.get("Beato")?.selected).toBe(true);
    expect(featureStates.get("Arroios")?.selected).toBe(false);
    overlay.setSelected(new Set(["Arroios"]));
    expect(featureStates.get("Arroios")?.highlighted).toBe(true);
  });
});
