import { describe, expect, it } from "vitest";
import { STUDIO_ARTIST_PERSONA_KINDS } from "../studio/api/studio.types";
import { KIND_SECTIONS } from "./kindSections.data";
import { studioSectionFor } from "./personaStudio";

describe("studioSectionFor", () => {
  it("places each Studio kind's releases in one of its own sections", () => {
    expect(studioSectionFor("musician")).toBe("discography");
    expect(studioSectionFor("dj")).toBe("mixes");
    expect(studioSectionFor("podcaster")).toBe("episodes");
    expect(studioSectionFor("podcast_producer")).toBe("productions");
    expect(studioSectionFor("poet")).toBe("poems");
    expect(studioSectionFor("spoken_word")).toBe("pieces");
    expect(studioSectionFor("drag")).toBe("shows");
    expect(studioSectionFor("performer")).toBe("reel");
    expect(studioSectionFor("dancer")).toBe("reel");
    expect(studioSectionFor("voguer")).toBe("balls");
    expect(studioSectionFor("burlesque")).toBe("acts");
  });

  it("gives every map kind a section the persona page has", () => {
    for (const kind of STUDIO_ARTIST_PERSONA_KINDS) {
      const section = studioSectionFor(kind);
      expect(section).not.toBeNull();
      expect(KIND_SECTIONS[kind]).toContain(section);
    }
  });

  it("has nothing for a kind outside Studio", () => {
    expect(studioSectionFor("writer")).toBeNull();
  });
});
