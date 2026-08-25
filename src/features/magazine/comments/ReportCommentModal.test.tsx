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

async function pickReasonAndSubmit() {
  fireEvent.click(
    screen.getByRole("radio", { name: "Spam or self-promotion" }),
  );
  fireEvent.click(await screen.findByRole("button", { name: "Send report" }));
}

describe("ReportCommentModal", () => {
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
