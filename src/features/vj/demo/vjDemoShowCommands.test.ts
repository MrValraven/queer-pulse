import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type {
  VjDemoCommandContext,
  VjDemoCommandOutcome,
  VjDemoLibraryLookup,
} from "./vjDemoCommandKit";
import {
  applySetCountdown,
  applySetEventCard,
  applySetLogo,
} from "./vjDemoShowCommands";

const STAGE_EPOCH = "33333333-3333-4333-8333-333333333333";
const PACK_LINKED = "11111111-1111-4111-8111-1111111111a1";
const PACK_UNLINKED = "11111111-1111-4111-8111-1111111111a2";
const PACK_MISSING = "11111111-1111-4111-8111-1111111111a9";
const EVENT_ID = "44444444-4444-4444-8444-444444444444";
const NOW = 50_000;
const LEAD_MIN_MS = 1_000;
const LEAD_MAX_MS = 86_400_000;

const PACKS = new Map<string, { eventId: string | null }>([
  [PACK_LINKED, { eventId: EVENT_ID }],
  [PACK_UNLINKED, { eventId: null }],
]);

/** A library that only knows the two packs; every other read finds nothing. */
function demoLibrary(): VjDemoLibraryLookup {
  return {
    hasPack: (packId) => PACKS.has(packId),
    hasClip: () => false,
    isClipInPack: () => false,
    readPackForStage: (packId) => PACKS.get(packId) ?? null,
    existingClipIds: () => new Set<string>(),
    clipIdsInPack: () => new Set<string>(),
    readPackClipForAdvance: () => null,
    readSceneLook: () => null,
    readSetlistItem: () => null,
    setlistItemCount: () => null,
  };
}

const CONTEXT: VjDemoCommandContext = {
  now: NOW,
  library: demoLibrary(),
  connectedScreenIds: new Set<string>(),
  isLeadMicOn: false,
};

function freshState(): VjStageState {
  return { ...createVjStageState(STAGE_EPOCH, 0), revision: 3 };
}

function stateWithPack(packId: string | null): VjStageState {
  return { ...freshState(), activePackId: packId };
}

function errorOf(outcome: VjDemoCommandOutcome): string | null {
  return "error" in outcome ? outcome.error : null;
}

function nextOf(outcome: VjDemoCommandOutcome): VjStageState {
  if ("error" in outcome) {
    throw new Error(`Expected a change, got ${outcome.error}`);
  }
  return outcome.next;
}

function countdown(
  record: Record<string, unknown>,
  state: VjStageState = freshState(),
): VjDemoCommandOutcome {
  return applySetCountdown(state, record, CONTEXT);
}

function eventCard(
  record: Record<string, unknown>,
  state: VjStageState = freshState(),
): VjDemoCommandOutcome {
  return applySetEventCard(state, record, CONTEXT);
}

