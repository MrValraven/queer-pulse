import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { buildDeckPublishTiming } from "../deckPublishTiming";
import {
  DECK_PUBLISH_VIA_PIECE_CODE,
  linkedDeckPublishFailure,
  publishDeckThroughPiece,
  readDeckPublishViaPiece,
  type PiecePublishCalls,
} from "./useLinkedDeckPublish";

function makeCalls(publishedAt: string | null = null): PiecePublishCalls & {
  publish: ReturnType<typeof vi.fn>;
  unpublish: ReturnType<typeof vi.fn>;
} {
  return {
    publish: vi.fn(() => Promise.resolve({ isPublished: true, publishedAt })),
    unpublish: vi.fn(() =>
      Promise.resolve({ isPublished: false, publishedAt: null }),
    ),
  };
}

function makeApiError(status: number, data: unknown): ApiError {
  return new ApiError(status, "refused", data);
}

describe("publishDeckThroughPiece", () => {
  it("publishes a linked draft deck now through the piece endpoint", async () => {
    const calls = makeCalls("2026-09-29T10:00:00.000Z");

    const publishedAt = await publishDeckThroughPiece(
      "piece-1",
      buildDeckPublishTiming(false, "now", null),
      calls,
    );

    expect(calls.publish).toHaveBeenCalledWith("piece-1", {});
    expect(calls.unpublish).not.toHaveBeenCalled();
    expect(publishedAt).toBe("2026-09-29T10:00:00.000Z");
  });

  it("schedules through the piece endpoint with the chosen instant", async () => {
    const scheduledAt = "2026-10-05T09:00:00.000Z";
    const calls = makeCalls(scheduledAt);

    await publishDeckThroughPiece(
      "piece-1",
      buildDeckPublishTiming(false, "schedule", scheduledAt),
      calls,
    );

    expect(calls.publish).toHaveBeenCalledWith("piece-1", {
      publishedAt: scheduledAt,
    });
  });

  it("unpublishes a live linked deck through the piece endpoint", async () => {
    const calls = makeCalls();

    const publishedAt = await publishDeckThroughPiece(
      "piece-1",
      buildDeckPublishTiming(true, "now", null),
      calls,
    );

    expect(calls.unpublish).toHaveBeenCalledWith("piece-1");
    expect(calls.publish).not.toHaveBeenCalled();
    expect(publishedAt).toBeNull();
  });
});

describe("readDeckPublishViaPiece", () => {
  it("reads the piece id from the deck endpoint's 409", () => {
    const error = makeApiError(409, {
      code: DECK_PUBLISH_VIA_PIECE_CODE,
      pieceId: "piece-1",
    });

    expect(readDeckPublishViaPiece(error)).toBe("piece-1");
  });

  it("ignores any other conflict", () => {
    expect(
      readDeckPublishViaPiece(makeApiError(409, { message: "slug taken" })),
    ).toBeNull();
    expect(readDeckPublishViaPiece(new Error("offline"))).toBeNull();
  });
});

describe("linkedDeckPublishFailure", () => {
  it("names every open care item from the server's refusal", () => {
    const error = makeApiError(400, {
      code: "magazine_care_gate_open",
      message: "held",
      openGateItems: ["Consent: Ana", "Sensitivity read not started"],
    });

    expect(linkedDeckPublishFailure(error)).toEqual({
      key: "magazine:deck.editor.piecePublish.careGateToast",
      values: { items: "Consent: Ana; Sensitivity read not started" },
    });
  });

  it("names the deck's own blockers when it is not ready", () => {
    const error = makeApiError(400, {
      code: "magazine_publish_not_ready",
      message: "not ready",
      openGateItems: ["The deck has no slides yet."],
    });

    expect(linkedDeckPublishFailure(error)).toEqual({
      key: "magazine:deck.editor.piecePublish.notReadyToast",
      values: { items: "The deck has no slides yet." },
    });
  });

  it("falls back to the plain save error for anything else", () => {
    expect(linkedDeckPublishFailure(new Error("offline"))).toEqual({
      key: "magazine:deck.editor.saveError",
    });
  });
});
