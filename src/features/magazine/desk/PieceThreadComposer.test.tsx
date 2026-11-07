import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
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

async function renderComposer() {
  render(
    <TestProviders>
      <PieceThreadComposer pieceId="p1" side="editor" />
    </TestProviders>,
  );
  await awaitCatalog("magazine");
  return screen.getByRole<HTMLTextAreaElement>("textbox");
}

describe("PieceThreadComposer", () => {
  beforeEach(() => {
    sendMock.mutate.mockReset();
    sendMock.isPending = false;
    sendMock.isError = false;
  });

  it("sends the trimmed draft on Enter and clears it once the send succeeds", async () => {
    const textarea = await renderComposer();
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

  it("starts a new line on Shift+Enter", async () => {
    const textarea = await renderComposer();
    fireEvent.change(textarea, { target: { value: "First line" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(sendMock.mutate).not.toHaveBeenCalled();
  });

  it("ignores Enter while an input method is composing", async () => {
    const textarea = await renderComposer();
    fireEvent.change(textarea, { target: { value: "にほん" } });
    fireEvent.keyDown(textarea, { key: "Enter", isComposing: true });
    expect(sendMock.mutate).not.toHaveBeenCalled();
    expect(textarea.value).toBe("にほん");
  });

  it("keeps the text and says so when the send fails", async () => {
    sendMock.isError = true;
    const textarea = await renderComposer();
    fireEvent.change(textarea, { target: { value: "Still here" } });
    expect(
      screen.getByText("Couldn't send. Your message is still here."),
    ).toHaveAttribute("role", "alert");
    expect(textarea.value).toBe("Still here");
  });

  it("does not send an empty draft", async () => {
    const textarea = await renderComposer();
    fireEvent.keyDown(textarea, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(sendMock.mutate).not.toHaveBeenCalled();
  });
});
