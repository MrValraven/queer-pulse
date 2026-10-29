import { describe, expect, it } from "vitest";
import { admin as enAdmin } from "./en/admin";
import { admin as ptAdmin } from "./pt/admin";
import { studio as enStudio } from "./en/studio";
import { studio as ptStudio } from "./pt/studio";

type SpotlightNamespace = "admin" | "studio";

const CATALOGS = {
  admin: { en: enAdmin, pt: ptAdmin },
  studio: { en: enStudio, pt: ptStudio },
};

/** Every key the Studio spotlight curation build reads, with its namespace. */
const SPOTLIGHT_KEYS: ReadonlyArray<[SpotlightNamespace, string]> = [
  ["studio", "home.artistOfTheMonth.title"],
  ["studio", "home.artistOfTheMonth.play"],
  ["studio", "home.artistOfTheMonth.openArtist"],
  ["studio", "home.artistOfTheMonth.noteLabel"],
  ["studio", "home.newStars.title"],
  ["studio", "errors.spotlightNotAnArtist"],
  ["studio", "errors.spotlightNoRelease"],
  ["studio", "errors.spotlightSlotFull"],
  ["studio", "errors.spotlightAlreadyInSlot"],
  ["studio", "errors.spotlightOrderMismatch"],
  ["studio", "errors.spotlightNotFound"],
  ["admin", "studioAdmin.tabs.spotlight"],
  ["admin", "studioAdmin.sub"],
  ["admin", "studioAdmin.subCurator"],
  ["admin", "studioAdmin.spotlight.monthTitle"],
  ["admin", "studioAdmin.spotlight.monthEmpty"],
  ["admin", "studioAdmin.spotlight.pickedOn"],
  ["admin", "studioAdmin.spotlight.stale"],
  ["admin", "studioAdmin.spotlight.newStarsTitle"],
  ["admin", "studioAdmin.spotlight.newStarsEmpty"],
  ["admin", "studioAdmin.spotlight.count"],
  ["admin", "studioAdmin.spotlight.addArtist"],
  ["admin", "studioAdmin.spotlight.pickArtist"],
  ["admin", "studioAdmin.spotlight.changeArtist"],
  ["admin", "studioAdmin.spotlight.removeArtist"],
  ["admin", "studioAdmin.spotlight.editNote"],
  ["admin", "studioAdmin.spotlight.notListenable"],
  ["admin", "studioAdmin.spotlight.searchLabel"],
  ["admin", "studioAdmin.spotlight.searchEmpty"],
  ["admin", "studioAdmin.spotlight.alreadyThere"],
  ["admin", "studioAdmin.moveUpAria"],
  ["admin", "studioAdmin.moveDownAria"],
  ["admin", "studioAdmin.spotlight.pickerTitleMonth"],
  ["admin", "studioAdmin.spotlight.pickerTitleNewStars"],
  ["admin", "studioAdmin.spotlight.noteLabel"],
  ["admin", "studioAdmin.spotlight.noteHint"],
  ["admin", "studioAdmin.spotlight.noteDialogTitle"],
  ["admin", "studioAdmin.spotlight.saveNoteCta"],
  ["admin", "studioAdmin.spotlight.noNote"],
  ["admin", "studioAdmin.spotlight.chosen"],
  ["admin", "studioAdmin.spotlight.chooseFirst"],
  ["admin", "studioAdmin.spotlight.pickAria"],
  ["admin", "studioAdmin.spotlight.editNoteAria"],
  ["admin", "studioAdmin.spotlight.removeAria"],
  ["admin", "studioAdmin.spotlight.monthSet"],
  ["admin", "studioAdmin.spotlight.addedToNewStars"],
  ["admin", "studioAdmin.spotlight.removed"],
  ["admin", "staffRoles.musicManagerProducer.desc"],
];

function valueOf(
  namespace: SpotlightNamespace,
  language: "en" | "pt",
  key: string,
): string | undefined {
  const value = (CATALOGS[namespace][language] as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

function tokensAndTagsOf(value: string): string[] {
  return [
    ...(value.match(/\{[A-Za-z0-9_]+\}/g) ?? []),
    ...(value.match(/<\/?[a-z]+>/g) ?? []),
  ].sort();
}

describe("studio spotlight catalog keys", () => {
  it("has every spotlight key in English and Portuguese", () => {
    for (const [namespace, key] of SPOTLIGHT_KEYS) {
      expect(
        valueOf(namespace, "en", key),
        `en ${namespace}:${key}`,
      ).toBeTruthy();
      expect(
        valueOf(namespace, "pt", key),
        `pt ${namespace}:${key}`,
      ).toBeTruthy();
    }
  });

  it("keeps the same {tokens} and <em> tags in both languages", () => {
    for (const [namespace, key] of SPOTLIGHT_KEYS) {
      expect(
        tokensAndTagsOf(valueOf(namespace, "pt", key) ?? ""),
        `${namespace}:${key}`,
      ).toEqual(tokensAndTagsOf(valueOf(namespace, "en", key) ?? ""));
    }
  });

  it("fits the Artists tab and the action labels on a phone row", () => {
    for (const language of ["en", "pt"] as const) {
      expect(
        valueOf("admin", language, "studioAdmin.tabs.spotlight")!.length,
      ).toBeLessThanOrEqual(12);
    }
    for (const label of [
      "addArtist",
      "pickArtist",
      "changeArtist",
      "removeArtist",
      "editNote",
    ]) {
      expect(
        valueOf("admin", "pt", `studioAdmin.spotlight.${label}`)!.length,
        label,
      ).toBeLessThanOrEqual(24);
    }
  });

  it("never says gathering in the new copy", () => {
    for (const [namespace, key] of SPOTLIGHT_KEYS) {
      for (const language of ["en", "pt"] as const) {
        expect(
          valueOf(namespace, language, key) ?? "",
          `${language} ${namespace}:${key}`,
        ).not.toMatch(/gathering|convívio/i);
      }
    }
  });

  it("says what the music manager grant now curates", () => {
    const key = "staffRoles.musicManagerProducer.desc";
    const englishDescription = valueOf("admin", "en", key)!;
    expect(englishDescription).toContain("Artist of the month");
    expect(englishDescription).toContain("New stars");
    expect(valueOf("admin", "pt", key)!).toContain("Artista do mês");
  });
});
