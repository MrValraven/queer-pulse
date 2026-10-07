import { describe, expect, it } from "vitest";
import {
  FILM_FORMATS,
  MARKETING_VIDEOS,
  filmFileName,
  filmUrl,
} from "./marketingVideos.data";

describe("filmUrl", () => {
  it("keeps the plain page for the 16:9 film", () => {
    expect(filmUrl("pro")).toBe("/marketing-videos/pro.html");
    expect(filmUrl("pro", { format: "landscape" })).toBe(
      "/marketing-videos/pro.html",
    );
    expect(filmUrl("cinematic", { seconds: 52 })).toBe(
      "/marketing-videos/cinematic.html?t=52",
    );
    expect(filmUrl("pro", { seconds: 13.3, format: "landscape" })).toBe(
      "/marketing-videos/pro.html?t=13.3",
    );
  });

  it("asks for the 4:5 layout with format=portrait", () => {
    expect(filmUrl("pro", { format: "portrait" })).toBe(
      "/marketing-videos/pro.html?format=portrait",
    );
    expect(filmUrl("pro", { seconds: 13.3, format: "portrait" })).toBe(
      "/marketing-videos/pro.html?format=portrait&t=13.3",
    );
  });
});

describe("filmFileName", () => {
  it("names the 16:9 file after the film alone", () => {
    expect(filmFileName("pro", "landscape", "mp4")).toBe("queerpulse-pro.mp4");
    expect(filmFileName("vouch", "landscape", "webm")).toBe(
      "queerpulse-vouch.webm",
    );
  });

  it("marks the 4:5 file as portrait", () => {
    expect(filmFileName("pro", "portrait", "mp4")).toBe(
      "queerpulse-pro-portrait.mp4",
    );
  });
});

describe("film formats", () => {
  it("sizes the 16:9 film and the 4:5 Instagram post", () => {
    expect(FILM_FORMATS.landscape).toEqual({ width: 1920, height: 1080 });
    expect(FILM_FORMATS.portrait).toEqual({ width: 1080, height: 1350 });
  });

  it("starts every film on 16:9 and offers 4:5 for pro only", () => {
    for (const video of MARKETING_VIDEOS) {
      expect(video.formats[0]).toBe("landscape");
    }
    expect(
      MARKETING_VIDEOS.filter((video) =>
        video.formats.includes("portrait"),
      ).map((video) => video.id),
    ).toEqual(["pro"]);
  });
});
