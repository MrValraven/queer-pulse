import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Piece, Stage } from "../data/desk.data";
import { useDeskBulkActions } from "./useDeskBulkActions";

const toastMock = vi.fn();
const translateMock = vi.fn((key: string, values?: Record<string, unknown>) =>
  values ? `${key}(${JSON.stringify(values)})` : key,
);

vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: toastMock }),
}));

vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: translateMock, language: "en" }),
}));

function makePiece(id: string, stage: Stage = "Edit"): Piece {
  return {
    id,
    title: `Piece ${id}`,
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone",
    editorId: "marta",
    stage,
    due: "",
    art: "in",
    issueId: null,
  };
}

function renderBulkActions(mutateAsync: (...args: never[]) => unknown) {
  return renderHook(() =>
    useDeskBulkActions({
      moveStage: { mutateAsync } as never,
      openHandoff: vi.fn(),
    }),
  );
}

describe("useDeskBulkActions changeStageForSelection", () => {
  it("does not toast before every request has settled", async () => {
    let resolveFirst!: (value: { id: string }) => void;
    const firstRequest = new Promise<{ id: string }>((resolve) => {
      resolveFirst = resolve;
    });
    const mutateAsync = vi
      .fn()
      .mockImplementationOnce(() => firstRequest)
      .mockImplementationOnce(() => Promise.resolve({ id: "b" }));

    const { result } = renderBulkActions(mutateAsync);

    act(() => {
      result.current.changeStageForSelection(
        [makePiece("a"), makePiece("b")],
        "Layout",
      );
    });

    // The second request already resolved, but the first has not: nothing
    // has settled yet, so no toast has fired.
    expect(toastMock).not.toHaveBeenCalled();

    resolveFirst({ id: "a" });
    await waitFor(() => expect(toastMock).toHaveBeenCalledTimes(1));

    expect(toastMock).toHaveBeenCalledWith(
      expect.stringContaining('"count":2'),
      "success",
    );
  });

  it("reports how many failed alongside how many succeeded", async () => {
    const mutateAsync = vi
      .fn()
      .mockImplementationOnce(() => Promise.resolve({ id: "a" }))
      .mockImplementationOnce(() => Promise.reject(new Error("409")));

    const { result } = renderBulkActions(mutateAsync);

    act(() => {
      result.current.changeStageForSelection(
        [makePiece("a"), makePiece("b")],
        "Layout",
      );
    });

    await waitFor(() => expect(toastMock).toHaveBeenCalledTimes(2));

    expect(toastMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('"count":1'),
      "success",
    );
    expect(toastMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('"count":1'),
      "error",
    );
  });

  it("skips a piece already published or already at the target stage, and makes no request when nothing would move", () => {
    const mutateAsync = vi.fn();
    const { result } = renderBulkActions(mutateAsync);

    act(() => {
      result.current.changeStageForSelection(
        [makePiece("a", "Published"), makePiece("b", "Layout")],
        "Layout",
      );
    });

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(toastMock).not.toHaveBeenCalled();
  });
});