describe("applySetCountdown", () => {
  it("answers vj_patch_empty when no countdown field is sent", () => {
    expect(errorOf(countdown({}))).toBe("vj_patch_empty");
    expect(errorOf(countdown({ isImmediate: false }))).toBe("vj_patch_empty");
  });

  it("answers vj_countdown_target_conflict for both targetAt and durationMs first", () => {
    expect(
      errorOf(countdown({ targetAt: NOW + 5_000, durationMs: 5_000 })),
    ).toBe("vj_countdown_target_conflict");
    expect(errorOf(countdown({ targetAt: "soon", durationMs: -1 }))).toBe(
      "vj_countdown_target_conflict",
    );
  });

  it("answers vj_countdown_out_of_range for a target outside 1 s to 24 h ahead", () => {
    expect(errorOf(countdown({ targetAt: NOW + LEAD_MIN_MS - 1 }))).toBe(
      "vj_countdown_out_of_range",
    );
    expect(errorOf(countdown({ targetAt: NOW + LEAD_MAX_MS + 1 }))).toBe(
      "vj_countdown_out_of_range",
    );
    expect(errorOf(countdown({ targetAt: NOW + 5_000.5 }))).toBe(
      "vj_countdown_out_of_range",
    );
    expect(errorOf(countdown({ targetAt: "later" }))).toBe(
      "vj_countdown_out_of_range",
    );
    expect(errorOf(countdown({ targetAt: null }))).toBe(
      "vj_countdown_out_of_range",
    );
  });

  it("answers vj_countdown_out_of_range for a duration outside 1000..86400000", () => {
    expect(errorOf(countdown({ durationMs: LEAD_MIN_MS - 1 }))).toBe(
      "vj_countdown_out_of_range",
    );
    expect(errorOf(countdown({ durationMs: LEAD_MAX_MS + 1 }))).toBe(
      "vj_countdown_out_of_range",
    );
    expect(errorOf(countdown({ durationMs: 1_500.5 }))).toBe(
      "vj_countdown_out_of_range",
    );
  });

  it("checks the range before the label", () => {
    expect(errorOf(countdown({ durationMs: 10, label: 7 }))).toBe(
      "vj_countdown_out_of_range",
    );
  });

  it("answers vj_countdown_label_invalid for a non-string or a control character", () => {
    expect(errorOf(countdown({ label: 7 }))).toBe("vj_countdown_label_invalid");
    expect(errorOf(countdown({ label: "Doors\nopen" }))).toBe(
      "vj_countdown_label_invalid",
    );
  });

  it("answers vj_countdown_label_too_long past 40 code points after the trim", () => {
    expect(errorOf(countdown({ label: "a".repeat(41) }))).toBe(
      "vj_countdown_label_too_long",
    );
    const next = nextOf(countdown({ label: `  ${"a".repeat(40)}  ` }));
    expect(next.countdown.label).toBe("a".repeat(40));
  });

  it("checks the label before isVisible", () => {
    expect(errorOf(countdown({ label: 7, isVisible: "yes" }))).toBe(
      "vj_countdown_label_invalid",
    );
  });

  it("answers vj_effect_flag_invalid for a non-boolean isVisible", () => {
    expect(errorOf(countdown({ isVisible: "yes" }))).toBe(
      "vj_effect_flag_invalid",
    );
  });

  it("answers vj_countdown_target_missing when shown with no target", () => {
    expect(errorOf(countdown({ isVisible: true }))).toBe(
      "vj_countdown_target_missing",
    );
  });

  it("showing a finished countdown answers vj_countdown_target_missing", () => {
    const finished: VjStageState = {
      ...freshState(),
      countdown: { isVisible: false, targetAt: NOW - 1, label: "" },
    };
    expect(errorOf(countdown({ isVisible: true }, finished))).toBe(
      "vj_countdown_target_missing",
    );
    const endingNow: VjStageState = {
      ...freshState(),
      countdown: { isVisible: false, targetAt: NOW, label: "" },
    };
    expect(errorOf(countdown({ isVisible: true }, endingNow))).toBe(
      "vj_countdown_target_missing",
    );
  });

  it("a duration sets the target from now", () => {
    const next = nextOf(countdown({ durationMs: 90_000, isVisible: true }));
    expect(next.countdown).toEqual({
      isVisible: true,
      targetAt: NOW + 90_000,
      label: "",
    });
  });

  it("a targetAt lands as sent and keeps the label", () => {
    const labelled: VjStageState = {
      ...freshState(),
      countdown: { isVisible: false, targetAt: null, label: "Doors" },
    };
    const next = nextOf(
      countdown({ targetAt: NOW + LEAD_MAX_MS, isVisible: true }, labelled),
    );
    expect(next.countdown).toEqual({
      isVisible: true,
      targetAt: NOW + LEAD_MAX_MS,
      label: "Doors",
    });
  });

  it("hiding keeps the target and needs none", () => {
    const shown: VjStageState = {
      ...freshState(),
      countdown: { isVisible: true, targetAt: NOW + 5_000, label: "" },
    };
    expect(nextOf(countdown({ isVisible: false }, shown)).countdown).toEqual({
      isVisible: false,
      targetAt: NOW + 5_000,
      label: "",
    });
    expect(nextOf(countdown({ isVisible: false })).countdown.isVisible).toBe(
      false,
    );
  });
});

