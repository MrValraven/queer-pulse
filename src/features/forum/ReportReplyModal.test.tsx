import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ReportReplyModal } from "./ReportReplyModal";
import type { CreateReportInput } from "../safety/api/reports.api";
import { ApiError } from "../../shared/api/client";

/**
 * Forum report flow (audit P1-1 / P1-2). Two guarantees the modal must keep:
 *
 *  - The report is submitted with the `subjectId` it was handed (the OP's real
 *    `opPostId` for a post, the reply's `postId` for a reply — the caller,
 *    `ThreadOpSection`, is what picks the real id; see
 *    `ThreadOpReport.test.tsx`). Here we assert the modal forwards whatever
 *    `subjectId` it's given, unchanged, into the report payload.
 *  - A FAILED report must NOT show the plum success sheet — it shows an honest
 *    retry panel — so a member never believes moderators were pinged when the
 *    POST actually errored. This is the core P1-2 regression.
 *
 * `useCreateReport` is mocked so the test drives `onSuccess`/`onError`
 * deterministically without a network or the demo latency timer. The mock's
 * `.mutate(input, { onSuccess, onError })` mirrors react-query's mutate contract
 * the component relies on.
 */

/** Mirrors the real `useCreateReport().mutate` call sites in this modal, which
 *  never read the `onSuccess` data argument (see `ReportReplyModal.tsx`). */
type CreateReportMutate = (
  input: CreateReportInput,
  opts?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  },
) => void;

const { mutate } = vi.hoisted(() => ({
  mutate: vi.fn<CreateReportMutate>(),
}));

vi.mock("../safety/api/useCreateReport", () => ({
  useCreateReport: () => ({ mutate }),
}));

afterEach(() => {
  mutate.mockReset();
});

function renderModal(
  overrides: Partial<Parameters<typeof ReportReplyModal>[0]> = {},
) {
  const onClose = vi.fn();
  render(
    <TestProviders>
      <ReportReplyModal
        authorName="Rita Valente"
        subjectId="op-real-post-123"
        subjectType="post"
        onClose={onClose}
        {...overrides}
      />
    </TestProviders>,
  );
  return { onClose };
}

/** Pick a reason (labels are plain English from REASON_LABELS, present on first
 *  render) then submit (the CTA label is lazy i18n, so await it). */
async function pickReasonAndSubmit() {
  fireEvent.click(
    screen.getByRole("radio", { name: "Spam or self-promotion" }),
  );
  fireEvent.click(await screen.findByRole("button", { name: "Send report" }));
}

