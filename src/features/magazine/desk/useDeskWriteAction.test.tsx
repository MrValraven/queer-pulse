import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DEMO_EDITORS, DEMO_ISSUE } from "../data/desk.data";
import type { usePieceMutations } from "../api/usePieceMutations";
import { useDeskWriteAction } from "./useDeskWriteAction";

interface StartDraftOptions {
  onSuccess?: (created: { id: string }) => void;
  onSettled?: () => void;
}

function RouterWrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

/** The hook with `startDraft.mutate` mocked, so a test can see each call and
 *  settle it by hand. */
function renderWriteAction() {
  const startDraft =
    vi.fn<(variables: unknown, options: StartDraftOptions) => void>();
  const pieceMutations = {
    startDraft: { mutate: startDraft, isPending: false },
  } as unknown as ReturnType<typeof usePieceMutations>;
  const { result } = renderHook(
    () =>
      useDeskWriteAction({
        activeMe: "marta",
        editors: DEMO_EDITORS,
        sections: [{ name: "Essays" }],
        areSectionsLoading: false,
        hasSectionsError: false,
        issue: DEMO_ISSUE,
        track: "issue",
        pieceMutations,
        showToast: () => undefined,
        translate: (key) => key,
      }),
    { wrapper: RouterWrapper },
  );
  return { result, startDraft };
}

function settleLastCall(
  startDraft: ReturnType<typeof renderWriteAction>["startDraft"],
) {
  const lastCall = startDraft.mock.calls.at(-1);
  act(() => lastCall?.[1].onSettled?.());
}

describe("useDeskWriteAction in-flight guard", () => {
  it("two presses in the same tick start one draft", () => {
    const { result, startDraft } = renderWriteAction();

    act(() => {
      result.current.startWriting();
      result.current.startWriting();
    });

    expect(startDraft).toHaveBeenCalledTimes(1);
  });

  it("a press after the request settles starts another draft", () => {
    const { result, startDraft } = renderWriteAction();

    act(() => result.current.startWriting());
    settleLastCall(startDraft);
    act(() => result.current.startWriting());

    expect(startDraft).toHaveBeenCalledTimes(2);
  });

  it("files the draft onto the working issue on the Issue track", () => {
    const { result, startDraft } = renderWriteAction();

    act(() => result.current.startWriting());

    expect(startDraft).toHaveBeenCalledWith(
      expect.objectContaining({ issueId: DEMO_ISSUE.id, writerId: "marta" }),
      expect.anything(),
    );
  });
});
