import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ReportCommentModal } from "./ReportCommentModal";
import type { CreateReportInput } from "../../safety/api/reports.api";

/** Mirrors the real `useCreateReport().mutate` call sites in this modal, which
 *  never read the `onSuccess` data argument (see `ReportCommentModal.tsx`). */
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

vi.mock("../../safety/api/useCreateReport", () => ({
  useCreateReport: () => ({ mutate }),
}));

afterEach(() => {
  mutate.mockReset();
});

function renderModal(
  overrides: Partial<Parameters<typeof ReportCommentModal>[0]> = {},
) {
  const onClose = vi.fn();
  render(
    <TestProviders>
      <ReportCommentModal
        authorName="Rita Valente"
        subjectId="comment-real-123"
        onClose={onClose}
        {...overrides}
      />
    </TestProviders>,
  );
  return { onClose };
}

/** Pick a reason, then submit. Both labels are lazy i18n: the reason labels
 *  come from `useReportReasons`, which renders the LOCAL TRANSLATED label
 *  (`safety:reason.*`), so they arrive with the `safety` catalog rather than on
 *  first render. */
async function pickReasonAndSubmit() {
  fireEvent.click(
    await screen.findByRole("radio", { name: "Spam or self-promotion" }),
  );
  fireEvent.click(await screen.findByRole("button", { name: "Send report" }));
}

describe("ReportCommentModal", () => {
  it("never names anyone when the reported comment carries no author", async () => {
    renderModal({ authorName: null });

    // The heading is catalog copy, so wait for it before asserting an absence.
    expect(await screen.findByText("Report this comment")).toBeInTheDocument();
    // ENG-102: the caller used to pass the VIEWER's own initials here, so the
    // sheet asked them what was wrong with their own comment.
    expect(screen.queryByText(/Rita/)).toBeNull();
    expect(screen.queryByText(/undefined|null/)).toBeNull();
  });

  it("submits the report with subjectType magazine_comment and the given subjectId", async () => {
    mutate.mockImplementation((_input, opts) => opts?.onSuccess?.());
    renderModal();

    await pickReasonAndSubmit();

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0]?.[0]).toEqual({
      subjectType: "magazine_comment",
      subjectId: "comment-real-123",
      reasonCode: "spam",
    });
  });

  it("shows an honest retry panel (not the success sheet) when the report fails", async () => {
    mutate.mockImplementation((_input, opts) =>
      opts?.onError?.(new Error("boom")),
    );
    renderModal();

    await pickReasonAndSubmit();

    expect(
      await screen.findByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });
});
