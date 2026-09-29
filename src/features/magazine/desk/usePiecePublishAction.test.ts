import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UseMutationResult } from "@tanstack/react-query";
import { DEMO_RECORD } from "../data/pieceRecord.data";
import type { PieceRecordWithPublish } from "../api/usePieceRecord";
import type { PublishPieceDto } from "../api/piecePublish.api";
import { usePiecePublishAction } from "./usePiecePublishAction";

/**
 * `isAlreadyLive`: the settle case a Ready piece falls into once its own
 * `publishedAt` has passed with no job ever moving it on to Published. The
 * backend's `isPublished` already means "live right now" (narrower than
 * "has a `publishedAt`" only by excluding a scheduled instant), so it is
 * `true` here well before the stage catches up; the piece's own `stage` is
 * what tells settled apart from still-to-settle.
 */

vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}));

function fakeMutation<TVariables>() {
  return {
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
  } as unknown as UseMutationResult<unknown, Error, TVariables>;
}

function renderPublishAction(record: PieceRecordWithPublish | undefined) {
  return renderHook(() =>
    usePiecePublishAction({
      record,
      publish: fakeMutation<PublishPieceDto>(),
      unpublish: fakeMutation<void>(),
    }),
  );
}

describe("usePiecePublishAction", () => {
  it("reads a live-shaped Ready record as already live", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { result } = renderPublishAction({
      ...DEMO_RECORD,
      stage: "ready",
      isPublished: true,
      publishedAt: yesterday,
    });

    expect(result.current.isAlreadyLive).toBe(true);
  });

  it("is not already live once the stage itself is Published", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { result } = renderPublishAction({
      ...DEMO_RECORD,
      stage: "published",
      isPublished: true,
      publishedAt: yesterday,
    });

    expect(result.current.isAlreadyLive).toBe(false);
  });
});
