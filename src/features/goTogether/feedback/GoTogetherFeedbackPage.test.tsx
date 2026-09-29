import { fireEvent, render, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ApiError } from "../../../shared/api/client";
import { gatheringPath } from "../../gatherings/data";
import { GoTogetherFeedbackPage } from "./GoTogetherFeedbackPage";
import type {
  FeedbackBody,
  GoTogetherFeedbackDTO,
  GoTogetherFeedbackMemberDTO,
  GoTogetherGroupDTO,
} from "../api/goTogether.types";

/**
 * F7: the day-after meet-again page. `useGoTogetherFeedback`,
 * `useSaveGoTogetherFeedback` and `useGoTogetherGroup` (all from F1) are
 * mocked so every case is driven from a fixed DTO with no network
 * round-trip; the real hooks' demo/live branching is covered by F1's own
 * tests.
 *
 * The scenario this page exists for (Review Focus #5): the meet-again window
 * closes 7 days after a gathering, and reading it as closed must never look
 * like the page failed to load.
 */

type SaveFeedbackMutate = (
  body: FeedbackBody,
  opts?: {
    onSuccess?: (feedback: GoTogetherFeedbackDTO) => void;
    onError?: (error: unknown) => void;
  },
) => void;

const {
  mockUseGoTogetherFeedback,
  mockUseGoTogetherGroup,
  saveFeedbackMutate,
  saveFeedbackState,
} = vi.hoisted(() => ({
  mockUseGoTogetherFeedback: vi.fn(),
  mockUseGoTogetherGroup: vi.fn(),
  saveFeedbackMutate: vi.fn<SaveFeedbackMutate>(),
  saveFeedbackState: { isPending: false },
}));

vi.mock("../api/useGoTogetherFeedback", () => ({
  useGoTogetherFeedback: mockUseGoTogetherFeedback,
  useSaveGoTogetherFeedback: () => ({
    mutate: saveFeedbackMutate,
    isPending: saveFeedbackState.isPending,
  }),
}));

vi.mock("../api/useGoTogetherGroup", () => ({
  useGoTogetherGroup: mockUseGoTogetherGroup,
}));

beforeEach(() => {
  // Read-only lookup used only to name the gathering and link back to it
  // (see GoTogetherFeedbackPage). Unresolved by default, the same as a group
  // still loading or a 404 from a member who has left it, so every existing
  // scenario below keeps exercising the fallback path unless a test opts
  // into a resolved group with `mockGroup(...)`.
  mockUseGoTogetherGroup.mockReturnValue({ data: undefined });
});

afterEach(() => {
  mockUseGoTogetherFeedback.mockReset();
  mockUseGoTogetherGroup.mockReset();
  saveFeedbackMutate.mockReset();
  saveFeedbackState.isPending = false;
});

const mariana: GoTogetherFeedbackMemberDTO = {
  slug: "mariana",
  firstName: "Mariana",
  pronouns: "she/her",
  avatarUrl: null,
  verdict: null,
};

const rui: GoTogetherFeedbackMemberDTO = {
  slug: "rui",
  firstName: "Rui",
  pronouns: "he/him",
  avatarUrl: null,
  verdict: null,
};

const openFeedback: GoTogetherFeedbackDTO = {
  groupId: "demo-group-1",
  isOpen: true,
  closesAt: "2026-10-05T00:00:00.000Z",
  members: [mariana, rui],
  clicked: null,
  goAgain: false,
};

const groupFixture: GoTogetherGroupDTO = {
  id: "demo-group-1",
  event: {
    id: "evt-pride-picnic",
    slug: "pride-picnic",
    title: "Pride Picnic",
    startAt: "2026-09-20T18:00:00.000Z",
    endAt: "2026-09-20T21:00:00.000Z",
  },
  band: "good",
  reasons: [],
  meetingPointNote: null,
  conversationId: null,
  isDissolved: false,
  members: [],
  mergeOffer: null,
  checkIn: { isOpen: false, isHere: false, hasLeftEvent: false },
  feedback: { isOpen: true, closesAt: null, hasAnswered: false },
};

function mockFeedback(overrides: {
  data?: GoTogetherFeedbackDTO;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
}) {
  mockUseGoTogetherFeedback.mockReturnValue({
    data: overrides.data,
    isLoading: overrides.isLoading ?? false,
    isError: overrides.isError ?? false,
    error: overrides.error ?? null,
    refetch: vi.fn(),
  });
}

