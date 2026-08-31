import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { MessageReportModal } from "./MessageReportModal";
import { ApiError } from "../../shared/api/client";
import type { CreateReportInput } from "../safety/api/reports.api";

/**
 * TS-05: what a member is told when `POST /reports` refuses the filing.
 *
 * The backend answers 429 in three different situations and only two of them
 * carry copy written for a member to read:
 *
 *  - the rolling flood caps refuse with a typed body carrying
 *    `code: "REPORT_FLOOD_CAP"`, whose `message` IS the refusal (it tells the
 *    member the reports they already sent are with moderators). Discarding it
 *    and toasting the generic "couldn't send that flag" throws the explanation
 *    away and invites a retry the server will keep refusing;
 *  - the 60-second burst throttle raises `@nestjs/throttler`'s own
 *    `ThrottlerException`, which carries NO `code`, and whose message is
 *    framework wording that must never reach a member.
 *
 * `code` is the whole discriminator. These fixtures therefore carry the real
 * body shape, and one of them is a 429 with no `code` at all, which is what
 * proves the fall-through still works.
 *
 * This modal is the toast-shaped half of the pattern (the panel-shaped half is
 * `forum/ReportReplyModal.test.tsx`). It is also where the `safety` namespace
 * is guaranteed resident: its own submit CTA is a `safety:` string, so
 * awaiting that button means the burst copy has loaded too.
 *
 * `useCreateReport` is mocked so the test drives `onError` deterministically,
 * with no network and no demo latency timer.
 */

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
  useCreateReport: () => ({ mutate, isPending: false }),
}));

afterEach(() => {
  mutate.mockReset();
});

/** Verbatim `REPORT_DAILY_CAP_MESSAGE` from the backend's
 *  `report-flood-limits.ts`. Server-authored, plain, non-accusatory. */
const DAILY_CAP_MESSAGE =
  "You have filed a lot of reports in the last day. The ones you already sent are with the moderation team. Please try again tomorrow, and reach out to a moderator directly if something urgent is happening.";

/** The generic failure line this surface falls back to
 *  (`safety:reportPerson.error`). This modal used to fall back to
 *  `safety:flag.error`, which is safe-space BADGE copy and wrong for a DM. */
const GENERIC_MESSAGE =
  "We couldn't send that report. Nothing has been submitted yet. Check your connection and try again.";

function refuseWith(error: Error) {
  mutate.mockImplementation((_input, opts) => opts?.onError?.(error));
}

/** Fill the detail field past its 10-character minimum and submit. Awaiting the
 *  CTA also proves the lazily loaded `safety` catalog has arrived. The labels
 *  are `safety:reportPerson.form.*`: this modal no longer borrows the
 *  safe-space badge copy under `safety:flag.*`. */
async function fillAndSubmit() {
  const submitButton = await screen.findByRole("button", {
    name: "Send report",
  });
  fireEvent.change(screen.getByLabelText("What should the moderator know?"), {
    target: { value: "They kept messaging me after I asked them to stop." },
  });
  fireEvent.click(submitButton);
}

function renderModal() {
  render(
    <TestProviders>
      <MessageReportModal messageId="msg-42" onClose={vi.fn()} />
    </TestProviders>,
  );
}

describe("MessageReportModal: a refused report", () => {
  it("surfaces the server's own explanation when a rolling flood cap refuses the filing", async () => {
    refuseWith(
      new ApiError(429, DAILY_CAP_MESSAGE, {
        statusCode: 429,
        error: "Too Many Requests",
        code: "REPORT_FLOOD_CAP",
        // Additive detail the frontend must ignore rather than branch on.
        cap: "daily",
        message: DAILY_CAP_MESSAGE,
      }),
    );
    renderModal();

    await fillAndSubmit();

    // The refusal's own words reach the member, in a toast that is a live
    // region, so it is announced rather than only shown.
    expect(await screen.findByText(DAILY_CAP_MESSAGE)).toBeInTheDocument();
    // ...replacing the generic line rather than sitting next to it.
    expect(screen.queryByText(GENERIC_MESSAGE)).not.toBeInTheDocument();
  });

  it("replaces the framework's throttler wording with human copy", async () => {
    // What `@nestjs/throttler` actually ships: the canonical envelope, its own
    // exception string as the message, and no `code`.
    refuseWith(
      new ApiError(429, "ThrottlerException: Too Many Requests", {
        statusCode: 429,
        error: "Too Many Requests",
        message: "ThrottlerException: Too Many Requests",
      }),
    );
    renderModal();

    await fillAndSubmit();

    expect(
      await screen.findByText(/faster than we can take them in/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/ThrottlerException/)).not.toBeInTheDocument();
  });

  it("treats any 429 without the flood-cap code as the burst throttle", async () => {
    // A 429 from somewhere else entirely (an edge rate limiter, a proxy), so
    // no parsed body and no `code`. Absence of the code is the whole test, so
    // this must never be mistaken for server-authored member copy.
    refuseWith(new ApiError(429, "Too Many Requests"));
    renderModal();

    await fillAndSubmit();

    expect(
      await screen.findByText(/faster than we can take them in/i),
    ).toBeInTheDocument();
  });

  it("keeps the generic message for a failure carrying no member-facing copy", async () => {
    refuseWith(new Error("network down"));
    renderModal();

    await fillAndSubmit();

    expect(await screen.findByText(GENERIC_MESSAGE)).toBeInTheDocument();
  });

  it("keeps the generic message for a 4xx that is not a 429", async () => {
    refuseWith(
      new ApiError(400, "subjectId must be a string", {
        statusCode: 400,
        error: "Bad Request",
        message: "subjectId must be a string",
      }),
    );
    renderModal();

    await fillAndSubmit();

    expect(await screen.findByText(GENERIC_MESSAGE)).toBeInTheDocument();
    expect(
      screen.queryByText(/subjectId must be a string/),
    ).not.toBeInTheDocument();
  });
});
