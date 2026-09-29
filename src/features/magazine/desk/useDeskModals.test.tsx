import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_PIECES, type Piece, type Pitch } from "../data/desk.data";
import { usePieceMutations } from "../api/usePieceMutations";
import { usePitchMutations } from "../api/usePitchMutations";
import { useDeskModals } from "./useDeskModals";
import type { CommissionPayload } from "./CommissionModal";
import type { TriagePitchDto } from "../api/pieces.api";
import { HandoffModal } from "./HandoffModal";

function demoPiece(index: number): Piece {
  const piece = DEMO_PIECES[index];
  if (!piece) throw new Error(`No demo piece at ${index}`);
  return piece;
}

const QUEUE = [demoPiece(0), demoPiece(1), demoPiece(2)];

function Wrapper({ children }: { children: ReactNode }) {
  return <TestProviders>{children}</TestProviders>;
}

function renderModals() {
  return renderHook(
    () =>
      useDeskModals({
        activeMe: "marta",
        currentIssueId: "",
        pieceMutations: usePieceMutations(),
        pitchMutations: usePitchMutations(),
      }),
    { wrapper: Wrapper },
  );
}

function chasedPieceId(modal: ReturnType<typeof useDeskModals>["modal"]) {
  return modal?.kind === "chase" ? modal.piece.id : null;
}

describe("useDeskModals chase queue", () => {
  it("Skip moves on to the next writer with its progress", () => {
    const { result } = renderModals();

    act(() => result.current.openChaseQueue(QUEUE));
    expect(chasedPieceId(result.current.modal)).toBe(QUEUE[0]?.id);

    act(() => result.current.skipChase());
    const modal = result.current.modal;
    expect(chasedPieceId(modal)).toBe(QUEUE[1]?.id);
    expect(modal?.kind === "chase" && modal.progress).toEqual({
      current: 2,
      total: 3,
    });
  });

  it("closing a queued chase ends the whole queue", () => {
    const { result } = renderModals();

    act(() => result.current.openChaseQueue(QUEUE));
    act(() => result.current.close());
    expect(result.current.modal).toBeNull();

    // Nothing is left to skip to once the queue has been closed.
    act(() => result.current.skipChase());
    expect(result.current.modal).toBeNull();
  });

  it("opening another overlay drops a running queue", () => {
    const { result } = renderModals();

    act(() => result.current.openChaseQueue(QUEUE));
    act(() => result.current.openShortcuts());
    expect(result.current.modal?.kind).toBe("shortcuts");

    act(() => result.current.close());
    expect(result.current.modal).toBeNull();
  });

  it("skipping past the last writer empties the slot", () => {
    const { result } = renderModals();

    act(() => result.current.openChaseQueue(QUEUE.slice(0, 2)));
    act(() => result.current.skipChase());
    act(() => result.current.skipChase());
    expect(result.current.modal).toBeNull();
  });
});

/** The hook over fake mutations, so a test can read each request body. */
function renderWithFakeMutations() {
  const commission = vi.fn();
  const assign = vi.fn();
  const triage = vi
    .fn<(variables: { id: string; body: TriagePitchDto }) => Promise<unknown>>()
    .mockResolvedValue({});
  const pieceMutations = {
    commission: { mutate: commission },
    assign: { mutate: assign },
    remove: { mutateAsync: vi.fn(), isPending: false },
  } as unknown as ReturnType<typeof usePieceMutations>;
  const pitchMutations = {
    triage: { mutateAsync: triage },
  } as unknown as ReturnType<typeof usePitchMutations>;
  const { result } = renderHook(
    () =>
      useDeskModals({
        activeMe: "marta",
        currentIssueId: "",
        pieceMutations,
        pitchMutations,
      }),
    { wrapper: Wrapper },
  );
  return { result, commission, assign, triage };
}

function pitchFrom(submitterId: string | null): Pitch {
  return {
    id: "pitch-1",
    title: "Night buses home",
    byline: "Rui Alves",
    note: "Who gets home safe after the last metro",
    tags: [],
    submitterId,
  };
}

const PAYLOAD: CommissionPayload = {
  angle: "The drivers who wait an extra minute",
  section: "Features",
  words: 1800,
  dueDate: "2026-11-02",
  fee: "150",
  track: "unassigned",
  writerId: "writer-tomas-mendes",
  writerName: "Tomás Mendes",
};

describe("useDeskModals commission", () => {
  it("an outside pitch carries the angle, fee and picked writer", () => {
    const { result, triage } = renderWithFakeMutations();

    act(() => result.current.openCommissionFromPitch(pitchFrom(null)));
    act(() => result.current.submitCommission(PAYLOAD));

    const request = triage.mock.calls[0]?.[0];
    expect(request?.id).toBe("pitch-1");
    expect(request?.body).toMatchObject({
      verdict: "commission",
      angle: PAYLOAD.angle,
      fee: PAYLOAD.fee,
      writerId: "writer-tomas-mendes",
    });
  });

  it("a member's pitch carries the angle and fee and leaves the writer to its submitter", () => {
    const { result, triage } = renderWithFakeMutations();

    act(() => result.current.openCommissionFromPitch(pitchFrom("member-1")));
    act(() => result.current.submitCommission(PAYLOAD));

    const body = triage.mock.calls[0]?.[0].body;
    expect(body).toMatchObject({ angle: PAYLOAD.angle, fee: PAYLOAD.fee });
    expect(body).not.toHaveProperty("writerId");
  });

  it("a brief from scratch carries the angle, fee, writer and their byline", () => {
    const { result, commission } = renderWithFakeMutations();

    act(() => result.current.openCommission());
    act(() => result.current.submitCommission(PAYLOAD));

    expect(commission).toHaveBeenCalledWith(
      expect.objectContaining({
        angle: PAYLOAD.angle,
        fee: PAYLOAD.fee,
        writerId: "writer-tomas-mendes",
        byline: "Tomás Mendes",
      }),
    );
  });
});

