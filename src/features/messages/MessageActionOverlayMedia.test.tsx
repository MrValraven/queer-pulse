import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { MessageActionOverlayMedia } from "./MessageActionOverlayMedia";
import type { ChatMessage } from "./data";

// SEC-24: the long-press clone of a GIF loads only from the GIF provider's
// hosts, the same rule `gifMediaHosts` sets for the bubble itself.
function gifMessage(url: string): ChatMessage {
  return {
    from: "them",
    text: "GIF",
    kind: "gif",
    attachment: {
      url,
      previewUrl: url,
      width: 200,
      height: 100,
      provider: "klipy",
    },
  };
}

function renderClone(message: ChatMessage) {
  return render(
    <TestProviders>
      <MessageActionOverlayMedia message={message} isSent={false} />
    </TestProviders>,
  );
}

describe("MessageActionOverlayMedia GIF clone", () => {
  it("names the refused source and fires no request for a GIF on another host", async () => {
    const { container } = renderClone(
      gifMessage("https://tracker.example/pixel.gif"),
    );

    expect(await screen.findByText("GIF unavailable")).toBeInTheDocument();
    expect(
      container.querySelector('img[src="https://tracker.example/pixel.gif"]'),
    ).toBeNull();
  });

  it("keeps the photo wording for an image with no url left", async () => {
    renderClone({ ...gifMessage(""), kind: "image", text: "Photo" });

    expect(
      await screen.findByText("Photo preview unavailable"),
    ).toBeInTheDocument();
    expect(screen.queryByText("GIF unavailable")).toBeNull();
  });

  it("renders a GIF from the GIF provider", () => {
    const { container } = renderClone(
      gifMessage("https://static.klipy.com/ii/abc/wave.gif"),
    );

    expect(
      container.querySelector(
        'img[src="https://static.klipy.com/ii/abc/wave.gif"]',
      ),
    ).not.toBeNull();
  });
});
