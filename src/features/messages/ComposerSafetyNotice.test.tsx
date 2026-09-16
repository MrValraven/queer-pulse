import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ComposerSafetyNotice } from "./ComposerSafetyNotice";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
);

// Each test uses its own conversation id: the dismissal store is module-level
// by design (see `ComposerSafetyNotice.tsx`), so distinct ids keep the tests
// isolated from one another the same way distinct real conversations are.
//
// The outer wrapper (`aria-live="polite"`) stays mounted at all times with no
// role of its own, so `queryByRole("note")` correctly finds nothing when the
// notice is hidden; it only finds something once the visible content (which
// carries `role="note"`) mounts. Presence assertions below also check the
// notice text directly, so they exercise the visible content instead of
// leaning on the wrapper alone.
const noticeText = /keep the conversation here/i;

describe("ComposerSafetyNotice", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("renders nothing when there are no signals", () => {
    render(<ComposerSafetyNotice signals={[]} conversationId="empty" />, {
      wrapper,
    });
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
    expect(screen.queryByText(noticeText)).not.toBeInTheDocument();
  });

  it("shows the notice once the debounced signal settles", async () => {
    render(
      <ComposerSafetyNotice signals={["phone"]} conversationId="shows" />,
      { wrapper },
    );
    await waitFor(() => {
      expect(screen.getByRole("note")).toBeInTheDocument();
    });
    expect(screen.getByText(noticeText)).toBeInTheDocument();
  });

  it("has a close button reachable by its accessible name, and dismissing hides the notice", async () => {
    const user = userEvent.setup();
    render(
      <ComposerSafetyNotice signals={["email"]} conversationId="dismiss" />,
      { wrapper },
    );
    const closeButton = await screen.findByRole("button", { name: /./ });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole("note")).not.toBeInTheDocument();
    });
    expect(screen.queryByText(noticeText)).not.toBeInTheDocument();
  });

  it("calls onDismiss instead of focusing the composer when provided", async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();
    render(
      <ComposerSafetyNotice
        signals={["email"]}
        conversationId="dismiss-callback"
        onDismiss={handleDismiss}
      />,
      { wrapper },
    );
    const closeButton = await screen.findByRole("button", { name: /./ });
    await user.click(closeButton);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it("falls back to focusing the composer input when onDismiss is absent", async () => {
    const user = userEvent.setup();
    const composerInput = document.createElement("textarea");
    composerInput.id = "messages-composer";
    document.body.appendChild(composerInput);
    try {
      render(
        <ComposerSafetyNotice
          signals={["email"]}
          conversationId="dismiss-fallback-focus"
        />,
        { wrapper },
      );
      const closeButton = await screen.findByRole("button", { name: /./ });
      await user.click(closeButton);
      await waitFor(() => {
        expect(document.activeElement).toBe(composerInput);
      });
    } finally {
      composerInput.remove();
    }
  });

  it("keeps a dismissal for the rest of the conversation's session even as the draft changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ComposerSafetyNotice signals={["phone"]} conversationId="session" />,
      { wrapper },
    );
    const closeButton = await screen.findByRole("button", { name: /./ });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole("note")).not.toBeInTheDocument();
    });

    // Signals flip off then on again as the draft keeps changing, still
    // dismissed for this conversation.
    rerender(<ComposerSafetyNotice signals={[]} conversationId="session" />);
    rerender(
      <ComposerSafetyNotice
        signals={["phone", "banking"]}
        conversationId="session"
      />,
    );
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
    expect(screen.queryByText(noticeText)).not.toBeInTheDocument();
  });

  it("does not carry a dismissal over to a different conversation", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <ComposerSafetyNotice signals={["phone"]} conversationId="diff-a" />,
      { wrapper },
    );
    const closeButton = await screen.findByRole("button", { name: /./ });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole("note")).not.toBeInTheDocument();
    });
    unmount();

    render(
      <ComposerSafetyNotice signals={["phone"]} conversationId="diff-b" />,
      { wrapper },
    );
    await waitFor(() => {
      expect(screen.getByRole("note")).toBeInTheDocument();
    });
    expect(screen.getByText(noticeText)).toBeInTheDocument();
  });

  it("remembers a dismissal across a remount for the same conversation (session persistence)", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <ComposerSafetyNotice signals={["phone"]} conversationId="remount" />,
      { wrapper },
    );
    const closeButton = await screen.findByRole("button", { name: /./ });
    await user.click(closeButton);
    unmount();

    render(
      <ComposerSafetyNotice signals={["phone"]} conversationId="remount" />,
      { wrapper },
    );
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
    expect(screen.queryByText(noticeText)).not.toBeInTheDocument();
  });
});
