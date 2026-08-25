import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ReportReplyModal } from "./ReportReplyModal";
import type { CreateReportInput } from "../safety/api/reports.api";

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
