import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { PieceThreadComposer } from "./PieceThreadComposer";

interface SendOptions {
  onSuccess?: () => void;
}

// The send mutation is stubbed so a test can hold it in flight, settle it,
// or fail it on demand.
const sendMock = vi.hoisted(() => ({
  mutate: vi.fn<(body: string, options?: SendOptions) => void>(),
  isPending: false,
  isError: false,
}));

vi.mock("../api/usePieceMessages", () => ({
  usePieceMessageMutations: () => ({ send: sendMock }),
}));

function renderComposer() {
  render(
    <TestProviders>
      <PieceThreadComposer pieceId="p1" side="editor" />
    </TestProviders>,
  );
  return screen.getByRole<HTMLTextAreaElement>("textbox");
}

describe("PieceThreadComposer", () => {
  beforeEach(() => {
    sendMock.mutate.mockReset();
    sendMock.isPending = false;
    sendMock.isError = false;
  });

  it("sends the trimmed draft on Enter and clears it once the send succeeds", () => {
    const textarea = renderComposer();
    fireEvent.change(textarea, { target: { value: "  Draft due Friday  " } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(sendMock.mutate).toHaveBeenCalledWith(
      "Draft due Friday",
      expect.any(Object),
    );
    // Still in flight: the text stays put.
    expect(textarea.value).toBe("  Draft due Friday  ");

    const options = sendMock.mutate.mock.calls[0]?.[1];
    act(() => options?.onSuccess?.());
    expect(textarea.value).toBe("");
  });

  it("starts a new line on Shift+Enter", () => {
    const textarea = renderComposer();
    fireEvent.change(textarea, { target: { value: "First line" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(sendMock.mutate).not.toHaveBeenCalled();
  });

  it("ignores Enter while an input method is composing", () => {
    const textarea = renderComposer();
    fireEvent.change(textarea, { target: { value: "にほん" } });
    fireEvent.keyDown(textarea, { key: "Enter", isComposing: true });
    expect(sendMock.mutate).not.toHaveBeenCalled();
    expect(textarea.value).toBe("にほん");
  });

  it("keeps the text and says so when the send fails", () => {
    sendMock.isError = true;
    const textarea = renderComposer();
    fireEvent.change(textarea, { target: { value: "Still here" } });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(textarea.value).toBe("Still here");
  });

  it("does not send an empty draft", () => {
    const textarea = renderComposer();
    fireEvent.keyDown(textarea, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(sendMock.mutate).not.toHaveBeenCalled();
  });
});
