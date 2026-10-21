import { describe, expect, it } from "vitest";
import {
  filterStudioList,
  normalizeStudioFilterText,
} from "./useStudioListFilter";

interface Entry {
  addedAt: string;
  track: {
    title: string;
    durationSeconds: number | null;
    release: { artist: { name: string } };
  };
}

const entry = (
  title: string,
  artistName: string,
  addedAt: string,
  durationSeconds: number | null,
): Entry => ({
  addedAt,
  track: { title, durationSeconds, release: { artist: { name: artistName } } },
});

const entries = [
  entry("Saudade", "Mariana Sol", "2026-01-02T00:00:00Z", 240),
  entry("amor de verão", "NIGHTFORM", "2026-03-01T00:00:00Z", 180),
  entry("Bairro", "Ana Lua", "2026-02-01T00:00:00Z", null),
];
const entryText = (item: Entry) =>
  `${item.track.title} ${item.track.release.artist.name}`;
const titles = (items: Entry[]) => items.map((item) => item.track.title);

describe("filterStudioList", () => {
  it("keeps the incoming order for custom", () => {
    expect(titles(filterStudioList(entries, "", "custom", entryText))).toEqual([
      "Saudade",
      "amor de verão",
      "Bairro",
    ]);
  });

  it("matches every word, ignoring case and accents", () => {
    expect(
      titles(filterStudioList(entries, "VERAO amor", "custom", entryText)),
    ).toEqual(["amor de verão"]);
    expect(normalizeStudioFilterText("  São ")).toBe("sao");
  });

  it("sorts by title and by artist from the shared view fields", () => {
    expect(titles(filterStudioList(entries, "", "title", entryText))).toEqual([
      "amor de verão",
      "Bairro",
      "Saudade",
    ]);
    expect(titles(filterStudioList(entries, "", "artist", entryText))).toEqual([
      "Bairro",
      "Saudade",
      "amor de verão",
    ]);
  });

  it("puts the newest first for added and the shortest first for duration, missing last", () => {
    expect(titles(filterStudioList(entries, "", "added", entryText))).toEqual([
      "amor de verão",
      "Bairro",
      "Saudade",
    ]);
    expect(
      titles(filterStudioList(entries, "", "duration", entryText)),
    ).toEqual(["amor de verão", "Saudade", "Bairro"]);
  });

  it("takes explicit accessors over the shared field names", () => {
    const sorted = filterStudioList(entries, "", "title", entryText, {
      title: (item) => item.track.release.artist.name,
    });
    expect(titles(sorted)).toEqual(["Bairro", "Saudade", "amor de verão"]);
  });
});
