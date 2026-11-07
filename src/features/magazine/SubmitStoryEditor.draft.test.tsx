import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { SubmitStoryEditor } from "./SubmitStoryEditor";

/**
 * The submit-story draft survives a failed submit and a reload (a remount).
 *
 * Live mode: the editor only sends (and so can only fail) when demo mode is
 * off, so `useDemoMode` is pinned to live, the submission call is mocked, and
 * the open-issue strip is given an answer so nothing reaches the network.
 * Storage is jsdom's `localStorage`, cleared around every test.
 */

const apiMocks = vi.hoisted(() => ({ createStorySubmission: vi.fn() }));

vi.mock("./api/magazine.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/magazine.api")>()),
  ...apiMocks,
}));

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({
    demoMode: false,
    available: false,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));

vi.mock("./api/useSubmissionWindow", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/useSubmissionWindow")>()),
  useOpenIssue: () => ({ openIssue: null, isLoading: false, isError: false }),
}));

/** `STORY_DRAFT_KEY` in `useStoryDraft.ts`. */
const STORY_DRAFT_KEY = "qp-story-draft-v1";

/** Sixty words, past the editor's 50-word minimum. */
const STORY_BODY = Array.from(
  { length: 60 },
  (_unused, index) => `word${index}`,
).join(" ");

const LAST_EDIT = `${STORY_BODY} and the line written a moment before submit`;

const SEEDED_DRAFT = {
  form: {
    section: "Long read",
    byline: "",
    bylineNote: "",
    tags: "",
    headline: "A night at the archive",
    deck: "",
    body: STORY_BODY,
  },
  coverName: null,
  savedAt: 1,
};

const PLATFORM_LOCKED = new ApiError(503, "Back soon", {
  statusCode: 503,
  error: "Service Unavailable",
  code: "PLATFORM_LOCKED",
  message: "Back soon",
});

const BODY_TOO_LARGE = new ApiError(413, "request entity too large", {
  statusCode: 413,
  message: "request entity too large",
});

function storedBody(): string | null {
  const raw = localStorage.getItem(STORY_DRAFT_KEY);
  if (raw === null) return null;
  return (JSON.parse(raw) as typeof SEEDED_DRAFT).form.body;
}

function renderEditor() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ToastProvider>{children}</ToastProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return render(<SubmitStoryEditor onSubmit={vi.fn()} />, { wrapper });
}

/** Resume the seeded draft, then make one last edit to the body. */
async function resumeAndEdit() {
  fireEvent.click(await screen.findByRole("button", { name: "Resume draft" }));
  fireEvent.change(await screen.findByRole("textbox", { name: "Story body" }), {
    target: { value: LAST_EDIT },
  });
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(STORY_DRAFT_KEY, JSON.stringify(SEEDED_DRAFT));
  apiMocks.createStorySubmission.mockReset();
});

afterEach(() => {
  localStorage.clear();
});

describe("SubmitStoryEditor draft after a failed submit", () => {
  it("writes the last edit before the request leaves, so an unmount cannot drop it", async () => {
    apiMocks.createStorySubmission.mockRejectedValue(PLATFORM_LOCKED);
    const { unmount } = renderEditor();
    await resumeAndEdit();

    fireEvent.click(screen.getByRole("button", { name: "Submit for review" }));
    // Synchronously after the click: the 600 ms autosave has not fired, so
    // only the write before sending can have stored the last edit.
    expect(storedBody()).toBe(LAST_EDIT);
    expect(apiMocks.createStorySubmission).toHaveBeenCalledTimes(1);

    // The platform lock swaps the whole app for the maintenance screen,
    // which unmounts this editor and cancels any pending autosave.
    unmount();
    expect(storedBody()).toBe(LAST_EDIT);
  });

  it("keeps the draft after a refused submit and offers it again after a remount", async () => {
    apiMocks.createStorySubmission.mockRejectedValue(BODY_TOO_LARGE);
    const firstRender = renderEditor();
    await resumeAndEdit();

    fireEvent.click(screen.getByRole("button", { name: "Submit for review" }));
    expect(
      await screen.findByText(/too large for our servers to take in one go/),
    ).toBeInTheDocument();
    expect(storedBody()).toBe(LAST_EDIT);

    // A reload is a fresh mount reading the same storage.
    firstRender.unmount();
    renderEditor();
    fireEvent.click(
      await screen.findByRole("button", { name: "Resume draft" }),
    );
    expect(
      await screen.findByRole("textbox", { name: "Story body" }),
    ).toHaveValue(LAST_EDIT);
    expect(storedBody()).toBe(LAST_EDIT);
  });

  it("shows the maintenance line for the platform lock and keeps the draft", async () => {
    apiMocks.createStorySubmission.mockRejectedValue(PLATFORM_LOCKED);
    renderEditor();
    await resumeAndEdit();

    fireEvent.click(screen.getByRole("button", { name: "Submit for review" }));
    expect(
      await screen.findByText(
        /paused for maintenance, so your story was not sent/,
      ),
    ).toBeInTheDocument();
    expect(storedBody()).toBe(LAST_EDIT);
  });

  it("clears the draft only once the story is accepted", async () => {
    apiMocks.createStorySubmission.mockResolvedValue({ id: "submission-1" });
    renderEditor();
    await resumeAndEdit();

    fireEvent.click(screen.getByRole("button", { name: "Submit for review" }));
    await waitFor(() => {
      expect(localStorage.getItem(STORY_DRAFT_KEY)).toBeNull();
    });
  });
});
