import { describe, expect, it } from "vitest";
import { kindsMatchingSearch, kindsMatchingWordPrefix } from "./kindSearch";

describe("kindsMatchingSearch (demo mirror)", () => {
  it("finds game masters by DM aliases and PT labels", () => {
    for (const term of [
      "dm",
      "DM",
      "gm",
      "dungeon master",
      "mestre de jogo",
      "narracao",
      "Narração",
    ]) {
      expect(kindsMatchingSearch(term)).toContain("game_master");
    }
  });
  it("matches only at a word start", () => {
    expect(kindsMatchingSearch("aster")).not.toContain("game_master");
  });
  it("requires a whole word for a two-character needle", () => {
    expect(kindsMatchingSearch("es")).toEqual([]);
    expect(kindsMatchingSearch("pr")).toEqual([]);
    expect(kindsMatchingSearch("dm")).toContain("game_master");
    expect(kindsMatchingSearch("gm")).toContain("game_master");
    expect(kindsMatchingSearch("dj")).toContain("dj");
    expect(kindsMatchingSearch("esc")).toContain("ttrpg_designer");
  });
  it("ignores stop words and single characters", () => {
    for (const term of ["", "d", "de", "the"]) {
      expect(kindsMatchingSearch(term)).toEqual([]);
    }
  });
  it("finds every kind by its English label", () => {
    expect(kindsMatchingSearch("photographer")).toContain("photographer");
  });
  it("finds the video and audio creators by the words people use", () => {
    for (const term of ["youtuber", "YouTube", "vlogger", "content creator"]) {
      expect(kindsMatchingSearch(term)).toContain("video_creator");
    }
    for (const term of ["tiktok", "reels", "shorts"]) {
      expect(kindsMatchingSearch(term)).toContain("short_form_creator");
    }
    expect(kindsMatchingSearch("podcast")).toContain("podcaster");
    expect(kindsMatchingSearch("audio editor")).toContain("podcast_producer");
    expect(kindsMatchingSearch("radio")).toContain("radio_host");
    expect(kindsMatchingSearch("rádio")).toContain("radio_host");
  });
});

describe("kindsMatchingWordPrefix (craft picker)", () => {
  it("filters from the first letter", () => {
    expect(kindsMatchingWordPrefix("t")).toContain("tattoo_artist");
    expect(kindsMatchingWordPrefix("t")).toContain("therapist");
    expect(kindsMatchingWordPrefix("ta")).toContain("tattoo_artist");
    expect(kindsMatchingWordPrefix("ta")).not.toContain("therapist");
  });
  it("returns nothing for an empty or blank term", () => {
    expect(kindsMatchingWordPrefix("")).toEqual([]);
    expect(kindsMatchingWordPrefix("   ")).toEqual([]);
  });
  it("matches only at a word start, folding case and accents", () => {
    expect(kindsMatchingWordPrefix("aster")).not.toContain("game_master");
    expect(kindsMatchingWordPrefix("NARR")).toContain("game_master");
    expect(kindsMatchingWordPrefix("narração")).toContain("game_master");
  });
  it("passes over a single-word match that lands on a stop word", () => {
    const kindsForD = kindsMatchingWordPrefix("d");
    expect(kindsForD).toContain("designer");
    expect(kindsForD).toContain("dj");
    const kindsForDe = kindsMatchingWordPrefix("de");
    expect(kindsForDe).toContain("designer");
    expect(kindsForDe).not.toContain("game_master");
    expect(kindsMatchingWordPrefix("da")).toContain("dancer");
    expect(kindsMatchingWordPrefix("da")).not.toContain("art_historian");
    expect(kindsMatchingWordPrefix("e")).not.toContain("circus");
  });
  it("uses the plain word-start rule for a needle with a space", () => {
    expect(kindsMatchingWordPrefix("mestre de")).toContain("game_master");
    expect(kindsMatchingWordPrefix("jogos de")).toContain(
      "board_game_reviewer",
    );
  });
  it("leaves the backend mirror untouched", () => {
    expect(kindsMatchingSearch("t")).toEqual([]);
    expect(kindsMatchingSearch("de")).toEqual([]);
  });
});
