import { describe, expect, it } from "vitest";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { sectionsForKind } from "./subprofile-kinds";
import { TATTOO_BLOCKS, TATTOO_CHAPTERS } from "./tattooEditorChapters.data";
import {
  TATTOO_COLOURS,
  TATTOO_COMFORT_OPTIONS,
  TATTOO_CONSULTATIONS,
  TATTOO_HYGIENE_PRACTICES,
  TATTOO_STYLES,
  TATTOO_WHAT_TO_SEND,
} from "./skins/tattoo/tattooVocab.data";

const ALL_CONTROLS: SkinBlockControl[] = TATTOO_CHAPTERS.flatMap((chapter) =>
  chapter.groups.flatMap((group) => group.controls),
);

function controlAt(path: string): SkinBlockControl {
  const control = ALL_CONTROLS.find((candidate) => candidate.path === path);
  if (!control) throw new Error(`No control at ${path}`);
  return control;
}

const optionValues = (path: string): string[] =>
  (controlAt(path).options ?? []).map((option) => option.value);

describe("tattoo editor chapters", () => {
  it("lays out eight chapters in the spec's order", () => {
    expect(TATTOO_CHAPTERS.map((chapter) => chapter.key)).toEqual([
      "booking",
      "flash",
      "healed",
      "scarCoverUps",
      "prices",
      "care",
      "outAndAbout",
      "about",
    ]);
  });

  it("edits every tattoo section in exactly one chapter", () => {
    const editedSections = ALL_CONTROLS.filter(
      (control) => control.kind === "sectionList",
    ).map((control) => control.section as string);
    expect([...editedSections].sort()).toEqual(
      [...sectionsForKind("tattoo_artist")].sort(),
    );
    expect(new Set(editedSections).size).toBe(editedSections.length);
  });

  it("derives one block per skinData key and none from a section control", () => {
    expect(TATTOO_BLOCKS.map((block) => block.blockKey)).toEqual([
      "tattoo",
      "tattooBooking",
      "tattooStyles",
      "venue",
      "tattooStudio",
      "tattooScarWork",
      "tattooPrices",
      "tattooComfort",
      "tattooHygiene",
      "tattooLineage",
      "faq",
    ]);
  });

  it("shows the next opening for waitlist and closed and the wait note for waitlist only", () => {
    expect(controlAt("tattoo.nextOpening").showWhen).toEqual({
      path: "tattoo.status",
      values: ["waitlist", "closed"],
    });
    expect(controlAt("tattoo.waitNote").showWhen).toEqual({
      path: "tattoo.status",
      values: ["waitlist"],
    });
  });

  it("offers Message only on a published page and Instagram only with a link", () => {
    const routeOptions = controlAt("tattooBooking.route").options ?? [];
    expect(routeOptions.map((option) => option.value)).toEqual([
      "message",
      "email",
      "form_link",
      "instagram",
    ]);
    expect(routeOptions.map((option) => option.offeredWhen)).toEqual([
      "publishedPage",
      undefined,
      undefined,
      "instagramLink",
    ]);
  });

  it("uses the contract vocabulary for every option list", () => {
    expect(optionValues("tattooBooking.whatToSend")).toEqual([
      ...TATTOO_WHAT_TO_SEND,
    ]);
    expect(optionValues("tattooBooking.consultation")).toEqual([
      ...TATTOO_CONSULTATIONS,
    ]);
    expect(optionValues("tattooStyles.colour")).toEqual([...TATTOO_COLOURS]);
    expect(optionValues("tattooStyles.styles")).toEqual([...TATTOO_STYLES]);
    expect(optionValues("tattooComfort.options")).toEqual([
      ...TATTOO_COMFORT_OPTIONS,
    ]);
    expect(optionValues("tattooHygiene.practices")).toEqual([
      ...TATTOO_HYGIENE_PRACTICES,
    ]);
  });

  it("caps money at six integer digits and the FAQ at twelve questions", () => {
    const moneyControls = ALL_CONTROLS.filter(
      (control) => control.kind === "money",
    );
    expect(moneyControls.length).toBe(4);
    for (const control of moneyControls) {
      expect(control.maxIntegerDigits).toBe(6);
    }
    const faqControl = controlAt("faq");
    expect(faqControl.maxItems).toBe(12);
    const questionField = faqControl.itemFields?.find(
      (field) => field.key === "question",
    );
    const answerField = faqControl.itemFields?.find(
      (field) => field.key === "answer",
    );
    expect(questionField?.maxLength).toBe(200);
    expect(answerField?.maxLength).toBe(1000);
  });

  it("writes only booleans through the seven toggles", () => {
    const togglePaths = ALL_CONTROLS.filter(
      (control) => control.kind === "toggle",
    ).map((control) => control.path);
    expect(togglePaths).toEqual([
      "tattooStudio.isPrivateStudio",
      "tattooStudio.isByAppointmentOnly",
      "tattooScarWork.hasFreeConsult",
      "tattooScarWork.hasReducedPrice",
      "tattooPrices.deposit.isRefundable",
      "tattooPrices.touchUps.isFree",
      "tattooLineage.isTakingApprentices",
    ]);
  });
});
