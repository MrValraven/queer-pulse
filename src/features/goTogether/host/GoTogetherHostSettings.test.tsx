import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { TestProviders } from "../../../test/TestProviders";
import type {
  HostConfigBody,
  HostConfigDTO,
  HostSummaryDTO,
} from "../api/goTogether.types";
import { GoTogetherHostSettings } from "./GoTogetherHostSettings";
import { epochToZonedInputValue } from "./goTogetherHostSettings.helpers";

/**
 * The host's Go together section. The host hooks are mocked, so each case
 * sets the saved config and summary and reads what the section sends to the
 * save mutation.
 */

type SaveMutate = (
  body: HostConfigBody,
  options?: { onSuccess?: () => void; onError?: (error: unknown) => void },
) => void;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
// Ten days out, so the earliest cutoff (7 days before) is still ahead and
// the input's floor is the server's own earliest time.
const START_MS = Math.ceil(Date.now() / MINUTE_MS) * MINUTE_MS + 10 * DAY_MS;
const EARLIEST_MS = START_MS - 7 * DAY_MS;
const LATEST_MS = START_MS - 6 * HOUR_MS;
const DEFAULT_CUTOFF_MS = START_MS - 48 * HOUR_MS;

function hostConfig(overrides: Partial<HostConfigDTO> = {}): HostConfigDTO {
  return {
    enabled: true,
    cutoffAt: new Date(DEFAULT_CUTOFF_MS).toISOString(),
    earliestCutoffAt: new Date(EARLIEST_MS).toISOString(),
    latestCutoffAt: new Date(LATEST_MS).toISOString(),
    hostQuestions: [],
    meetingPointNote: null,
    isLocked: false,
    ...overrides,
  };
}

const { mutate, hookState } = vi.hoisted(() => ({
  mutate: vi.fn<SaveMutate>(),
  hookState: {
    config: undefined as HostConfigDTO | undefined,
    summary: undefined as HostSummaryDTO | undefined,
  },
}));

vi.mock("../api/useGoTogetherHostConfig", () => ({
  useGoTogetherHostConfig: () => ({
    data: hookState.config,
    isError: false,
    refetch: vi.fn(),
  }),
  useGoTogetherHostSummary: () => ({ data: hookState.summary }),
  useSaveGoTogetherHostConfig: () => ({
    mutate,
    isPending: false,
    variables: undefined,
  }),
}));

afterEach(() => {
  mutate.mockReset();
  hookState.config = undefined;
  hookState.summary = undefined;
});

function renderSettings(config: HostConfigDTO, summary?: HostSummaryDTO) {
  hookState.config = config;
  hookState.summary = summary;
  render(
    <TestProviders>
      <GoTogetherHostSettings slug="pride-picnic" />
    </TestProviders>,
  );
}

