import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ChatImageViewerFilmstrip } from "./ChatImageViewerFilmstrip";
import type { ViewerPhoto } from "./useThreadImageGallery";

/** Matches the CSS-module class whatever the bundler hashed it to. Vitest runs
 *  with `css: false`, so the module's exports are stand-ins rather than the
 *  real names, and matching on the readable half is what survives both. */
const HIDDEN_CLASS = /filmstripHidden/;

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
  {
    message: { from: "them", text: "A cat waving", kind: "gif", id: "m3" },
    url: "https://cdn.example/three.gif",
    width: 480,
    height: 480,
    senderName: "Nadia",
    dayLabel: "Today",
    timeLabel: "14:40",
    key: "m3",
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
);

/**
 * Swap `Element.prototype.scrollIntoView` for the length of one test, and hand
 * back the undo. Goes through property descriptors rather than plain assignment
 * so that removing the method entirely (`undefined`) and restoring whatever
 * src/test/setup.ts installed are the same operation, and so reading the
 * original never detaches a method from its object.
 */
function replaceScrollIntoView(
  replacement: ((options?: ScrollIntoViewOptions) => void) | undefined,
): () => void {
  const original = Object.getOwnPropertyDescriptor(
    Element.prototype,
    "scrollIntoView",
  );
  if (replacement) {
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      value: replacement,
      configurable: true,
      writable: true,
    });
  } else {
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  }
  return () => {
    if (original) {
      Object.defineProperty(Element.prototype, "scrollIntoView", original);
    } else {
      delete (Element.prototype as Partial<Element>).scrollIntoView;
    }
  };
}

describe("ChatImageViewerFilmstrip", () => {
  it("renders one thumbnail per photo and marks the one on stage", () => {
    render(
      <ChatImageViewerFilmstrip
        photos={photos}
        index={1}
        isChromeVisible
        onSelect={vi.fn()}
      />,
      { wrapper },
    );
    const thumbs = screen.getAllByRole("button");
    expect(thumbs).toHaveLength(3);
    // `aria-current` on the one on stage, and the attribute ABSENT on the rest
    // rather than written as "false": nothing here is selected, one photo is
    // currently displayed.
    expect(thumbs[1]).toHaveAttribute("aria-current", "true");
    expect(thumbs[0]).not.toHaveAttribute("aria-current");
    expect(thumbs[2]).not.toHaveAttribute("aria-current");
  });

  it("names each thumbnail by its position and its sender", async () => {
    render(
      <ChatImageViewerFilmstrip
        photos={photos}
        index={0}
        isChromeVisible
        onSelect={vi.fn()}
      />,
      { wrapper },
    );
    // Awaited, not immediate: `messages` is a lazy i18n namespace, so the first
    // render paints raw keys and the real strings arrive a tick later.
    expect(
      await screen.findByRole("button", { name: "Photo 1 of 3, from Nadia" }),
    ).toBeInTheDocument();
  });

  it("reports the index of the thumbnail that was clicked", async () => {
    const onSelect = vi.fn();
    render(
      <ChatImageViewerFilmstrip
        photos={photos}
        index={0}
        isChromeVisible
        onSelect={onSelect}
      />,
      { wrapper },
    );
    const [, , lastThumb] = screen.getAllByRole("button");
    if (!lastThumb) throw new Error("expected three thumbnails");
    await userEvent.click(lastThumb);
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("renders nothing for a single-photo gallery", () => {
    const { container } = render(
      <ChatImageViewerFilmstrip
        photos={photos.slice(0, 1)}
        index={0}
        isChromeVisible
        onSelect={vi.fn()}
      />,
      { wrapper },
    );
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });

  it("badges the GIF and only the GIF", async () => {
    render(
      <ChatImageViewerFilmstrip
        photos={photos}
        index={0}
        isChromeVisible
        onSelect={vi.fn()}
      />,
      { wrapper },
    );
    const badge = await screen.findByText("GIF");
    expect(screen.getAllByText("GIF")).toHaveLength(1);
    // The badge belongs to the third thumbnail, the one whose message is a GIF.
    const [, , lastThumb] = screen.getAllByRole("button");
    expect(lastThumb).toContainElement(badge);
  });

  it("carries the hidden class while the chrome is away", () => {
    const { rerender } = render(
      <ChatImageViewerFilmstrip
        photos={photos}
        index={0}
        isChromeVisible
        onSelect={vi.fn()}
      />,
      { wrapper },
    );
    const strip = screen.getByRole("group").parentElement;
    expect(strip).not.toHaveClass(HIDDEN_CLASS);

    rerender(
      <I18nProvider>
        <ChatImageViewerFilmstrip
          photos={photos}
          index={0}
          isChromeVisible={false}
          onSelect={vi.fn()}
        />
      </I18nProvider>,
    );
    expect(screen.getByRole("group").parentElement).toHaveClass(HIDDEN_CLASS);
  });

  it("leaves the thumbnails decorative, so a screen reader reads the button once", () => {
    render(
      <ChatImageViewerFilmstrip
        photos={photos}
        index={0}
        isChromeVisible
        onSelect={vi.fn()}
      />,
      { wrapper },
    );
    // Every <img> carries alt="", so none of them surfaces as an image role.
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });

  it("survives a browser with no scrollIntoView", () => {
    // jsdom has no layout engine and ships no `scrollIntoView`; src/test/setup.ts
    // stubs it for the suite, so it is removed here to prove the component's own
    // guard holds rather than leaning on that stub.
    const restoreScrollIntoView = replaceScrollIntoView(undefined);
    try {
      expect(() =>
        render(
          <ChatImageViewerFilmstrip
            photos={photos}
            index={2}
            isChromeVisible
            onSelect={vi.fn()}
          />,
          { wrapper },
        ),
      ).not.toThrow();
    } finally {
      restoreScrollIntoView();
    }
  });

  it("centres the thumbnail on stage when the gallery pages", () => {
    const scrollIntoView = vi.fn();
    const restoreScrollIntoView = replaceScrollIntoView(scrollIntoView);
    try {
      const { rerender } = render(
        <ChatImageViewerFilmstrip
          photos={photos}
          index={0}
          isChromeVisible
          onSelect={vi.fn()}
        />,
        { wrapper },
      );
      scrollIntoView.mockClear();
      rerender(
        <I18nProvider>
          <ChatImageViewerFilmstrip
            photos={photos}
            index={2}
            isChromeVisible
            onSelect={vi.fn()}
          />
        </I18nProvider>,
      );
      expect(scrollIntoView).toHaveBeenCalledWith({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
    } finally {
      restoreScrollIntoView();
    }
  });
});
