import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { GoTogetherDataSection } from "./GoTogetherDataSection";
import type {
  FriendMatchAnswers,
  FriendMatchProfileDTO,
} from "../api/goTogether.types";

/**
 * Settings > Data > Go together answers.
 *
 * `useFriendMatchProfile`/`useDeleteFriendMatchProfile` are mocked (the
 * pattern `GatheringBookmarkButton.test.tsx` uses), so the tests drive the
 * component's own states directly.
 * `goTogether` is a lazy i18n namespace, so the first lookup of any of its
 * strings uses `findBy*`.
 */

type DeleteAnswersMutate = (
  variables: void,
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  },
) => void;

const {
  profileQueryState,
  profileRefetch,
  deleteAnswersMutate,
  deleteMutationState,
} = vi.hoisted(() => ({
  profileQueryState: {
    data: undefined as FriendMatchProfileDTO | undefined,
    isLoading: false,
    isError: false,
  },
  profileRefetch: vi.fn(),
  deleteAnswersMutate: vi.fn<DeleteAnswersMutate>(),
  deleteMutationState: { isPending: false },
}));

vi.mock("../api/useFriendMatchProfile", () => ({
  useFriendMatchProfile: () => ({
    ...profileQueryState,
    refetch: profileRefetch,
  }),
  useDeleteFriendMatchProfile: () => ({
    mutate: deleteAnswersMutate,
    isPending: deleteMutationState.isPending,
  }),
}));

// The component only ever checks `Boolean(profile.answers)`; the exact shape
// of a saved answer set belongs to F1's tests, so an empty stub is enough to
// stand in for "answered" here.
const STUB_ANSWERS = {} as FriendMatchAnswers;

const NO_ANSWERS_PROFILE: FriendMatchProfileDTO = {
  answers: null,
  questionnaireVersion: null,
  currentVersion: 1,
  needsRefresh: false,
  refreshSuggested: false,
  consentedAt: null,
  updatedAt: null,
};

const ANSWERED_PROFILE: FriendMatchProfileDTO = {
  answers: STUB_ANSWERS,
  questionnaireVersion: 1,
  currentVersion: 1,
  needsRefresh: false,
  refreshSuggested: false,
  consentedAt: "2026-01-05T10:00:00.000Z",
  updatedAt: "2026-02-15T10:00:00.000Z",
};

function renderSection() {
  render(
    <TestProviders>
      <GoTogetherDataSection />
    </TestProviders>,
  );
}

afterEach(() => {
  deleteAnswersMutate.mockReset();
  profileRefetch.mockReset();
  deleteMutationState.isPending = false;
  profileQueryState.data = undefined;
  profileQueryState.isLoading = false;
  profileQueryState.isError = false;
});

describe("GoTogetherDataSection", () => {
  it("with no saved answers, points the member at the questionnaire", async () => {
    profileQueryState.data = NO_ANSWERS_PROFILE;
    renderSection();

    expect(
      await screen.findByText(
        "You haven't answered the Go together questions yet",
      ),
    ).toBeInTheDocument();
    const questionnaireLink = screen.getByRole("link", {
      name: "Answer the questions",
    });
    expect(questionnaireLink).toHaveAttribute(
      "href",
      expect.stringContaining("/go-together/questionnaire?return="),
    );
  });

  it("with a saved profile, shows the last-answered date, an edit link and a delete action", async () => {
    profileQueryState.data = ANSWERED_PROFILE;
    renderSection();

    expect(
      await screen.findByText("Last answered on February 15, 2026."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Edit your answers" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete my answers" }),
    ).toBeInTheDocument();
    // The delete card's own title reads as destructive; it no longer repeats
    // the button label (design review S12b).
    expect(screen.getByText("Your answers, gone for good")).toBeInTheDocument();
  });

  it("shows only a placeholder while the profile is loading", () => {
    profileQueryState.isLoading = true;
    renderSection();

    expect(
      screen.queryByText("You haven't answered the Go together questions yet"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Edit your answers" }),
    ).not.toBeInTheDocument();
  });

  it("stays visible with a retry when the profile fails to load", async () => {
    profileQueryState.isError = true;
    renderSection();

    const retryButton = await screen.findByRole("button", {
      name: "Try again",
    });
    fireEvent.click(retryButton);

    expect(profileRefetch).toHaveBeenCalledTimes(1);
  });

  it("asks for confirmation before deleting, naming which gatherings it withdraws them from", async () => {
    profileQueryState.data = ANSWERED_PROFILE;
    renderSection();

    const deleteButton = await screen.findByRole("button", {
      name: "Delete my answers",
    });
    fireEvent.click(deleteButton);

    expect(
      await screen.findByText("Delete your Go together answers?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Deleting removes your answers for good and takes you out of Go together for any gathering whose group hasn't formed yet. You can answer the questions again whenever you're ready.",
      ),
    ).toBeInTheDocument();

    // Both the row's own delete button and the dialog's confirm button share
    // the "Delete my answers" name once the dialog is open, so the confirm
    // action is looked up scoped to the dialog.
    const dialog = screen.getByRole("dialog");
    const confirmButton = within(dialog).getByRole("button", {
      name: "Delete my answers",
    });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(deleteAnswersMutate).toHaveBeenCalledTimes(1));
  });

  it("shows a gentle nudge to refresh when refreshSuggested is true", async () => {
    profileQueryState.data = { ...ANSWERED_PROFILE, refreshSuggested: true };
    renderSection();

    expect(
      await screen.findByText(
        "It's been a while. Want to refresh your answers?",
      ),
    ).toBeInTheDocument();
  });
});