describe("applySetLogo", () => {
  it("answers vj_patch_empty when no logo field is sent", () => {
    expect(errorOf(applySetLogo(freshState(), {}))).toBe("vj_patch_empty");
  });

  it("answers vj_effect_flag_invalid for a non-boolean isVisible before the corner", () => {
    expect(
      errorOf(applySetLogo(freshState(), { isVisible: 1, corner: "middle" })),
    ).toBe("vj_effect_flag_invalid");
  });

  it("answers vj_logo_corner_invalid for a corner outside the list", () => {
    expect(errorOf(applySetLogo(freshState(), { corner: "middle" }))).toBe(
      "vj_logo_corner_invalid",
    );
  });

  it("shows the logo in the sent corner", () => {
    const next = nextOf(
      applySetLogo(freshState(), { isVisible: true, corner: "topLeft" }),
    );
    expect(next.logo).toEqual({ isVisible: true, corner: "topLeft" });
  });

  it("a corner alone keeps the visibility", () => {
    const shown: VjStageState = {
      ...freshState(),
      logo: { isVisible: true, corner: "bottomRight" },
    };
    expect(nextOf(applySetLogo(shown, { corner: "topRight" })).logo).toEqual({
      isVisible: true,
      corner: "topRight",
    });
  });
});

describe("applySetEventCard", () => {
  it("answers vj_patch_empty when no card field is sent", () => {
    expect(errorOf(eventCard({}))).toBe("vj_patch_empty");
  });

  it("answers vj_effect_flag_invalid for a non-boolean isVisible before the kind", () => {
    expect(errorOf(eventCard({ isVisible: "on", kind: "poster" }))).toBe(
      "vj_effect_flag_invalid",
    );
  });

  it("answers vj_event_card_kind_invalid for a kind outside the list", () => {
    expect(errorOf(eventCard({ kind: "poster" }))).toBe(
      "vj_event_card_kind_invalid",
    );
  });

  it("checks the kind before isImmediate", () => {
    expect(errorOf(eventCard({ kind: "poster", isImmediate: true }))).toBe(
      "vj_event_card_kind_invalid",
    );
  });

  it("answers isImmediate refusals before the pack check", () => {
    expect(errorOf(eventCard({ isVisible: true, isImmediate: true }))).toBe(
      "vj_immediate_not_allowed",
    );
    expect(errorOf(eventCard({ isVisible: true, isImmediate: "now" }))).toBe(
      "vj_effect_flag_invalid",
    );
  });

  it("answers vj_event_card_no_event when shown with no active pack", () => {
    expect(errorOf(eventCard({ isVisible: true }, stateWithPack(null)))).toBe(
      "vj_event_card_no_event",
    );
  });

  it("the card shows for a pack linked to an event and is refused for an unlinked pack", () => {
    const linked = nextOf(
      eventCard(
        { isVisible: true, kind: "nextEvent" },
        stateWithPack(PACK_LINKED),
      ),
    );
    expect(linked.eventCard).toEqual({ isVisible: true, kind: "nextEvent" });
    expect(
      errorOf(eventCard({ isVisible: true }, stateWithPack(PACK_UNLINKED))),
    ).toBe("vj_event_card_no_event");
    expect(
      errorOf(eventCard({ isVisible: true }, stateWithPack(PACK_MISSING))),
    ).toBe("vj_event_card_no_event");
  });

  it("a kind change while the card is shown checks the pack again", () => {
    const shownOnUnlinked: VjStageState = {
      ...stateWithPack(PACK_UNLINKED),
      eventCard: { isVisible: true, kind: "qr" },
    };
    expect(errorOf(eventCard({ kind: "nextEvent" }, shownOnUnlinked))).toBe(
      "vj_event_card_no_event",
    );
  });

  it("hiding the card or changing a hidden card's kind needs no pack", () => {
    const shown: VjStageState = {
      ...stateWithPack(null),
      eventCard: { isVisible: true, kind: "qr" },
    };
    expect(nextOf(eventCard({ isVisible: false }, shown)).eventCard).toEqual({
      isVisible: false,
      kind: "qr",
    });
    expect(
      nextOf(eventCard({ kind: "nextEvent" }, stateWithPack(null))).eventCard,
    ).toEqual({ isVisible: false, kind: "nextEvent" });
  });
});