function mockGroup(data: GoTogetherGroupDTO | undefined) {
  mockUseGoTogetherGroup.mockReturnValue({ data });
}

function renderPage() {
  return render(
    <TestProviders initialEntries={["/go-together/feedback/demo-group-1"]}>
      <Routes>
        <Route
          path="/go-together/feedback/:groupId"
          element={<GoTogetherFeedbackPage />}
        />
      </Routes>
    </TestProviders>,
  );
}

describe("GoTogetherFeedbackPage", () => {
  it("offers Yes, Maybe and Not for me as a radio group for every other member", () => {
    mockFeedback({ data: openFeedback });
    renderPage();

    const radiogroups = screen.getAllByRole("radiogroup", {
      name: /mariana|rui/i,
    });
    expect(radiogroups).toHaveLength(2);
    for (const radiogroup of radiogroups) {
      expect(
        within(radiogroup).getByRole("radio", { name: "Yes" }),
      ).toBeInTheDocument();
      expect(
        within(radiogroup).getByRole("radio", { name: "Maybe" }),
      ).toBeInTheDocument();
      expect(
        within(radiogroup).getByRole("radio", { name: "Not for me" }),
      ).toBeInTheDocument();
    }
  });

  it("shows the liking-gap line", () => {
    mockFeedback({ data: openFeedback });
    renderPage();

    expect(
      screen.getByText(
        "People usually underestimate how much others enjoyed their company.",
      ),
    ).toBeInTheDocument();
  });

  it("reveals the private note only once Not for me is picked for that member", () => {
    mockFeedback({ data: openFeedback });
    renderPage();

    expect(
      screen.queryByText(
        "Only you see this. You won't be grouped together again.",
      ),
    ).not.toBeInTheDocument();

    const marianaGroup = screen.getByRole("radiogroup", { name: /mariana/i });
    fireEvent.click(
      within(marianaGroup).getByRole("radio", { name: "Not for me" }),
    );

    expect(
      screen.getByText(
        "Only you see this. You won't be grouped together again.",
      ),
    ).toBeInTheDocument();
  });

  it("saves verdicts keyed by slug plus the group's clicked and goAgain answers", () => {
    mockFeedback({ data: openFeedback });
    renderPage();

    fireEvent.click(
      within(screen.getByRole("radiogroup", { name: /mariana/i })).getByRole(
        "radio",
        { name: "Yes" },
      ),
    );
    fireEvent.click(
      within(screen.getByRole("radiogroup", { name: /rui/i })).getByRole(
        "radio",
        { name: "Maybe" },
      ),
    );
    fireEvent.click(
      within(
        screen.getByRole("radiogroup", { name: "Did the group click?" }),
      ).getByRole("radio", { name: "Somewhat" }),
    );
    fireEvent.click(screen.getByRole("switch"));

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(saveFeedbackMutate).toHaveBeenCalledTimes(1);
    const [body] = saveFeedbackMutate.mock.calls[0] ?? [];
    expect(body).toEqual({
      verdicts: { mariana: "yes", rui: "maybe" },
      clicked: "somewhat",
      goAgain: true,
    });
  });

  it("reads as closed with no form when the feedback window is no longer open", () => {
    mockFeedback({ data: { ...openFeedback, isOpen: false } });
    renderPage();

    expect(
      screen.getByText("This round of feedback has closed"),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("radiogroup")).toHaveLength(0);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save" }),
    ).not.toBeInTheDocument();
    // Closed is an expected state. The retry affordance a genuine load
    // failure would show must not appear here.
    expect(
      screen.queryByRole("button", { name: /try again/i }),
    ).not.toBeInTheDocument();
  });

  it("switches to the closed view when saving answers GO_TOGETHER_FEEDBACK_CLOSED", () => {
    mockFeedback({ data: openFeedback });
    saveFeedbackMutate.mockImplementation((_body, opts) =>
      opts?.onError?.(
        new ApiError(409, "This round of feedback has closed.", {
          code: "GO_TOGETHER_FEEDBACK_CLOSED",
        }),
      ),
    );
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByText("This round of feedback has closed"),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("radiogroup")).toHaveLength(0);
  });

  it("names the gathering in the heading once useGoTogetherGroup resolves it", () => {
    mockFeedback({ data: openFeedback });
    mockGroup(groupFixture);
    renderPage();

    expect(
      screen.getByRole("heading", { name: "How did Pride Picnic go?" }),
    ).toBeInTheDocument();
  });

  it("keeps a generic heading while the gathering hasn't resolved yet", () => {
    mockFeedback({ data: openFeedback });
    mockGroup(undefined);
    renderPage();

    expect(
      screen.getByRole("heading", { name: "How did it go?" }),
    ).toBeInTheDocument();
  });

  it("links the closed view back to the specific gathering once it resolves", () => {
    mockFeedback({ data: { ...openFeedback, isOpen: false } });
    mockGroup(groupFixture);
    renderPage();

    const backLink = screen.getByRole("link", {
      name: "Back to the gathering",
    });
    expect(backLink).toHaveAttribute("href", gatheringPath("pride-picnic"));
  });

  it("falls back to the member's own events list when the group hasn't loaded", () => {
    // Covers both an in-flight useGoTogetherGroup query and the 404 a member
    // who has already left the group gets from it: either way `data` stays
    // undefined, which is exactly what this page's fallback reads.
    mockFeedback({ data: { ...openFeedback, isOpen: false } });
    mockGroup(undefined);
    renderPage();

    const backLink = screen.getByRole("link", { name: "Back to your events" });
    expect(backLink).toHaveAttribute("href", "/account/events");
  });
});

