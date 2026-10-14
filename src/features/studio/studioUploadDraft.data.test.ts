import { describe, expect, it } from "vitest";
import { toReleaseView, type StudioArtistRefView } from "./api/studio.adapters";
import {
  STUDIO_FORMAT_BY_KIND,
  type StudioArtistPersonaKind,
} from "./api/studio.types";
import {
  defaultReleaseForm,
  formFromRelease,
  patchFromForm,
  personaSwitchPatch,
  releaseFieldCopyOf,
  releaseFormErrors,
} from "./studioUploadDraft.data";

const persona = {
  id: "p1",
  handle: "lechat",
  name: "LeChat",
  kind: "dj" as const,
  avatarUrl: null,
};
const release = toReleaseView({
  id: "r1",
  title: "Night bus",
  type: "mix",
  coverUrl: null,
  releasedOn: null,
  trackCount: 0,
  totalDurationSeconds: 0,
  artist: persona,
  description: null,
  genre: null,
  mood: null,
  scene: null,
  status: "draft",
  publishedAt: null,
  tracks: [],
  isOwner: true,
  rightsConfirmedAt: null,
  takedownReason: null,
  sceneId: null,
  personaCredits: [],
});

describe("release form", () => {
  it("offers a DJ persona the mix type by default", () => {
    expect(
      defaultReleaseForm({
        ...persona,
        kindLabelKey: "",
        format: "music",
        initials: "LC",
        tint: "coral",
        href: "",
        personaHref: null,
      }).type,
    ).toBe("mix");
  });

  it("requires a title and caps the description", () => {
    const form = { ...defaultReleaseForm(undefined), title: "   " };
    expect(releaseFormErrors(form).title).toBe(
      "studio:uploadFlow.release.titleRequired",
    );
    const long = { ...form, title: "Ok", description: "x".repeat(2001) };
    expect(releaseFormErrors(long).description).toBe(
      "studio:uploadFlow.release.descriptionTooLong",
    );
    expect(releaseFormErrors({ ...long, description: "fine" })).toEqual({});
  });

  it("sends only the fields that changed, trimmed, with empty values as null", () => {
    const form = {
      subprofileId: "p1",
      type: "mix" as const,
      title: "  Night bus  ",
      genre: "electronic" as const,
      mood: "" as const,
      sceneId: "",
      releasedOn: "",
      description: "  Recorded live  ",
      coverKey: "persona-cover/p1/abc.webp",
      buyUrl: "",
    };
    expect(patchFromForm(form, release)).toEqual({
      genre: "electronic",
      description: "Recorded live",
      coverKey: "persona-cover/p1/abc.webp",
    });
  });

  it("seeds mood and scene from the release, empty when unset", () => {
    const form = formFromRelease({
      ...release,
      mood: "tender",
      sceneId: "scene-1",
    });
    expect(form.mood).toBe("tender");
    expect(form.sceneId).toBe("scene-1");
    expect(formFromRelease(release).sceneId).toBe("");
  });

  it("sends a new mood and scene and clears them with null", () => {
    const base = formFromRelease(release);
    expect(
      patchFromForm({ ...base, mood: "euphoric", sceneId: "scene-2" }, release),
    ).toEqual({ mood: "euphoric", sceneId: "scene-2" });
    const withBoth = {
      ...release,
      mood: "euphoric" as const,
      sceneId: "scene-2",
    };
    expect(patchFromForm({ ...base, mood: "", sceneId: "" }, withBoth)).toEqual(
      { mood: null, sceneId: null },
    );
    expect(patchFromForm(formFromRelease(withBoth), withBoth)).toEqual({});
  });
});

