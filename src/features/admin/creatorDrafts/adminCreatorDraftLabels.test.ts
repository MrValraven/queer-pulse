import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import {
  creatorDraftMadeForText,
  creatorDraftMissingLabels,
  creatorDraftProgressText,
  creatorDraftTitleText,
} from "./adminCreatorDraftLabels";

const keyEcho: TFunction = (key) => key;

/** Echoes the key with its options joined by "|", so interpolation is visible. */
const keyEchoWithOptions: TFunction = (key, options) =>
  [key, ...Object.values(options ?? {})].join("|");

/** Translates only the listed keys (to "label of <key>") and echoes the rest,
 *  as the real `t` does for a key no catalog holds. */
function translateKnown(knownKeys: string[]): TFunction {
  return (key) => (knownKeys.includes(key) ? `label of ${key}` : key);
}

describe("admin creator draft labels", () => {
  it("names an untitled draft", () => {
    expect(creatorDraftTitleText({ title: null }, keyEcho)).toBe(
      "admin:creatorDrafts.untitled",
    );
    expect(creatorDraftTitleText({ title: "Picnic" }, keyEcho)).toBe("Picnic");
  });

  it("reads progress as done of total and hides a missing one", () => {
    expect(
      creatorDraftProgressText({ done: 4, total: 9 }, keyEchoWithOptions),
    ).toBe("admin:creatorDrafts.progress|4|9");
    expect(creatorDraftProgressText(null, keyEcho)).toBeNull();
  });

  it("maps missing codes to their kind's labels and folds unknown codes into one line", () => {
    const labels = creatorDraftMissingLabels(
      "event",
      ["what", "whenWhere", "brandNewCode", "anotherNewCode"],
      translateKnown([
        "admin:creatorDrafts.missing.event.what",
        "admin:creatorDrafts.missing.event.whenWhere",
      ]),
    );
    expect(labels).toEqual([
      "label of admin:creatorDrafts.missing.event.what",
      "label of admin:creatorDrafts.missing.event.whenWhere",
      "admin:creatorDrafts.missing.other",
    ]);
  });

  it("names who a draft is for", () => {
    expect(
      creatorDraftMadeForText(
        { kind: "community", name: "Rainbow Runners", slug: "rainbow-runners" },
        keyEchoWithOptions,
      ),
    ).toBe("admin:creatorDrafts.madeFor.community|Rainbow Runners");
    expect(creatorDraftMadeForText(null, keyEcho)).toBeNull();
  });
});
