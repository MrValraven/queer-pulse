import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  EMPTY_PERSONA_POST_DRAFT,
  createBodyFromDraft,
  draftFromPost,
  hasPersonaPostChanges,
  personaPostDraftErrors,
  personaPostErrorKeyOf,
  toPersonaPostLinkView,
  toPersonaPostView,
  updateBodyFromDraft,
} from "./personaPosts.adapters";

const dto = {
  id: "post-1",
  body: "New single on Friday",
  linkUrl: "https://www.example.org/show",
  imageUrl: null,
  createdAt: "2026-10-12T10:00:00.000Z",
  editedAt: null,
  canEdit: true,
};

const SAVED_PHOTO = "https://cdn.example.org/personas/p-1/post-1.jpg";

describe("persona post views", () => {
  it("shows a link card with the bare host", () => {
    const view = toPersonaPostView(dto);
    expect(view.link).toEqual({
      href: "https://www.example.org/show",
      host: "example.org",
    });
    expect(view.isEdited).toBe(false);
  });

  it("drops a link that is not https", () => {
    expect(toPersonaPostLinkView("javascript:alert(1)")).toBeNull();
    expect(toPersonaPostLinkView("http://example.org")).toBeNull();
    expect(toPersonaPostLinkView("mailto:hi@example.org")).toBeNull();
  });
});

describe("composer rules", () => {
  it("needs a body and keeps it within 500 characters", () => {
    expect(personaPostDraftErrors(EMPTY_PERSONA_POST_DRAFT).body).toBe(
      "subprofiles:updates.composer.bodyRequired",
    );
    expect(
      personaPostDraftErrors({ ...EMPTY_PERSONA_POST_DRAFT, body: "   " }).body,
    ).toBe("subprofiles:updates.composer.bodyRequired");
    expect(
      personaPostDraftErrors({
        ...EMPTY_PERSONA_POST_DRAFT,
        body: "a".repeat(501),
      }).body,
    ).toBe("subprofiles:updates.composer.bodyTooLong");
    expect(
      personaPostDraftErrors({
        ...EMPTY_PERSONA_POST_DRAFT,
        body: "a".repeat(500),
      }).body,
    ).toBeUndefined();
  });

  it("accepts only an https link, as the server does for posts", () => {
    const draft = { ...EMPTY_PERSONA_POST_DRAFT, body: "Hi" };
    expect(
      personaPostDraftErrors({ ...draft, linkUrl: "example.org" }).linkUrl,
    ).toBe("subprofiles:updates.composer.linkInvalid");
    expect(
      personaPostDraftErrors({ ...draft, linkUrl: "http://example.org" })
        .linkUrl,
    ).toBe("subprofiles:updates.composer.linkInvalid");
    expect(
      personaPostDraftErrors({ ...draft, linkUrl: "mailto:hi@example.org" })
        .linkUrl,
    ).toBe("subprofiles:updates.composer.linkInvalid");
    expect(
      personaPostDraftErrors({ ...draft, linkUrl: "https://example.org" })
        .linkUrl,
    ).toBeUndefined();
    expect(
      personaPostDraftErrors({ ...draft, linkUrl: "" }).linkUrl,
    ).toBeUndefined();
  });

  it("caps the link at 1000 characters", () => {
    const longLink = `https://example.org/${"a".repeat(1000)}`;
    expect(
      personaPostDraftErrors({
        ...EMPTY_PERSONA_POST_DRAFT,
        body: "Hi",
        linkUrl: longLink,
      }).linkUrl,
    ).toBe("subprofiles:updates.composer.linkTooLong");
  });

  it("sends a trimmed body and leaves empty fields out of a create", () => {
    expect(
      createBodyFromDraft({
        body: "  Hello  ",
        linkUrl: " ",
        imageKey: null,
        imagePreviewUrl: null,
      }),
    ).toEqual({ body: "Hello" });
  });

  it("sends only what changed on an edit, and null to clear", () => {
    const post = toPersonaPostView(dto);
    const draft = { ...draftFromPost(post), linkUrl: "" };
    expect(updateBodyFromDraft(draft, post)).toEqual({ linkUrl: null });
    expect(updateBodyFromDraft(draftFromPost(post), post)).toEqual({});
  });

  it("keeps the saved photo by leaving imageKey out of the edit", () => {
    const post = toPersonaPostView({ ...dto, imageUrl: SAVED_PHOTO });
    const body = updateBodyFromDraft(
      { ...draftFromPost(post), body: "New single on Saturday" },
      post,
    );
    expect(body).toEqual({ body: "New single on Saturday" });
    expect("imageKey" in body).toBe(false);
  });

  it("sends null to remove the photo and the fresh key to replace it", () => {
    const post = toPersonaPostView({ ...dto, imageUrl: SAVED_PHOTO });
    expect(
      updateBodyFromDraft(
        { ...draftFromPost(post), imagePreviewUrl: null },
        post,
      ),
    ).toEqual({ imageKey: null });
    expect(
      updateBodyFromDraft(
        {
          ...draftFromPost(post),
          imageKey: "members/m-1/work-image/fresh.jpg",
          imagePreviewUrl: "blob:fresh",
        },
        post,
      ),
    ).toEqual({ imageKey: "members/m-1/work-image/fresh.jpg" });
  });

  it("reads an edit body with no field as unchanged", () => {
    expect(hasPersonaPostChanges({})).toBe(false);
    expect(hasPersonaPostChanges({ linkUrl: null })).toBe(true);
    expect(hasPersonaPostChanges({ imageKey: null })).toBe(true);
    expect(hasPersonaPostChanges({ body: "Hi" })).toBe(true);
  });
});

describe("persona post errors", () => {
  it("names the daily limit, the kind gate and a gone post", () => {
    const refusal = (status: number, code: string) =>
      new ApiError(status, code, { statusCode: status, code, message: code });
    expect(
      personaPostErrorKeyOf(refusal(429, "persona_post_daily_limit")),
    ).toBe("subprofiles:updates.errors.dailyLimit");
    expect(
      personaPostErrorKeyOf(refusal(422, "persona_posts_not_available")),
    ).toBe("subprofiles:updates.errors.notAvailable");
    expect(
      personaPostErrorKeyOf(refusal(422, "persona_post_image_not_allowed")),
    ).toBe("subprofiles:updates.errors.imageNotAllowed");
    expect(personaPostErrorKeyOf(new ApiError(404, "gone"))).toBe(
      "subprofiles:updates.errors.gone",
    );
    expect(personaPostErrorKeyOf(new Error("offline"))).toBe(
      "subprofiles:updates.errors.generic",
    );
  });
});