describe("buy link (Studio v3)", () => {
  it("accepts an empty link or an https one", () => {
    const form = { ...formFromRelease(release), buyUrl: "" };
    expect(releaseFormErrors(form).buyUrl).toBeUndefined();
    expect(
      releaseFormErrors({ ...form, buyUrl: "https://shop.example.org/cd" })
        .buyUrl,
    ).toBeUndefined();
  });

  it("refuses http and anything that is not a link", () => {
    const form = formFromRelease(release);
    expect(
      releaseFormErrors({ ...form, buyUrl: "http://shop.example.org" }).buyUrl,
    ).toBe("studio:uploadFlow.v3.buyUrlHttpsOnly");
    expect(releaseFormErrors({ ...form, buyUrl: "my shop" }).buyUrl).toBe(
      "studio:uploadFlow.v3.buyUrlHttpsOnly",
    );
  });

  it("sends a changed link trimmed, and null to clear it", () => {
    const form = formFromRelease(release);
    expect(
      patchFromForm(
        { ...form, buyUrl: "  https://shop.example.org/cd " },
        release,
      ),
    ).toEqual({ buyUrl: "https://shop.example.org/cd" });
    const withLink = { ...release, buyUrl: "https://shop.example.org/cd" };
    expect(
      patchFromForm({ ...formFromRelease(withLink), buyUrl: "" }, withLink),
    ).toEqual({
      buyUrl: null,
    });
    expect(patchFromForm(formFromRelease(withLink), withLink)).toEqual({});
  });

  it("starts a new release with no link", () => {
    expect(defaultReleaseForm(undefined).buyUrl).toBe("");
  });

  it("refuses an over-long link and a link with no host", () => {
    const form = formFromRelease(release);
    expect(
      releaseFormErrors({ ...form, buyUrl: `https://${"a".repeat(1001)}` })
        .buyUrl,
    ).toBe("studio:uploadFlow.v3.buyUrlTooLong");
    expect(releaseFormErrors({ ...form, buyUrl: "https://" }).buyUrl).toBe(
      "studio:uploadFlow.v3.buyUrlHttpsOnly",
    );
  });

  it("treats a whitespace-only link as empty", () => {
    const form = formFromRelease(release);
    expect(
      releaseFormErrors({ ...form, buyUrl: "   " }).buyUrl,
    ).toBeUndefined();
    expect(patchFromForm({ ...form, buyUrl: "   " }, release)).toEqual({});
    const withLink = { ...release, buyUrl: "https://shop.example.org/cd" };
    expect(
      patchFromForm({ ...formFromRelease(withLink), buyUrl: "   " }, withLink),
    ).toEqual({ buyUrl: null });
  });

  it("lowercases the scheme before sending", () => {
    const form = formFromRelease(release);
    expect(
      releaseFormErrors({ ...form, buyUrl: "HTTPS://shop.example.org" }).buyUrl,
    ).toBeUndefined();
    expect(
      patchFromForm(
        { ...form, buyUrl: " HTTPS://Shop.example.org/CD " },
        release,
      ),
    ).toEqual({ buyUrl: "https://Shop.example.org/CD" });
  });
});

describe("artist kinds in the release form", () => {
  const personaOfKind = (kind: StudioArtistPersonaKind) =>
    ({
      id: `p-${kind}`,
      handle: "",
      name: kind,
      kind,
      kindLabelKey: "",
      format: STUDIO_FORMAT_BY_KIND[kind],
      avatarUrl: null,
      initials: "P",
      tint: "coral",
      href: "",
      personaHref: null,
    }) satisfies StudioArtistRefView;

  it("starts each persona on its own first type", () => {
    expect(defaultReleaseForm(personaOfKind("podcaster")).type).toBe("podcast");
    expect(defaultReleaseForm(personaOfKind("drag")).type).toBe("edit");
    expect(defaultReleaseForm(personaOfKind("dj")).type).toBe("mix");
    expect(defaultReleaseForm(undefined).type).toBe("album");
  });

  it("presets Spoken word for poets and spoken word artists", () => {
    expect(defaultReleaseForm(personaOfKind("poet")).genre).toBe("spoken-word");
    expect(defaultReleaseForm(personaOfKind("spoken_word")).genre).toBe(
      "spoken-word",
    );
    expect(defaultReleaseForm(personaOfKind("musician")).genre).toBe("");
  });

  it("names a show's fields and hides its genre", () => {
    expect(releaseFieldCopyOf("podcast")).toEqual({
      titleLabelKey: "studio:uploadFlow.release.showNameLabel",
      descriptionLabelKey: "studio:uploadFlow.release.showAboutLabel",
      isGenreShown: false,
    });
    expect(releaseFieldCopyOf("music").isGenreShown).toBe(true);
  });

  it("clears genre, mood and scene when switching to a show", () => {
    const filled = {
      ...defaultReleaseForm(personaOfKind("musician")),
      genre: "jazz" as const,
      mood: "calm" as const,
      sceneId: "scene-1",
    };
    expect(personaSwitchPatch("podcaster", filled)).toEqual({
      type: "podcast",
      genre: "",
      mood: "",
      sceneId: "",
    });
    expect(personaSwitchPatch("musician", filled).mood).toBe("calm");
  });

  it("drops the Spoken word preset when leaving a spoken word persona", () => {
    const preset = defaultReleaseForm(personaOfKind("poet"));
    expect(personaSwitchPatch("musician", preset).genre).toBe("");
    expect(personaSwitchPatch("spoken_word", preset).genre).toBe("spoken-word");
  });
});
