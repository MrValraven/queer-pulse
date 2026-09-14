import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ChatImageViewerProvider,
  useChatImageViewer,
} from "./ChatImageViewerContext";
import type { ChatMessage } from "./data";

const message: ChatMessage = { from: "me", text: "Photo" };

function Consumer() {
  const { openImage } = useChatImageViewer();
  return (
    <button type="button" onClick={() => openImage(message)}>
      open
    </button>
  );
}

describe("ChatImageViewerContext", () => {
  it("hands the message to the provider's openImage", async () => {
    const openImage = vi.fn();
    render(
      <ChatImageViewerProvider openImage={openImage}>
        <Consumer />
      </ChatImageViewerProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "open" }));
    expect(openImage).toHaveBeenCalledWith(message);
  });

  it("is inert with no provider, so a bubble renders fine outside a panel", async () => {
    render(<Consumer />);
    await userEvent.click(screen.getByRole("button", { name: "open" }));
    expect(screen.getByRole("button", { name: "open" })).toBeInTheDocument();
  });
});
