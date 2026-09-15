import { render, screen, waitFor, within } from "@testing-library/react";
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
    senderName: "Nadia Ferreira",
    senderAvatar: "https://cdn.example/nadia.jpg",
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

/** The same thread with the server ids stripped: a demo or still-optimistic
 *  message, which cannot be replied to, forwarded or starred. */
const unsentPhotos: ViewerPhoto[] = photos.map((photo) => ({
  ...photo,
  message: { ...photo.message, id: undefined },
}));

/** The same thread with the first photo already starred, for the toggle
 *  button's pressed state. */
const starredPhotos: ViewerPhoto[] = photos.map((photo) => ({
  ...photo,
  message: { ...photo.message, starred: true },
}));

/** A sender the app has no profile photo for, so the top bar falls back to an
 *  initials avatar. */
const photosWithoutAvatar: ViewerPhoto[] = [
  { ...photos[0]!, senderAvatar: undefined },
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

  it("puts every action in the top bar, reachable by its accessible name", () => {
    // The actions used to live in a labelled bottom bar. They are now wordless
    // icons in the top bar, so the accessible name is the ONLY name they have.
    render(
      <ChatImageViewer
        photos={photos}
        startIndex={0}
        onClose={vi.fn()}
        onReply={vi.fn()}
        onForward={vi.fn()}
        onToggleStar={vi.fn()}
      />,
      { wrapper },
    );
    for (const name of [/save/i, /reply/i, /forward/i, /star/i, /close/i]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("offers only Save and Close for a message with no server id", () => {
    // `canAct` is false without an id, so the three actions that need the
    // server to identify the message are not offered at all.
    render(
      <ChatImageViewer
        photos={unsentPhotos}
        startIndex={0}
        onClose={vi.fn()}
        onReply={vi.fn()}
        onForward={vi.fn()}
        onToggleStar={vi.fn()}
      />,
      { wrapper },
    );
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reply/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /forward/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /star/i })).toBeNull();
  });

  it("shows the sender's photo in the top bar, and initials without one", () => {
    // The avatar is decorative (`alt=""`): the sender's name is rendered
    // visibly beside it, so naming the image too would read the person twice.
    // That is also what keeps `getByRole("img")` below the photo itself.
    const { rerender } = render(
      <ChatImageViewer photos={photos} startIndex={0} onClose={vi.fn()} />,
      { wrapper },
    );
    expect(document.querySelector('img[alt=""]')).toHaveAttribute(
      "src",
      "https://cdn.example/nadia.jpg",
    );
    rerender(
      <ChatImageViewer
        photos={photosWithoutAvatar}
        startIndex={0}
        onClose={vi.fn()}
      />,
    );
    expect(document.querySelector('img[alt=""]')).toBeNull();
    expect(screen.getByText("NF")).toBeInTheDocument();
  });

  it("mounts the filmstrip for a thread with more than one photo, and not for one", () => {
    // Row three of the dialog grid, where the labelled action bar used to be.
    // The filmstrip decides for itself that a single-photo thread has no
    // sequence worth showing, so the viewer mounts it either way.
    const { rerender } = render(
      <ChatImageViewer photos={photos} startIndex={0} onClose={vi.fn()} />,
      { wrapper },
    );
    // The strip of thumbnails is the viewer's only `group`: nothing else under
    // src/features/messages uses that role, and the viewer tree has no
    // fieldset or details for it to collide with.
    expect(screen.getByRole("group")).toBeInTheDocument();
    rerender(
      <ChatImageViewer
        photos={photosWithoutAvatar}
        startIndex={0}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole("group")).toBeNull();
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
    // Awaited, not immediate: `onClose` is what unmounts the viewer, so it
    // comes after the exit animation rather than on the key press. See
    // `useViewerClose`.
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("reports one close however many times it is asked to close", async () => {
    // Escape pressed twice while the exit is still playing, or a backdrop
    // click on the way to the close button. A second phase would hold the
    // viewer up for another full exit and unmount it twice.
    const onClose = vi.fn();
    render(
      <ChatImageViewer photos={photos} startIndex={0} onClose={onClose} />,
      { wrapper },
    );
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalledTimes(1);
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
    // The reply draft opens on the click; only the viewer's own exit waits.
    expect(onReply).toHaveBeenCalledWith(photos[0]!.message);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("re-announces the position in the live region when an arrow pages the photo", async () => {
    // The worded half of the counter is the viewer's ONLY announcement for
    // arrow-key paging: the stage swaps an <img> and a number in place, and
    // both of those are silent to a screen reader.
    render(
      <ChatImageViewer photos={photos} startIndex={0} onClose={vi.fn()} />,
      { wrapper },
    );
    // Scoped to the dialog: the ToastProvider wrapping every test keeps a
    // live region of its own, so the viewer's counter is not the only
    // `status` in the document.
    const liveRegion = within(screen.getByRole("dialog")).getByRole("status");
    // Awaited, not immediate: `messages` is a lazy i18n namespace, so the
    // first paint carries raw keys.
    await waitFor(() =>
      expect(liveRegion).toHaveTextContent("Photo 1 of 2, from Nadia Ferreira"),
    );

    await userEvent.keyboard("{ArrowRight}");
    expect(liveRegion).toHaveTextContent("Photo 2 of 2, from You");
  });

  it("carries the starred state on the Star button rather than in its name", async () => {
    // APG toggle button: the name is fixed at the feature ("Star") in both
    // states and `aria-pressed` carries the state. A name that flipped to
    // "Unstar" while `aria-pressed` was true announced the action and the
    // inverse state in the same breath.
    const { rerender } = render(
      <ChatImageViewer
        photos={photos}
        startIndex={0}
        onClose={vi.fn()}
        onToggleStar={vi.fn()}
      />,
      { wrapper },
    );
    const unstarredButton = await screen.findByRole("button", {
      name: "Star",
      pressed: false,
    });
    // Hue is not a state a colour-blind member can read, so the glyph carries
    // the state too: hollow here, filled once starred.
    expect(unstarredButton.querySelector("svg")).toHaveAttribute(
      "fill",
      "none",
    );

    rerender(
      <ChatImageViewer
        photos={starredPhotos}
        startIndex={0}
        onClose={vi.fn()}
        onToggleStar={vi.fn()}
      />,
    );
    const starredButton = screen.getByRole("button", {
      name: "Star",
      pressed: true,
    });
    expect(starredButton.querySelector("svg")).toHaveAttribute(
      "fill",
      "currentColor",
    );
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
