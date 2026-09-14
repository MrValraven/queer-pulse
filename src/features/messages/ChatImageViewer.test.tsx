import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { ChatImageViewer } from "./ChatImageViewer";
import type { ViewerPhoto } from "./useThreadImageGallery";

const photos: ViewerPhoto[] = [
  {
    message: { from: "them", text: "Photo", kind: "image", id: "m1" },
    url: "https://cdn.example/one.jpg",
    width: 800,
    height: 600,
    senderName: "Nadia",
    dayLabel: "Today",
    timeLabel: "09:10",
    key: "m1",
  },
  {
    message: { from: "me", text: "Photo", kind: "image", id: "m2" },
    url: "https://cdn.example/two.jpg",
    width: 800,
    height: 600,
    senderName: "You",
    dayLabel: "Today",
    timeLabel: "14:32",
    key: "m2",
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider>
    <ToastProvider>{children}</ToastProvider>
  </I18nProvider>
);

describe("ChatImageViewer", () => {
  it("opens on the photo that was tapped", () => {
    render(
      <ChatImageViewer photos={photos} startIndex={1} onClose={vi.fn()} />,
      { wrapper },
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://cdn.example/two.jpg",
    );
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <ChatImageViewer photos={photos} startIndex={0} onClose={onClose} />,
      {
        wrapper,
      },
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("moves to the next photo on the right arrow and wraps around", async () => {
    render(
      <ChatImageViewer photos={photos} startIndex={1} onClose={vi.fn()} />,
      {
        wrapper,
      },
    );
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://cdn.example/one.jpg",
    );
  });

  it("closes the viewer when replying, and hands back the message", async () => {
    const onClose = vi.fn();
    const onReply = vi.fn();
    render(
      <ChatImageViewer
        photos={photos}
        startIndex={0}
        onClose={onClose}
        onReply={onReply}
      />,
      { wrapper },
    );
    await userEvent.click(screen.getByRole("button", { name: /reply/i }));
    expect(onReply).toHaveBeenCalledWith(photos[0]!.message);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes rather than leave the page scroll-locked with nothing to show", () => {
    // `useDismiss` locks scroll and joins the modal stack unconditionally, so
    // an empty `photos` array (or a `startIndex` past the end, e.g. the last
    // photo in the thread getting deleted while the viewer is open) must not
    // strand those effects behind a null render.
    const onClose = vi.fn();
    render(<ChatImageViewer photos={[]} startIndex={0} onClose={onClose} />, {
      wrapper,
    });
    expect(onClose).toHaveBeenCalled();
  });
});