describe("useDeskModals handoff", () => {
  const piece: Piece = { ...demoPiece(0), writerId: "writer-anika-kovac" };

  it("carries the current editor, writer and byline into the dialog", () => {
    const { result } = renderWithFakeMutations();

    act(() => result.current.openHandoff(piece));

    const modal = result.current.modal;
    expect(modal?.kind === "handoff" && modal.piece).toEqual({
      title: piece.title,
      byline: piece.byline,
      editorId: piece.editorId,
      writerId: "writer-anika-kovac",
    });
  });

  it("sends the new editor and the new writer", () => {
    const { result, assign } = renderWithFakeMutations();

    act(() => result.current.openHandoff(piece));
    act(() => result.current.confirmHandoff("sara", "writer-tomas-mendes"));

    expect(assign).toHaveBeenCalledWith({
      id: piece.id,
      editorId: "sara",
      writerId: "writer-tomas-mendes",
    });
  });

  it("changing only the writer keeps the editor out of the request", () => {
    const { result, assign } = renderWithFakeMutations();

    act(() => result.current.openHandoff(piece));
    act(() =>
      result.current.confirmHandoff(piece.editorId, "writer-tomas-mendes"),
    );

    expect(assign).toHaveBeenCalledWith({
      id: piece.id,
      writerId: "writer-tomas-mendes",
    });
  });

  it("sends null to take the writer off", () => {
    const { result, assign } = renderWithFakeMutations();

    act(() => result.current.openHandoff(piece));
    act(() => result.current.confirmHandoff(piece.editorId, null));

    expect(assign).toHaveBeenCalledWith({ id: piece.id, writerId: null });
  });

  it("changing only the editor keeps the writer out of the request", () => {
    const { result, assign } = renderWithFakeMutations();

    act(() => result.current.openHandoff(piece));
    act(() => result.current.confirmHandoff("sara", "writer-anika-kovac"));

    expect(assign).toHaveBeenCalledWith({ id: piece.id, editorId: "sara" });
  });

  it("sends no request when nothing changed", () => {
    const { result, assign } = renderWithFakeMutations();

    act(() => result.current.openHandoff(piece));
    act(() =>
      result.current.confirmHandoff(piece.editorId, "writer-anika-kovac"),
    );

    expect(assign).not.toHaveBeenCalled();
  });
});

// Exercises the dialog itself: the button's aria-disabled state and its
// click guard. `confirmHandoff` above already covers what a change sends.
describe("HandoffModal confirm button", () => {
  const EDITORS = [
    { id: "marta", name: "Marta" },
    { id: "sara", name: "Sara" },
  ];
  const WRITERS = [
    { id: "writer-anika-kovac", name: "Anika Kovac" },
    { id: "writer-tomas-mendes", name: "Tomás Mendes" },
  ];

  // `currentWriterId` is typed `string | null | undefined` here (looser than
  // `HandoffModal`'s own `string | null`) so the M6 test below can hand the
  // dialog a runtime `undefined` the type would otherwise rule out.
  function renderHandoffModal(currentWriterId: string | null | undefined) {
    const onHandoff = vi.fn();
    const onClose = vi.fn();
    render(
      <TestProviders>
        <HandoffModal
          piece={{ title: "Night buses home", byline: "Rui Alves" }}
          editors={EDITORS}
          writers={WRITERS}
          isWriterListUnavailable={false}
          currentEditorId="marta"
          currentWriterId={currentWriterId as string | null}
          onClose={onClose}
          onHandoff={onHandoff}
        />
      </TestProviders>,
    );
    return { onHandoff, onClose };
  }

  it("stays disabled with nothing changed", () => {
    renderHandoffModal("writer-anika-kovac");

    expect(screen.getByRole("button", { name: "Hand off" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("treats a missing writer the same as a null one (M6, demo pieces)", () => {
    // Demo pieces carry no `writerId` at all.
    renderHandoffModal(undefined);

    expect(screen.getByRole("button", { name: "Hand off" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("enables once the writer changes, and a click sends the new writer", async () => {
    const user = userEvent.setup();
    const { onHandoff, onClose } = renderHandoffModal("writer-anika-kovac");

    await user.click(screen.getByRole("button", { name: "Writer" }));
    await user.click(screen.getByRole("option", { name: "Tomás Mendes" }));
    const button = screen.getByRole("button", { name: "Hand off" });
    expect(button).toHaveAttribute("aria-disabled", "false");

    await user.click(button);

    expect(onHandoff).toHaveBeenCalledWith("marta", "writer-tomas-mendes");
    expect(onClose).toHaveBeenCalled();
  });

  it("a click with nothing changed sends no hand-off and leaves the dialog open", async () => {
    const user = userEvent.setup();
    const { onHandoff, onClose } = renderHandoffModal(null);

    await user.click(screen.getByRole("button", { name: "Hand off" }));

    expect(onHandoff).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("leads with Writer over To when the piece has no writer yet (S7)", () => {
    renderHandoffModal(null);

    const writerTrigger = screen.getByRole("button", { name: "Writer" });
    const editorTrigger = screen.getByRole("button", { name: "To" });
    expect(
      writerTrigger.compareDocumentPosition(editorTrigger) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps To over Writer when the piece already has a writer", () => {
    renderHandoffModal("writer-anika-kovac");

    const editorTrigger = screen.getByRole("button", { name: "To" });
    const writerTrigger = screen.getByRole("button", { name: "Writer" });
    expect(
      editorTrigger.compareDocumentPosition(writerTrigger) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