describe("ReportReplyModal", () => {
  it("submits the report with the exact subjectId/subjectType it was handed", async () => {
    mutate.mockImplementation((_input, opts) => opts?.onSuccess?.());
    renderModal();

    await pickReasonAndSubmit();

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0]?.[0]).toEqual({
      subjectType: "post",
      subjectId: "op-real-post-123",
      reasonCode: "spam",
    });
  });

  it("shows the plum success confirmation after a report succeeds", async () => {
    mutate.mockImplementation((_input, opts) => opts?.onSuccess?.());
    renderModal();

    await pickReasonAndSubmit();

    expect(await screen.findByText(/we're on it/i)).toBeInTheDocument();
  });

  it("shows the retry panel — NOT the success sheet — when the report fails", async () => {
    mutate.mockImplementation((_input, opts) =>
      opts?.onError?.(new Error("network down")),
    );
    renderModal();

    await pickReasonAndSubmit();

    // The honest failure state renders...
    expect(await screen.findByText("That didn't send")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
    // ...and the success confirmation must never appear.
    expect(screen.queryByText(/we're on it/i)).not.toBeInTheDocument();
  });

  /**
   * TS-05, the rolling flood caps. `POST /reports` answers 429 in three
   * different situations and only two of them are written for a member to
   * read. `code: "REPORT_FLOOD_CAP"` on the error body is what tells them
   * apart; the burst throttle carries no `code` (see
   * `safety/api/reportSubmissionError.ts`).
   */
  describe("a 429 refusal", () => {
    /** Verbatim `REPORT_PER_SUBJECT_CAP_MESSAGE` from the backend's
     *  `report-flood-limits.ts`. Server-authored, member-facing, and the whole
     *  point of the refusal. */
    const PER_SUBJECT_CAP_MESSAGE =
      "You have already reported this a few times recently. Those reports are with the moderation team, so there is no need to send another one. Reach out to a moderator directly if something urgent is happening.";

    it("shows the server's own explanation when a flood cap refuses the filing", async () => {
      mutate.mockImplementation((_input, opts) =>
        opts?.onError?.(
          new ApiError(429, PER_SUBJECT_CAP_MESSAGE, {
            statusCode: 429,
            error: "Too Many Requests",
            code: "REPORT_FLOOD_CAP",
            // Additive detail the frontend must ignore rather than branch on.
            cap: "subject",
            message: PER_SUBJECT_CAP_MESSAGE,
          }),
        ),
      );
      renderModal();

      await pickReasonAndSubmit();

      const explanation = await screen.findByText(PER_SUBJECT_CAP_MESSAGE);
      expect(explanation).toBeInTheDocument();
      // Announced, never only shown.
      expect(explanation).toHaveAttribute("role", "alert");
      // The generic body copy is replaced, not appended to.
      expect(
        screen.queryByText(/check your connection/i),
      ).not.toBeInTheDocument();
      // And a refusal is still a failure: never the success sheet.
      expect(screen.queryByText(/we're on it/i)).not.toBeInTheDocument();
    });

    it("never shows the framework's throttler wording on a 429 with no code", async () => {
      // What `@nestjs/throttler` actually ships: the canonical envelope, its
      // own exception string as the message, and no `code`. Its wording is the
      // one 429 text that must never be passed through. (The human line that
      // replaces it is asserted in `messages/MessageReportModal.test.tsx`,
      // where the `safety` namespace is already resident.)
      mutate.mockImplementation((_input, opts) =>
        opts?.onError?.(
          new ApiError(429, "ThrottlerException: Too Many Requests", {
            statusCode: 429,
            error: "Too Many Requests",
            message: "ThrottlerException: Too Many Requests",
          }),
        ),
      );
      renderModal();

      await pickReasonAndSubmit();

      expect(await screen.findByText("That didn't send")).toBeInTheDocument();
      expect(screen.queryByText(/ThrottlerException/)).not.toBeInTheDocument();
      expect(screen.queryByText(/too many requests/i)).not.toBeInTheDocument();
    });

    it("does not treat a 429 carrying some other code as member copy", async () => {
      // Only `REPORT_FLOOD_CAP` means "server-authored, show verbatim". Any
      // other code is a refusal this surface has no copy for, so it falls
      // through to the burst line rather than leaking an unowned message.
      mutate.mockImplementation((_input, opts) =>
        opts?.onError?.(
          new ApiError(429, "Slow down there, friend.", {
            statusCode: 429,
            error: "Too Many Requests",
            code: "SOME_OTHER_LIMIT",
            message: "Slow down there, friend.",
          }),
        ),
      );
      renderModal();

      await pickReasonAndSubmit();

      expect(await screen.findByText("That didn't send")).toBeInTheDocument();
      expect(
        screen.queryByText("Slow down there, friend."),
      ).not.toBeInTheDocument();
    });

    it("keeps the generic message for a failure that carries no member copy", async () => {
      mutate.mockImplementation((_input, opts) =>
        opts?.onError?.(new Error("network down")),
      );
      renderModal();

      await pickReasonAndSubmit();

      expect(
        await screen.findByText(/check your connection/i),
      ).toBeInTheDocument();
    });
  });

  it("re-submits from the retry panel", async () => {
    // First attempt fails, second succeeds.
    mutate
      .mockImplementationOnce((_input, opts) =>
        opts?.onError?.(new Error("boom")),
      )
      .mockImplementationOnce((_input, opts) => opts?.onSuccess?.());
    renderModal();

    await pickReasonAndSubmit();
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));

    expect(mutate).toHaveBeenCalledTimes(2);
    expect(await screen.findByText(/we're on it/i)).toBeInTheDocument();
  });
});
