import { describe, expect, it } from "vitest";
import type { VouchGraphUrlView } from "./vouchGraph.types";
import { EMPTY_FILTERS } from "./vouchGraphFilters";
import {
  TRUST_NETWORK_PARAM,
  TRUST_NETWORK_PARAMS,
  readVouchGraphUrlView,
  writeVouchGraphUrlView,
} from "./vouchGraphUrlState";

const FULL_VIEW: VouchGraphUrlView = {
  focus: "ines",
  mode: "safety",
  selectedId: "nightowl",
  pathA: "ana",
  pathB: "rui",
  filters: {
    standings: ["flagged", "trusted"],
    sceneId: "lisbon",
    isVerifiedOnly: true,
    connectedFrom: "2026-01",
    connectedTo: "2026-09",
    edgeKinds: ["mutual", "invite"],
    shouldHideWithdrawn: true,
  },
  isListView: true,
};

function roundTrip(view: VouchGraphUrlView): VouchGraphUrlView | null {
  return readVouchGraphUrlView(
    writeVouchGraphUrlView(new URLSearchParams(), view),
  );
}

describe("vouchGraphUrlState", () => {
  it("round-trips every field", () => {
    expect(roundTrip(FULL_VIEW)).toEqual(FULL_VIEW);
  });

  it.each([
    ["plain", "network"],
    ["clusters", "scenes"],
    ["safety", "safety"],
    ["invites", "invites"],
  ] as const)("maps the %s mode to the %s tab", (mode, tab) => {
    const view = { ...FULL_VIEW, mode };
    const written = writeVouchGraphUrlView(new URLSearchParams(), view);
    expect(written.get("tnTab") ?? "network").toBe(tab);
    expect(readVouchGraphUrlView(written)?.mode).toBe(mode);
  });

  it("round-trips a bare focus with defaults", () => {
    const bareView: VouchGraphUrlView = {
      focus: "ana",
      mode: "plain",
      selectedId: null,
      pathA: null,
      pathB: null,
      filters: EMPTY_FILTERS,
      isListView: false,
    };
    const written = writeVouchGraphUrlView(new URLSearchParams(), bareView);
    expect(written.toString()).toBe("tn=ana");
    expect(readVouchGraphUrlView(written)).toEqual(bareView);
  });

  it("returns null without a focus", () => {
    expect(readVouchGraphUrlView(new URLSearchParams("tnTab=safety"))).toBe(
      null,
    );
    expect(readVouchGraphUrlView(new URLSearchParams("tn=%20"))).toBe(null);
  });

  it.each(["toString", "__proto__", "constructor"])(
    "ignores the prototype name %s as a tab",
    (tab) => {
      const params = new URLSearchParams({ tn: "ana", tnTab: tab });
      expect(readVouchGraphUrlView(params)?.mode).toBe("plain");
    },
  );

  it("normalises ids on write so the view reads back the same", () => {
    const view: VouchGraphUrlView = {
      ...FULL_VIEW,
      focus: "  ines ",
      selectedId: "x".repeat(201),
      pathA: " ",
      pathB: "rui",
    };
    expect(roundTrip(view)).toEqual({
      ...FULL_VIEW,
      focus: "ines",
      selectedId: null,
      pathA: null,
      pathB: null,
    });
    expect(
      writeVouchGraphUrlView(new URLSearchParams("page=2"), {
        ...FULL_VIEW,
        focus: "   ",
      }).toString(),
    ).toBe("page=2");
  });

  it("ignores garbage values", () => {
    const params = new URLSearchParams({
      tn: "ana",
      tnTab: "bogus",
      tnB: "rui",
      tnList: "yes",
      tnStanding: "trusted,admin,,trusted",
      tnVerified: "true",
      tnFrom: "2026-13",
      tnTo: "26-01",
      tnEdges: "invite,everything",
      tnHideWithdrawn: "0",
    });
    expect(readVouchGraphUrlView(params)).toEqual({
      focus: "ana",
      mode: "plain",
      selectedId: null,
      pathA: null,
      pathB: null,
      filters: {
        ...EMPTY_FILTERS,
        standings: ["trusted"],
        edgeKinds: ["invite"],
      },
      isListView: false,
    });
  });

  it("writes into a copy and keeps unrelated params", () => {
    const original = new URLSearchParams("page=2&tnSel=old");
    const written = writeVouchGraphUrlView(original, FULL_VIEW);
    expect(original.toString()).toBe("page=2&tnSel=old");
    expect(written.get("page")).toBe("2");
    expect(written.get(TRUST_NETWORK_PARAM)).toBe("ines");
    expect(written.get("tnSel")).toBe("nightowl");
  });

  it("clears every tn param on null", () => {
    const filled = writeVouchGraphUrlView(
      new URLSearchParams("page=2"),
      FULL_VIEW,
    );
    const cleared = writeVouchGraphUrlView(filled, null);
    expect(cleared.toString()).toBe("page=2");
    TRUST_NETWORK_PARAMS.forEach((name) => {
      expect(name.startsWith("tn")).toBe(true);
      expect(cleared.has(name)).toBe(false);
    });
  });
});
