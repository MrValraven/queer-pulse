import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { API_V1 } from "../../../test/msw/handlers";
import { server } from "../../../test/msw/server";
import {
  clampSaveBody,
  creatorDraftErrorCode,
  creatorDraftPath,
  creatorDraftPayloadBytes,
  getCreatorDraft,
  isCreatorDraftFeatureOff,
  readCreatorDraftConflict,
  saveCreatorDraft,
} from "./creatorDrafts.api";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("creator draft wire calls", () => {
  it("builds the three slot paths with the listing ref encoded", () => {
    expect(creatorDraftPath({ kind: "event", listingRef: null })).toBe(
      "/me/creator-drafts/event",
    );
    expect(creatorDraftPath({ kind: "community", listingRef: null })).toBe(
      "/me/creator-drafts/community",
    );
    expect(
      creatorDraftPath({ kind: "listing_edit", listingRef: "casa a/b" }),
    ).toBe("/me/creator-drafts/listing-edit/casa%20a%2Fb");
  });

  it("reads an empty slot as null and a filled slot as its draft", async () => {
    server.use(
      http.get(`${API_V1}/me/creator-drafts/event`, () =>
        HttpResponse.json({ draft: null }),
      ),
    );
    await expect(
      getCreatorDraft({ kind: "event", listingRef: null }),
    ).resolves.toBeNull();
    const draft = {
      payload: { title: "Picnic" },
      payloadVersion: 1,
      revision: 4,
      savedAt: "2026-10-19T10:00:00.000Z",
    };
    server.use(
      http.get(`${API_V1}/me/creator-drafts/event`, () =>
        HttpResponse.json({ draft }),
      ),
    );
    await expect(
      getCreatorDraft({ kind: "event", listingRef: null }),
    ).resolves.toEqual(draft);
  });

  it("reads the revision and saved time out of a 409", async () => {
    server.use(
      http.put(`${API_V1}/me/creator-drafts/community`, () =>
        HttpResponse.json(
          {
            code: "creator_draft_revision_conflict",
            revision: 7,
            savedAt: "2026-10-19T10:05:00.000Z",
          },
          { status: 409 },
        ),
      ),
    );
    const error = await saveCreatorDraft(
      { kind: "community", listingRef: null },
      {
        payload: {},
        payloadVersion: 1,
        baseRevision: 6,
        progress: null,
        missing: null,
      },
    ).catch((caught: unknown) => caught);
    expect(readCreatorDraftConflict(error)).toEqual({
      revision: 7,
      savedAt: "2026-10-19T10:05:00.000Z",
    });
    expect(creatorDraftErrorCode(error)).toBe(
      "creator_draft_revision_conflict",
    );
  });

  it("reads a 409 on an emptied slot as a null revision", () => {
    const error = new ApiError(409, "Draft changed", {
      code: "creator_draft_revision_conflict",
      message: "x",
      revision: null,
      savedAt: null,
    });
    expect(readCreatorDraftConflict(error)).toEqual({
      revision: null,
      savedAt: null,
    });
  });

  it("ignores a 409 that carries another code", () => {
    const error = new ApiError(409, "Taken", { code: "handle_taken" });
    expect(readCreatorDraftConflict(error)).toBeNull();
  });

  it("tells a feature-off 404 from a coded creator draft 404", () => {
    expect(
      isCreatorDraftFeatureOff(
        new ApiError(404, "This feature is not available yet.", {
          message: "This feature is not available yet.",
        }),
      ),
    ).toBe(true);
    expect(
      isCreatorDraftFeatureOff(
        new ApiError(404, "Listing", {
          code: "creator_draft_listing_unavailable",
        }),
      ),
    ).toBe(false);
    expect(isCreatorDraftFeatureOff(new ApiError(500, "Down"))).toBe(false);
  });

  it("measures the payload in UTF-8 bytes", () => {
    expect(creatorDraftPayloadBytes({ name: "ação" })).toBe(
      new TextEncoder().encode('{"name":"ação"}').length,
    );
  });

  it("caps missing codes and progress to the contract limits", () => {
    const body = clampSaveBody({
      payload: {},
      payloadVersion: 1,
      baseRevision: null,
      progress: { done: 9, total: 5 },
      missing: Array.from({ length: 60 }, (_, codeIndex) =>
        `code-${codeIndex}`.padEnd(80, "x"),
      ),
    });
    expect(body.missing).toHaveLength(50);
    expect(body.missing?.[0]).toHaveLength(64);
    expect(body.progress).toEqual({ done: 5, total: 5 });
  });
});