describe("GoTogetherHostSettings", () => {
  it("saves enabled as soon as the host flips the switch", () => {
    renderSettings(hostConfig({ enabled: false }));

    expect(screen.queryByLabelText("When matching runs")).toBeNull();
    const toggle = screen.getByRole("switch", { name: "Offer Go together" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    fireEvent.click(toggle);

    expect(mutate).toHaveBeenCalledTimes(1);
    const body = mutate.mock.calls[0]?.[0];
    expect(body).toEqual({
      enabled: true,
      hostQuestions: [],
      meetingPointNote: null,
    });
    // The saved cutoff is the 48 hour default, so the server works it out.
    expect(body && "cutoffAt" in body).toBe(false);
  });

  it("keeps the cutoff input between the earliest and latest cutoff", () => {
    renderSettings(hostConfig());

    const cutoffInput = screen.getByLabelText("When matching runs");
    expect(cutoffInput).toHaveAttribute("type", "datetime-local");
    expect(cutoffInput).toHaveAttribute(
      "min",
      epochToZonedInputValue(EARLIEST_MS, undefined),
    );
    expect(cutoffInput).toHaveAttribute(
      "max",
      epochToZonedInputValue(LATEST_MS, undefined),
    );
    expect(cutoffInput).toHaveValue(
      epochToZonedInputValue(DEFAULT_CUTOFF_MS, undefined),
    );

    fireEvent.change(cutoffInput, {
      target: { value: epochToZonedInputValue(LATEST_MS + DAY_MS, undefined) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mutate).not.toHaveBeenCalled();
    expect(
      screen.getByText("Pick a time in the range above."),
    ).toBeInTheDocument();
  });

  it("allows at most 2 questions with 2 to 4 answers each", () => {
    renderSettings(hostConfig());

    const addQuestion = screen.getByRole("button", { name: "Add a question" });
    fireEvent.click(addQuestion);
    expect(screen.getAllByLabelText(/^Answer \d$/)).toHaveLength(2);
    // Two answers is the floor, so neither can be removed yet.
    expect(screen.queryByRole("button", { name: /^Remove answer/ })).toBeNull();

    fireEvent.click(addQuestion);
    expect(addQuestion).toBeDisabled();
    // The label also carries the "0/80" counter, so it matches by prefix.
    expect(screen.getByLabelText(/^Question 2/)).toBeInTheDocument();

    const addAnswerToFirst = () => {
      const [firstButton] = screen.getAllByRole("button", {
        name: "Add an answer",
      });
      if (!firstButton) throw new Error("No Add an answer button");
      return firstButton;
    };
    fireEvent.click(addAnswerToFirst());
    fireEvent.click(addAnswerToFirst());
    expect(addAnswerToFirst()).toBeDisabled();
    expect(screen.getAllByLabelText(/^Answer \d$/)).toHaveLength(6);
    expect(
      screen.getAllByRole("button", { name: /^Remove answer/ }),
    ).toHaveLength(4);
  });

  it("renders every control read-only once matching has run", () => {
    renderSettings(
      hostConfig({
        isLocked: true,
        meetingPointNote: "By the kiosk",
        hostQuestions: [
          {
            id: "q1",
            prompt: "Picnic or dance floor?",
            options: [
              { id: "o1", label: "Picnic" },
              { id: "o2", label: "Dance floor" },
            ],
          },
        ],
      }),
    );

    expect(
      screen.getByText(
        "Matching has run for this gathering, so these settings are locked.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Offer Go together" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByLabelText("When matching runs")).toHaveAttribute(
      "readonly",
    );
    expect(screen.getByLabelText(/^Question 1/)).toHaveAttribute("readonly");
    for (const answerInput of screen.getAllByLabelText(/^Answer \d$/)) {
      expect(answerInput).toHaveAttribute("readonly");
    }
    expect(screen.getByDisplayValue("By the kiosk")).toHaveAttribute(
      "readonly",
    );
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Add a question" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Add an answer" })).toBeNull();
  });

  it("shows the waiting and group counts and nothing about who", () => {
    renderSettings(hostConfig(), {
      waiting: 7,
      grouped: 8,
      unmatched: 1,
      groups: 2,
    });

    const summary = screen.getByRole("region", { name: "So far" });
    expect(within(summary).getByText("7")).toBeInTheDocument();
    expect(within(summary).getByText("people waiting")).toBeInTheDocument();
    expect(within(summary).getByText("2")).toBeInTheDocument();
    expect(within(summary).getByText("groups formed")).toBeInTheDocument();
    expect(within(summary).queryByText("8")).toBeNull();
    expect(within(summary).queryByText("1")).toBeNull();
    expect(within(summary).queryAllByRole("img")).toHaveLength(0);
    expect(within(summary).queryAllByRole("listitem")).toHaveLength(0);
  });

  it("shows inline copy under the cutoff when the server refuses it", () => {
    mutate.mockImplementation((_body, options) =>
      options?.onError?.(
        new ApiError(400, "Bad cutoff", { code: "GO_TOGETHER_BAD_CUTOFF" }),
      ),
    );
    renderSettings(hostConfig());

    const cutoffInput = screen.getByLabelText("When matching runs");
    const chosenCutoff = epochToZonedInputValue(
      DEFAULT_CUTOFF_MS + DAY_MS,
      undefined,
    );
    fireEvent.change(cutoffInput, { target: { value: chosenCutoff } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0]?.[0].cutoffAt).toBe(
      new Date(DEFAULT_CUTOFF_MS + DAY_MS).toISOString(),
    );
    const error = screen.getByText("Pick a time in the range above.");
    expect(cutoffInput).toHaveAttribute("aria-invalid", "true");
    expect(cutoffInput.getAttribute("aria-describedby")).toContain(
      error.closest("p")?.id,
    );
  });
});
