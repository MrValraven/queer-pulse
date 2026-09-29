import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { ApiError } from "../../shared/api/client";
import { AdminForumReviewPage } from "./AdminForumReviewPage";
import * as adminForumReviewApi from "./api/adminForumReview.api";
import type { AdminForumReviewThread } from "./api/adminForumReview.api";
import { ADMIN_FORUM_REVIEW_THREADS } from "./adminForumReview.data";

const demoState = vi.hoisted(() => ({ isDemoMode: true }));
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: demoState.isDemoMode }),
}));

// AdminShell pulls in the full admin chrome (theme toggle, live nav-badge
// queries, the auth-backed role switcher) that this test has no reason to
// exercise. See AdminResourceSuggestionsPage.test.tsx for the same mock.
vi.mock("../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const toastSpy = vi.fn();
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: toastSpy }),
}));

/** The fixture's first thread, typed as present so every closure below can
 *  read it: a narrowed module constant does not stay narrowed inside them. */
function firstHeldThread(): AdminForumReviewThread {
  const [thread] = ADMIN_FORUM_REVIEW_THREADS;
  if (!thread) throw new Error("The review fixture needs a thread.");
  return thread;
}

const heldThread = firstHeldThread();

const EMPTY_PAGE_INFO = { nextCursor: null, hasMore: false };

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ToastProvider>
          <MemoryRouter>
            <AdminForumReviewPage />
          </MemoryRouter>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

/** Live mode, with one held thread on the first read and none after. */
function serveOneThreadThenNone() {
  demoState.isDemoMode = false;
  return vi
    .spyOn(adminForumReviewApi, "getForumReviewQueue")
    .mockResolvedValueOnce({ data: [heldThread], pageInfo: EMPTY_PAGE_INFO })
    .mockResolvedValue({ data: [], pageInfo: EMPTY_PAGE_INFO });
}

beforeEach(() => {
  toastSpy.mockClear();
  vi.restoreAllMocks();
  demoState.isDemoMode = true;
});

describe("AdminForumReviewPage", () => {
  it("lists pending threads in demo", async () => {
    const queueSpy = vi.spyOn(adminForumReviewApi, "getForumReviewQueue");
    renderPage();

    for (const thread of ADMIN_FORUM_REVIEW_THREADS) {
      expect(await screen.findByText(thread.title)).toBeInTheDocument();
    }
    // The moderator view names the real author of the anonymous thread.
    expect(
      screen.getByText(heldThread.author.displayName, { exact: false }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Will post anonymously"),
    ).toBeInTheDocument();
    expect(queueSpy).not.toHaveBeenCalled();
  });

  it("approve posts the approve decision and removes the row", async () => {
    serveOneThreadThenNone();
    const reviewSpy = vi
      .spyOn(adminForumReviewApi, "reviewForumThread")
      .mockResolvedValue({ ...heldThread, reviewState: "approved" });
    renderPage();
    const user = userEvent.setup();

    expect(await screen.findByText(heldThread.title)).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Approve" }));

    await waitFor(() =>
      expect(reviewSpy).toHaveBeenCalledWith(
        heldThread.slug,
        "approve",
        undefined,
      ),
    );
    await waitFor(() =>
      expect(screen.queryByText(heldThread.title)).not.toBeInTheDocument(),
    );
    expect(toastSpy).toHaveBeenCalledWith(
      "Approved. The thread is live and the author knows.",
      "success",
    );
  });

  it("decline sends the note", async () => {
    serveOneThreadThenNone();
    const reviewSpy = vi
      .spyOn(adminForumReviewApi, "reviewForumThread")
      .mockResolvedValue({ ...heldThread, reviewState: "rejected" });
    renderPage();
    const user = userEvent.setup();

    await screen.findByText(heldThread.title);
    await user.click(await screen.findByRole("button", { name: "Decline" }));
    await user.type(
      await screen.findByLabelText("Note for the author (optional)"),
      "  Please add the housing warning and send it again.  ",
    );
    await user.click(
      await screen.findByRole("button", { name: "Decline thread" }),
    );

    await waitFor(() =>
      expect(reviewSpy).toHaveBeenCalledWith(
        heldThread.slug,
        "reject",
        "Please add the housing warning and send it again.",
      ),
    );
    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        "Declined. We told the author.",
        "success",
      ),
    );
  });

  it("a 409 shows the already-decided toast", async () => {
    const queueSpy = serveOneThreadThenNone();
    vi.spyOn(adminForumReviewApi, "reviewForumThread").mockRejectedValue(
      new ApiError(409, "This thread is not waiting on a review."),
    );
    renderPage();
    const user = userEvent.setup();

    await screen.findByText(heldThread.title);
    await user.click(await screen.findByRole("button", { name: "Approve" }));

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        "Someone already decided on this thread.",
        "error",
      ),
    );
    // The queue is read again, so the stale row goes away.
    await waitFor(() => expect(queueSpy).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.queryByText(heldThread.title)).not.toBeInTheDocument(),
    );
  });
});
