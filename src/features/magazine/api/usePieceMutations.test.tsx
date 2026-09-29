import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DEMO_PIECES, type Piece } from "../data/desk.data";
import { CURRENT_ISSUE_QUERY_KEY } from "./useCurrentIssue";
import { DESK_ISSUES_QUERY_KEY } from "./useDeskIssues";
import { usePieceMutations } from "./usePieceMutations";

/**
 * `usePieceMutations` in both modes. The mode, the toast and the catalog are
 * stubbed so the hook runs under a bare query client whose invalidations the
 * tests can read; the API calls are stubbed so live mode never needs a
 * server.
 */

const modeState = vi.hoisted(() => ({ isDemoMode: true }));
const apiMocks = vi.hoisted(() => ({
  updatePiece: vi.fn(),
  assignPiecesToIssue: vi.fn(),
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: modeState.isDemoMode }),
}));

vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}));

vi.mock("./pieces.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./pieces.api")>()),
  updatePiece: apiMocks.updatePiece,
  assignPiecesToIssue: apiMocks.assignPiecesToIssue,
}));

const ORIGINAL_DEMO_PIECES: Piece[] = [...DEMO_PIECES];

function renderMutations() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => usePieceMutations(), { wrapper });
  const invalidatedKeys = () =>
    invalidateSpy.mock.calls.map(([filters]) => filters?.queryKey?.[0]);
  return { result, invalidatedKeys };
}

function demoPiece(pieceId: string): Piece {
  const piece = DEMO_PIECES.find((candidate) => candidate.id === pieceId);
  if (!piece) throw new Error(`no demo piece ${pieceId}`);
  return piece;
}

beforeEach(() => {
  modeState.isDemoMode = true;
  apiMocks.updatePiece.mockReset();
  apiMocks.assignPiecesToIssue.mockReset();
});

afterEach(() => {
  DEMO_PIECES.splice(0, DEMO_PIECES.length, ...ORIGINAL_DEMO_PIECES);
});

describe("usePieceMutations updatePiece (demo mode)", () => {
  it("sets a due day on the demo piece, as a fresh object", async () => {
    const { result } = renderMutations();
    const pieceBefore = demoPiece("p2");

    await act(async () => {
      await result.current.updatePiece.mutateAsync({
        id: "p2",
        body: { dueOn: "2999-12-31" },
      });
    });

    const pieceAfter = demoPiece("p2");
    expect(pieceAfter).not.toBe(pieceBefore);
    expect(pieceAfter).toMatchObject({
      due: "2999-12-31",
      dueDate: "2999-12-31",
      late: false,
    });
    expect(apiMocks.updatePiece).not.toHaveBeenCalled();
  });

  it("marks a due day already past as late", async () => {
    const { result } = renderMutations();

    await act(async () => {
      await result.current.updatePiece.mutateAsync({
        id: "p2",
        body: { dueOn: "2000-01-01" },
      });
    });

    expect(demoPiece("p2").late).toBe(true);
  });

  it("leaves a Ready piece on time whatever its due day", async () => {
    const { result } = renderMutations();

    await act(async () => {
      await result.current.updatePiece.mutateAsync({
        id: "p5",
        body: { dueOn: "2000-01-01" },
      });
    });

    expect(demoPiece("p5")).toMatchObject({
      stage: "Ready",
      dueDate: "2000-01-01",
      late: false,
    });
  });

  it("still moves a piece between issues and refreshes the issue figures", async () => {
    const { result, invalidatedKeys } = renderMutations();

    await act(async () => {
      await result.current.updatePiece.mutateAsync({
        id: "p1",
        body: { issueId: null },
      });
    });

    expect(demoPiece("p1").issueId).toBeNull();
    expect(invalidatedKeys()).toEqual(
      expect.arrayContaining([DESK_ISSUES_QUERY_KEY, CURRENT_ISSUE_QUERY_KEY]),
    );
  });
});

describe("usePieceMutations (live mode)", () => {
  beforeEach(() => {
    modeState.isDemoMode = false;
  });

  it("sends the due day in the piece PATCH and leaves the issue figures alone", async () => {
    apiMocks.updatePiece.mockResolvedValue({ id: "piece-9" });
    const { result, invalidatedKeys } = renderMutations();

    await act(async () => {
      await result.current.updatePiece.mutateAsync({
        id: "piece-9",
        body: { dueOn: "2026-10-12" },
      });
    });

    expect(apiMocks.updatePiece).toHaveBeenCalledWith("piece-9", {
      dueOn: "2026-10-12",
    });
    expect(invalidatedKeys()).toContain("magazine-pieces");
    expect(invalidatedKeys()).not.toContain(DESK_ISSUES_QUERY_KEY);
    expect(invalidatedKeys()).not.toContain(CURRENT_ISSUE_QUERY_KEY);
  });

  it("refreshes the issue figures when a piece changes issue", async () => {
    apiMocks.updatePiece.mockResolvedValue({ id: "piece-9" });
    const { result, invalidatedKeys } = renderMutations();

    await act(async () => {
      await result.current.updatePiece.mutateAsync({
        id: "piece-9",
        body: { issueId: "issue-2" },
      });
    });

    expect(invalidatedKeys()).toEqual(
      expect.arrayContaining([DESK_ISSUES_QUERY_KEY, CURRENT_ISSUE_QUERY_KEY]),
    );
  });

  it("refreshes the issue figures after a bulk issue assignment", async () => {
    apiMocks.assignPiecesToIssue.mockResolvedValue({
      assigned: 2,
      issueNumber: "14",
    });
    const { result, invalidatedKeys } = renderMutations();

    await act(async () => {
      await result.current.assignIssue.mutateAsync({
        pieceIds: ["piece-1", "piece-2"],
        issueId: "issue-2",
      });
    });

    expect(invalidatedKeys()).toEqual(
      expect.arrayContaining([
        "magazine-pieces",
        DESK_ISSUES_QUERY_KEY,
        CURRENT_ISSUE_QUERY_KEY,
      ]),
    );
  });
});
