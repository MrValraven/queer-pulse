import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { ChatMessage } from "./data";
import { MessageBubbleBody } from "./MessageBubbleBody";

const useLinkPreview = vi.fn((url: string | null) => {
  void url;
  return { data: undefined, isLoading: false };
});
vi.mock("./api/useLinkPreview", () => ({
  useLinkPreview: (url: string | null) => useLinkPreview(url),
  hasPreviewContent: () => false,
}));
vi.mock("../studio/share/LazyStudioShareCard", () => ({
  LazyStudioShareCard: ({
    target,
  }: {
    target: { kind: string; id: string };
  }) => <div data-testid="studio-card">{`${target.kind}:${target.id}`}</div>,
}));

const URL =
  "https://queerpulse.com/studio/track?id=3f2b8c1e-4d5a-4b6c-8e9f-0a1b2c3d4e5f";
const labelIds = { sender: "s", content: "c", caption: "cap", details: "d" };

beforeEach(() => useLinkPreview.mockClear());

function renderBubble(text: string) {
  const message: ChatMessage = { id: "m1", from: "them", text, time: "10:00" };
  return render(
    <TestProviders>
      <MessageBubbleBody
        message={message}
        index={0}
        lastIndex={0}
        isSent={false}
        isLast
        senderName="Priya"
        metaStatus={null}
        labelIds={labelIds}
      />
    </TestProviders>,
  );
}

describe("a message carrying a Studio link", () => {
  it("renders the card with the note as its caption and hides the URL", () => {
    renderBubble(`ouve isto\n${URL}`);
    expect(screen.getByTestId("studio-card")).toHaveTextContent(
      "track:3f2b8c1e-4d5a-4b6c-8e9f-0a1b2c3d4e5f",
    );
    expect(screen.getByText("ouve isto")).toBeInTheDocument();
    expect(screen.queryByText(/queerpulse\.com/)).toBeNull();
    expect(useLinkPreview).not.toHaveBeenCalledWith(URL);
  });

  it("names the Studio kind and the note in the bubble's label", () => {
    const { container } = renderBubble(`ouve isto\n${URL}`);
    const label = container.querySelector('[id="c"]');
    expect(label).toHaveAttribute("hidden");
    expect(label).toHaveTextContent("Studio track: ouve isto");
  });

  it("renders the card alone for a link-only share", () => {
    const { container } = renderBubble(URL);
    expect(screen.getByTestId("studio-card")).toBeInTheDocument();
    const label = container.querySelector('[id="c"]');
    expect(label).toHaveAttribute("hidden");
    expect(label).toHaveTextContent("Studio track");
  });

  it("keeps a bare www Studio link as its text", () => {
    renderBubble(
      "www.queerpulse.com/studio/track?id=3f2b8c1e-4d5a-4b6c-8e9f-0a1b2c3d4e5f",
    );
    expect(screen.queryByTestId("studio-card")).toBeNull();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://www.queerpulse.com/studio/track?id=3f2b8c1e-4d5a-4b6c-8e9f-0a1b2c3d4e5f",
    );
  });

  it("keeps an artist link as plain text", () => {
    renderBubble("https://queerpulse.com/studio/artist?id=p1");
    expect(screen.queryByTestId("studio-card")).toBeNull();
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
