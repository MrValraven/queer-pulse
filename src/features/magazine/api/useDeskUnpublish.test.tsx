import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { DEMO_PIECES, type Piece } from "../data/desk.data";
import { UNDO_TOAST_LIFETIME_MS } from "../desk/deskPieceUnpublish";
import { useDeskUnpublish } from "./useDeskUnpublish";

/**
 * `useDeskUnpublish` in both modes. The mode, toast and catalog are stubbed
 * (the catalog returns the key and its tokens, so a toast's wording is
 * readable in the assertion) and the sender is stubbed so live mode needs no
 * server.
 */

const modeState = vi.hoisted(() => ({ isDemoMode: true }));
const showToast = vi.hoisted(() => vi.fn());
const apiMocks = vi.hoisted(() => ({
  unpublishPiece: vi.fn(),
  publishPiece: vi.fn(),
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: modeState.isDemoMode }),
}));

vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
    language: "en",
  }),
}));

vi.mock("./piecePublish.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./piecePublish.api")>()),
  unpublishPiece: apiMocks.unpublishPiece,
  publishPiece: apiMocks.publishPiece,
}));

const ORIGINAL_DEMO_PIECES: Piece[] = [...DEMO_PIECES];

function publishedDemoPiece(): Piece {
  const piece = DEMO_PIECES.find(
    (candidate) => candidate.stage === "Published",
  );
  if (!piece) throw new Error("no published demo piece");
  return piece;
}

function renderUnpublish() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useDeskUnpublish(), { wrapper });
  const invalidatedKeys = () =>
    invalidateSpy.mock.calls.map(([filters]) => filters?.queryKey?.[0]);
  return { result, invalidatedKeys, invalidateSpy };
}

beforeEach(() => {
  modeState.isDemoMode = true;
  showToast.mockReset();
  apiMocks.unpublishPiece.mockReset();
  apiMocks.publishPiece.mockReset();
});

afterEach(() => {
  DEMO_PIECES.splice(0, DEMO_PIECES.length, ...ORIGINAL_DEMO_PIECES);
});

describe("useDeskUnpublish (demo mode)", () => {
  it("moves the demo piece to Drafting as a fresh object and clears its publish date", async () => {
    const piece = publishedDemoPiece();
    const { result } = renderUnpublish();

    await act(async () => {
      await result.current.mutateAsync({ piece, stage: "drafting" });
    });

    const moved = DEMO_PIECES.find((candidate) => candidate.id === piece.id);
    expect(moved?.stage).toBe("Drafting");
    expect(moved?.publishedAt).toBeNull();
    expect(moved).not.toBe(piece);
    expect(apiMocks.unpublishPiece).not.toHaveBeenCalled();
  });

  it("moves the demo piece to In review for the review landing", async () => {
    const piece = publishedDemoPiece();
    const { result } = renderUnpublish();

    await act(async () => {
      await result.current.mutateAsync({ piece, stage: "in_review" });
    });

    expect(
      DEMO_PIECES.find((candidate) => candidate.id === piece.id)?.stage,
    ).toBe("In review");
  });
});

describe("useDeskUnpublish (live mode)", () => {
  beforeEach(() => {
    modeState.isDemoMode = false;
  });

  it("posts the chosen stage, refreshes the desk queries and toasts the result with the piece title", async () => {
    apiMocks.unpublishPiece.mockResolvedValue({});
    const piece = publishedDemoPiece();
    const { result, invalidatedKeys } = renderUnpublish();

    await act(async () => {
      await result.current.mutateAsync({ piece, stage: "in_review" });
    });

    expect(apiMocks.unpublishPiece).toHaveBeenCalledWith(piece.id, "in_review");
    expect(invalidatedKeys()).toEqual(
      expect.arrayContaining([
        "magazine-piece",
        "magazine-pieces",
        "magazine-issue-production",
      ]),
    );
    expect(showToast).toHaveBeenCalledWith(
      {
        title: `magazine:desk.pieceToast.unpublishedToReview ${JSON.stringify({ title: piece.title })}`,
        detail: "magazine:desk.pieceToast.unpublishedDetail",
      },
      "success",
      UNDO_TOAST_LIFETIME_MS,
      {
        label: "magazine:desk.pieceToast.undo",
        onClick: expect.any(Function) as () => void,
      },
    );
  });

  it("names the server's own reason in the error toast", async () => {
    apiMocks.unpublishPiece.mockRejectedValue(
      new ApiError(409, "This piece is not published.", {
        code: "magazine_piece_not_published",
      }),
    );
    const piece = publishedDemoPiece();
    const { result } = renderUnpublish();

    act(() => result.current.mutate({ piece, stage: "drafting" }));

    await waitFor(() => expect(showToast).toHaveBeenCalled());
    expect(showToast).toHaveBeenCalledWith(
      {
        title: `magazine:desk.pieceToast.unpublishFailed ${JSON.stringify({ title: piece.title })}`,
        detail: "This piece is not published.",
      },
      "error",
    );
  });

  it("names the missing connection when the request never got an answer", async () => {
    apiMocks.unpublishPiece.mockRejectedValue(new TypeError("Failed to fetch"));
    const piece = publishedDemoPiece();
    const { result } = renderUnpublish();

    act(() => result.current.mutate({ piece, stage: "drafting" }));

    await waitFor(() => expect(showToast).toHaveBeenCalled());
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      detail: "magazine:desk.pieceToast.unpublishNoConnection",
    });
  });
});

