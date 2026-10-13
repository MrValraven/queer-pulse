import { describe, expect, it } from "vitest";
import { toReleaseView } from "./api/studio.adapters";
import {
  defaultReleaseForm,
  patchFromForm,
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
  status: "draft",
  publishedAt: null,
  tracks: [],
  isOwner: true,
  rightsConfirmedAt: null,
  takedownReason: null,
});

describe("release form", () => {
  it("offers a DJ persona the mix type by default", () => {
    expect(
      defaultReleaseForm({
        ...persona,
        kindLabelKey: "",
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
      releasedOn: "",
      description: "  Recorded live  ",
      coverKey: "persona-cover/p1/abc.webp",
    };
    expect(patchFromForm(form, release)).toEqual({
      genre: "electronic",
      description: "Recorded live",
      coverKey: "persona-cover/p1/abc.webp",
    });
  });
});
