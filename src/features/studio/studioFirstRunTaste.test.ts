import { afterEach, describe, expect, it } from "vitest";
import { STUDIO_TASTE_STORAGE_KEY } from "./studioFirstRunConstants";
import {
  orderByTaste,
  readStudioTaste,
  readStudioWelcomeSeen,
  writeStudioTaste,
  writeStudioWelcomeSeen,
} from "./studioFirstRunTaste";

afterEach(() => {
  window.localStorage.clear();
});

describe("orderByTaste", () => {
  it("puts the picked values first and keeps each group's order", () => {
    expect(
      orderByTaste(["fado", "pop", "jazz", "folk"], ["folk", "pop"]),
    ).toEqual(["pop", "folk", "fado", "jazz"]);
  });

  it("returns the same array when nothing is picked or nothing matches", () => {
    const values = ["fado", "pop"];
    expect(orderByTaste(values, [])).toBe(values);
    expect(orderByTaste(values, ["jazz"])).toBe(values);
  });
});

describe("the stored welcome picks", () => {
  it("reads back what was written, for the same member only", () => {
    writeStudioTaste("member-1", { genres: ["fado"], moods: ["tender"] });
    expect(readStudioTaste("member-1")).toEqual({
      genres: ["fado"],
      moods: ["tender"],
    });
    expect(readStudioTaste("member-2")).toBeNull();
    expect(readStudioTaste(null)).toBeNull();
  });

  it("drops values outside the vocabularies and ignores a broken record", () => {
    window.localStorage.setItem(
      STUDIO_TASTE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        memberId: "member-1",
        genres: ["fado", "not-a-genre"],
        moods: [42, "calm"],
      }),
    );
    expect(readStudioTaste("member-1")).toEqual({
      genres: ["fado"],
      moods: ["calm"],
    });
    window.localStorage.setItem(STUDIO_TASTE_STORAGE_KEY, "{not json");
    expect(readStudioTaste("member-1")).toBeNull();
  });
});

describe("the welcome-seen bit", () => {
  it("holds only the member id and answers for that member alone", () => {
    writeStudioWelcomeSeen("member-1");
    expect(readStudioWelcomeSeen("member-1")).toBe(true);
    expect(readStudioWelcomeSeen("member-2")).toBe(false);
    expect(
      JSON.parse(window.localStorage.getItem("qp.studio.welcomeSeen.v1")!),
    ).toEqual({ version: 1, memberId: "member-1" });
  });
});
