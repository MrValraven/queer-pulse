import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioClearListeningDialog } from "./StudioClearListeningDialog";

interface ClearHolder {
  clearHistory: Mock<() => Promise<boolean>>;
  isClearing: boolean;
}

const mocks: { clear: ClearHolder | null } = vi.hoisted(() => ({
  clear: null,
}));
vi.mock("./api/useClearStudioListening", () => ({
  useClearStudioListening: () => mocks.clear,
}));

beforeEach(() => {
  mocks.clear = null;
});

describe("StudioClearListeningDialog", () => {
  it("asks before clearing and clears on confirm", async () => {
    mocks.clear = {
      clearHistory: vi.fn(() => Promise.resolve(true)),
      isClearing: false,
    };
    const onCleared = vi.fn();
    const onClose = vi.fn();
    render(
      <TestProviders>
        <StudioClearListeningDialog
          isOpen
          onClose={onClose}
          onCleared={onCleared}
        />
      </TestProviders>,
    );
    const dialog = screen.getByRole("dialog", {
      name: "Clear listening history",
    });
    expect(
      within(dialog).getByText(/Artists' totals stay as they are$/),
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Clear listening history" }),
    );
    await waitFor(() => expect(onCleared).toHaveBeenCalledTimes(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stays open when the clear fails", async () => {
    mocks.clear = {
      clearHistory: vi.fn(() => Promise.resolve(false)),
      isClearing: false,
    };
    const onClose = vi.fn();
    render(
      <TestProviders>
        <StudioClearListeningDialog isOpen onClose={onClose} />
      </TestProviders>,
    );
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Clear listening history",
      }),
    );
    await waitFor(() => expect(mocks.clear!.clearHistory).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("holds both actions while the clear is in flight", () => {
    mocks.clear = {
      clearHistory: vi.fn(() => Promise.resolve(true)),
      isClearing: true,
    };
    render(
      <TestProviders>
        <StudioClearListeningDialog isOpen onClose={vi.fn()} />
      </TestProviders>,
    );
    const dialog = screen.getByRole("dialog", {
      name: "Clear listening history",
    });
    expect(
      within(dialog).getByRole("button", { name: "Clear listening history" }),
    ).toBeDisabled();
  });
});