describe("GoTogetherFeedbackPage final fix wave", () => {
  it("tells the member their answers stay private and help form better groups", () => {
    mockFeedback({ data: openFeedback });
    renderPage();

    expect(
      screen.getByText(
        "Your answers stay private. With names removed, they help us form better groups.",
      ),
    ).toBeInTheDocument();
  });

  it("names the product and links back to the gathering above the title", () => {
    mockFeedback({ data: openFeedback });
    mockGroup(groupFixture);
    renderPage();

    expect(screen.getByText("Go together")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to the gathering" }),
    ).toHaveAttribute("href", gatheringPath("pride-picnic"));
  });

  it("marks the picked option with a check as well as aria-checked", () => {
    mockFeedback({ data: openFeedback });
    renderPage();

    const marianaGroup = screen.getByRole("radiogroup", { name: /mariana/i });
    const yesOption = within(marianaGroup).getByRole("radio", { name: "Yes" });
    expect(yesOption.querySelector("svg")).toBeNull();

    fireEvent.click(yesOption);

    expect(yesOption).toHaveAttribute("aria-checked", "true");
    expect(yesOption.querySelector("svg")).not.toBeNull();
    const maybeOption = within(marianaGroup).getByRole("radio", {
      name: "Maybe",
    });
    expect(maybeOption.querySelector("svg")).toBeNull();
  });

  it("reads as closed with no Retry when the group no longer exists (404)", () => {
    mockFeedback({
      isError: true,
      error: new ApiError(404, "Not found", { code: "NOT_FOUND" }),
    });
    renderPage();

    expect(
      screen.getByText("This round of feedback has closed"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /try again/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to your events" }),
    ).toBeInTheDocument();
  });

  it("keeps the Retry state for a server failure", () => {
    mockFeedback({
      isError: true,
      error: new ApiError(500, "Server error"),
    });
    renderPage();

    expect(
      screen.queryByText("This round of feedback has closed"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it("moves focus to the confirmation and scrolls to the top after saving", () => {
    const scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);
    mockFeedback({ data: openFeedback });
    saveFeedbackMutate.mockImplementation((_body, opts) =>
      opts?.onSuccess?.(openFeedback),
    );
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByRole("heading", { name: "Thanks for telling us" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Thanks for telling us" }),
    ).toHaveFocus();
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
    scrollToSpy.mockRestore();
  });

  it("leaves focus alone when the page first loads already closed", () => {
    const scrollToSpy = vi
      .spyOn(window, "scrollTo")
      .mockImplementation(() => undefined);
    mockFeedback({ data: { ...openFeedback, isOpen: false } });
    renderPage();

    expect(
      screen.getByRole("group", {
        name: "This round of feedback has closed",
      }),
    ).not.toHaveFocus();
    expect(scrollToSpy).not.toHaveBeenCalled();
    scrollToSpy.mockRestore();
  });
});
