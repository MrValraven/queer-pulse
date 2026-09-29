import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import { usePieceOpenDraft } from "./usePieceOpenDraft";

/**
 * "Open the draft" on the piece record, in its three branches: an article
 * piece, a deck piece with its deck, and a deck piece with no deck yet (demo
 * opens the blank editor; live creates the deck through a piece PATCH first).
 * Navigation, the mode, the toast and the API are stubbed so each branch's
 * destination and calls are visible.
 */

const mocks = vi.hoisted(() => ({
  isDemoMode: false,
  navigate: vi.fn(),
  showToast: vi.fn(),
  updatePiece: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mocks.navigate,
}));
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: mocks.isDemoMode }),
}));
vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));
vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}));
vi.mock("../api/pieces.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/pieces.api")>()),
  updatePiece: mocks.updatePiece,
}));

function renderOpenDraft() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => usePieceOpenDraft("piece-1"), {
    wrapper,
  });
  const invalidatedKeys = () =>
    invalidateSpy.mock.calls.map(([filters]) => filters?.queryKey);
  return { result, invalidatedKeys };
}

beforeEach(() => {
  mocks.isDemoMode = false;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("usePieceOpenDraft", () => {
  it("opens an article piece in the article editor", () => {
    const { result } = renderOpenDraft();

    act(() => result.current.openDraft({ format: "article", deckId: null }));

    expect(mocks.navigate).toHaveBeenCalledWith(
      routes.magazineWrite.replace(":id", "piece-1"),
    );
    expect(mocks.updatePiece).not.toHaveBeenCalled();
  });

  it("opens a deck piece on its own deck", () => {
    const { result } = renderOpenDraft();

    act(() => result.current.openDraft({ format: "deck", deckId: "deck-7" }));

    expect(mocks.navigate).toHaveBeenCalledWith(
      `${routes.deckEditor}?id=deck-7`,
    );
    expect(mocks.updatePiece).not.toHaveBeenCalled();
  });

  it("opens the blank deck editor in demo for a deck piece with no deck", () => {
    mocks.isDemoMode = true;
    const { result } = renderOpenDraft();

    act(() => result.current.openDraft({ format: "deck", deckId: null }));

    expect(mocks.navigate).toHaveBeenCalledWith(routes.deckEditor);
    expect(mocks.updatePiece).not.toHaveBeenCalled();
  });

  it("creates the missing deck in live, then opens it", async () => {
    mocks.updatePiece.mockResolvedValue({ format: "deck", deckId: "deck-new" });
    const { result, invalidatedKeys } = renderOpenDraft();

    act(() => result.current.openDraft({ format: "deck", deckId: null }));

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith(
        `${routes.deckEditor}?id=deck-new`,
      ),
    );
    expect(mocks.updatePiece).toHaveBeenCalledWith("piece-1", {
      format: "deck",
    });
    expect(invalidatedKeys()).toEqual(
      expect.arrayContaining([
        ["magazine-pieces"],
        ["magazine-piece", "piece-1"],
      ]),
    );
    expect(mocks.showToast).not.toHaveBeenCalled();
  });

  it("toasts and stays on the record when the deck cannot be created", async () => {
    mocks.updatePiece.mockRejectedValue(new Error("network down"));
    const { result } = renderOpenDraft();

    act(() => result.current.openDraft({ format: "deck", deckId: null }));

    await waitFor(() =>
      expect(mocks.showToast).toHaveBeenCalledWith(
        "magazine:piece.header.openDeckError",
        "error",
      ),
    );
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
