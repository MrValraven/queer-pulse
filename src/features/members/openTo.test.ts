import { describe, expect, it } from "vitest";
import {
  OPEN_TO_PRESETS,
  isPreset,
  openToLabel,
  reasonValue,
  type OpenToEntry,
} from "./openTo.data";
import { MEMBERS } from "./data/members";

/** Stand-in for the real `t` — echoes the key so assertions stay readable. */
const translate = (key: string) => `[${key}]`;

describe("OPEN_TO_PRESETS", () => {
  it("exposes nine ids", () => {
    expect(OPEN_TO_PRESETS).toHaveLength(9);
  });

  it("gives every preset a unique id and a members: labelKey", () => {
    const ids = OPEN_TO_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const preset of OPEN_TO_PRESETS) {
      expect(preset.labelKey).toBe(`members:openTo.${preset.id}`);
    }
  });
});

describe("openToLabel", () => {
  it("resolves a preset through t()", () => {
    const entry: OpenToEntry = { kind: "preset", id: "collaborating" };
    expect(openToLabel(entry, translate)).toBe(
      "[members:openTo.collaborating]",
    );
  });

  it("returns a custom label verbatim, untranslated", () => {
    const entry: OpenToEntry = {
      kind: "custom",
      label: "A grant writer who gets archives",
    };
    expect(openToLabel(entry, translate)).toBe(
      "A grant writer who gets archives",
    );
  });
});

describe("isPreset", () => {
  it("narrows preset entries", () => {
    expect(isPreset({ kind: "preset", id: "mentoring" })).toBe(true);
    expect(isPreset({ kind: "custom", label: "Archive tips" })).toBe(false);
  });
});

describe("reasonValue", () => {
  it("prefixes a preset id", () => {
    expect(reasonValue({ kind: "preset", id: "collaborating" })).toBe(
      "open:collaborating",
    );
  });

  it("prefixes a custom label", () => {
    expect(reasonValue({ kind: "custom", label: "Archive tips" })).toBe(
      "custom:Archive tips",
    );
  });

  it("never collides with a generic REASONS id", () => {
    expect(reasonValue({ kind: "custom", label: "collaborate" })).not.toBe(
      "collaborate",
    );
  });
});

describe("member registry migration", () => {
  const entries = Object.values(MEMBERS).flatMap((member) => member.openTo);

  it("still carries all 97 entries across 36 members", () => {
    expect(entries).toHaveLength(97);
    expect(
      Object.values(MEMBERS).filter((member) => member.openTo.length > 0),
    ).toHaveLength(36);
  });

  it("resolves every entry to a non-empty label", () => {
    for (const entry of entries) {
      expect(openToLabel(entry, translate).trim()).not.toBe("");
    }
  });

  it("only uses ids that exist in the taxonomy", () => {
    const known = new Set(OPEN_TO_PRESETS.map((preset) => preset.id));
    for (const entry of entries) {
      if (isPreset(entry)) expect(known.has(entry.id)).toBe(true);
    }
  });

  it("maps 37 entries to presets and keeps 60 as customs", () => {
    expect(entries.filter(isPreset)).toHaveLength(37);
    expect(entries.filter((entry) => entry.kind === "custom")).toHaveLength(60);
  });

  it("gives every preset id at least two distinct members (the earning rule)", () => {
    const membersById = new Map<string, Set<string>>();
    for (const [slug, member] of Object.entries(MEMBERS)) {
      for (const entry of member.openTo) {
        if (!isPreset(entry)) continue;
        const set = membersById.get(entry.id) ?? new Set<string>();
        set.add(slug);
        membersById.set(entry.id, set);
      }
    }
    for (const preset of OPEN_TO_PRESETS) {
      expect(membersById.get(preset.id)?.size ?? 0).toBeGreaterThanOrEqual(2);
    }
  });

  it("never leaves a custom label empty", () => {
    for (const entry of entries) {
      if (entry.kind === "custom") expect(entry.label.trim()).not.toBe("");
    }
  });
});
