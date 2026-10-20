import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type { ModReport } from "./adminModeration.data";
import { AdminQuizshowGameActions } from "./AdminQuizshowGameActions";

interface StaffActionInput {
  sessionId: string;
  reason: string;
  reportId?: string;
}

const { endGame, deleteGame } = vi.hoisted(() => ({
  endGame: vi.fn<(input: StaffActionInput) => Promise<void>>(() =>
    Promise.resolve(),
  ),
  deleteGame: vi.fn<(input: StaffActionInput) => Promise<void>>(() =>
    Promise.resolve(),
  ),
}));

vi.mock("./api/adminQuizshow.api", () => ({
  endReportedQuizshowGame: (input: StaffActionInput) => endGame(input),
  deleteReportedQuizshowGame: (input: StaffActionInput) => deleteGame(input),
}));
vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: false }),
}));

const report = {
  id: "r-game",
  subjectType: "quizshow_game",
  subjectId: "session-1",
  title: "Friday quiz",
} as unknown as ModReport;

const renderPanel = () =>
  render(
    <TestProviders>
      <AdminQuizshowGameActions report={report} />
    </TestProviders>,
  );

const STAFF_REASON = "Hate speech in round two";

const confirmInDialog = async (label: string, reason = STAFF_REASON) => {
  fireEvent.click(screen.getByRole("button", { name: label }));
  await screen.findByRole("dialog");
  fireEvent.change(screen.getByLabelText(/Reason/), {
    target: { value: reason },
  });
  fireEvent.click(screen.getAllByRole("button", { name: label }).at(-1)!);
};

const expectedInput = {
  sessionId: "session-1",
  reason: STAFF_REASON,
  reportId: "r-game",
};

describe("AdminQuizshowGameActions", () => {
  beforeEach(() => {
    endGame.mockReset();
    endGame.mockResolvedValue();
    deleteGame.mockReset();
    deleteGame.mockResolvedValue();
  });

  it("ends the reported game after a confirm", async () => {
    renderPanel();
    await confirmInDialog("End this game");
    await waitFor(() => expect(endGame).toHaveBeenCalledWith(expectedInput));
    expect(await screen.findByText("Game ended")).toBeInTheDocument();
    expect(deleteGame).not.toHaveBeenCalled();
  });

  it("deletes the reported game after a confirm", async () => {
    renderPanel();
    await confirmInDialog("Delete this game");
    await waitFor(() => expect(deleteGame).toHaveBeenCalledWith(expectedInput));
    expect(await screen.findByText("Game deleted")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Delete this game" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("asks for a reason before ending the game", async () => {
    renderPanel();
    await confirmInDialog("End this game", "   ");
    expect(await screen.findByText("Add a reason first")).toBeInTheDocument();
    expect(endGame).not.toHaveBeenCalled();
    expect(
      screen.getByText("Saved in the moderation log with this report"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Reason/), {
      target: { value: `  ${STAFF_REASON}  ` },
    });
    expect(screen.queryByText("Add a reason first")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getAllByRole("button", { name: "End this game" }).at(-1)!,
    );
    await waitFor(() => expect(endGame).toHaveBeenCalledWith(expectedInput));
  });

  it("reads a 404 as a game already gone and offers no action", async () => {
    endGame.mockRejectedValueOnce(new ApiError(404, "quizshow_game_not_found"));
    renderPanel();
    await confirmInDialog("End this game");
    expect(
      await screen.findByText("This game is already gone"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "End this game" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("shows the error line on any other failure", async () => {
    deleteGame.mockRejectedValueOnce(new ApiError(500, "Server error"));
    renderPanel();
    await confirmInDialog("Delete this game");
    expect(
      await screen.findByText("That didn't work. Try again"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete this game" }),
    ).toBeInTheDocument();
  });
});