/** Runs the Undo button the success toast carried. */
function pressUndo() {
  const undoAction = showToast.mock.calls[0]?.[3] as
    { label: string; onClick: () => void } | undefined;
  if (!undoAction) throw new Error("the success toast carried no action");
  act(() => undoAction.onClick());
}

const REPUBLISHED_TOAST = (title: string) =>
  `magazine:desk.pieceToast.republished ${JSON.stringify({ title })}`;

describe("useDeskUnpublish Undo (demo mode)", () => {
  it("puts the demo piece back to Published at its previous publish date, offline", async () => {
    const piece = publishedDemoPiece();
    const { result } = renderUnpublish();

    await act(async () => {
      await result.current.mutateAsync({ piece, stage: "drafting" });
    });
    expect(
      DEMO_PIECES.find((candidate) => candidate.id === piece.id)?.stage,
    ).toBe("Drafting");

    pressUndo();

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        REPUBLISHED_TOAST(piece.title),
        "success",
      ),
    );
    const restored = DEMO_PIECES.find((candidate) => candidate.id === piece.id);
    expect(restored?.stage).toBe("Published");
    expect(restored?.publishedAt).toBe(piece.publishedAt);
    expect(apiMocks.publishPiece).not.toHaveBeenCalled();
  });
});

describe("useDeskUnpublish Undo (live mode)", () => {
  beforeEach(() => {
    modeState.isDemoMode = false;
  });

  it("republishes at the original instant, refreshes the four desk queries and toasts", async () => {
    apiMocks.unpublishPiece.mockResolvedValue({});
    apiMocks.publishPiece.mockResolvedValue({});
    const piece: Piece = {
      ...publishedDemoPiece(),
      publishedAt: "2026-07-01T09:30:00.000Z",
    };
    const { result, invalidateSpy } = renderUnpublish();
    await act(async () => {
      await result.current.mutateAsync({ piece, stage: "drafting" });
    });
    invalidateSpy.mockClear();

    pressUndo();

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        REPUBLISHED_TOAST(piece.title),
        "success",
      ),
    );
    expect(apiMocks.publishPiece).toHaveBeenCalledWith(piece.id, {
      publishedAt: "2026-07-01T09:30:00.000Z",
    });
    expect(
      invalidateSpy.mock.calls.map(([filters]) => filters?.queryKey),
    ).toEqual([
      ["magazine-piece", piece.id],
      ["magazine-pieces"],
      ["magazine-issue-production"],
      ["magazine-desk-summary"],
    ]);
  });

  it("sends no date when the piece had none", async () => {
    apiMocks.unpublishPiece.mockResolvedValue({});
    apiMocks.publishPiece.mockResolvedValue({});
    const piece: Piece = { ...publishedDemoPiece(), publishedAt: null };
    const { result } = renderUnpublish();
    await act(async () => {
      await result.current.mutateAsync({ piece, stage: "drafting" });
    });

    pressUndo();

    await waitFor(() =>
      expect(apiMocks.publishPiece).toHaveBeenCalledWith(piece.id, {}),
    );
  });

  it("names the open care items in the error toast when the gate refuses", async () => {
    apiMocks.unpublishPiece.mockResolvedValue({});
    apiMocks.publishPiece.mockRejectedValue(
      new ApiError(400, "Care gate open", {
        code: "magazine_care_gate_open",
        message: "Care gate open",
        openGateItems: ["Consent for the portrait", "Sensitivity read"],
      }),
    );
    const piece = publishedDemoPiece();
    const { result } = renderUnpublish();
    await act(async () => {
      await result.current.mutateAsync({ piece, stage: "drafting" });
    });
    pressUndo();

    await waitFor(() => expect(showToast).toHaveBeenCalledTimes(2));
    expect(showToast).toHaveBeenLastCalledWith(
      {
        title: `magazine:desk.pieceToast.republishFailed ${JSON.stringify({ title: piece.title })}`,
        detail: `magazine:deck.editor.piecePublish.careGateToast ${JSON.stringify({ items: "Consent for the portrait; Sensitivity read" })}`,
      },
      "error",
    );
  });

  it("names the server's own message for any other refusal", async () => {
    apiMocks.unpublishPiece.mockResolvedValue({});
    apiMocks.publishPiece.mockRejectedValue(
      new ApiError(409, "Another editor already republished this piece.", {}),
    );
    const piece = publishedDemoPiece();
    const { result } = renderUnpublish();
    await act(async () => {
      await result.current.mutateAsync({ piece, stage: "drafting" });
    });

    pressUndo();

    await waitFor(() => expect(showToast).toHaveBeenCalledTimes(2));
    expect(showToast.mock.calls[1]?.[0]).toMatchObject({
      detail: "Another editor already republished this piece.",
    });
  });
});
