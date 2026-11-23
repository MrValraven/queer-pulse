import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { routes } from "../../app/routeMap";
import { MessageBubbleBody } from "./MessageBubbleBody";
import type { MessageLinkCardState } from "./api/useMessageLinkCard";
import type { ChatMessage } from "./data";

interface StrangerLinkMockState {
  isPendingConnection: boolean;
  linkCardUrls: (string | null)[];
}

const mockState = vi.hoisted((): StrangerLinkMockState => ({
  isPendingConnection: false,
  linkCardUrls: [],
}));

vi.mock("./MessageSafetyContext", () => ({
  useMessageSafetyContext: () => ({
    isPendingConnection: mockState.isPendingConnection,
  }),
}));

vi.mock("./api/useMessageLinkCard", () => ({
  useMessageLinkCard: (url: string | null): MessageLinkCardState => {
    mockState.linkCardUrls.push(url);
    return {
      studioTarget: null,
      placeSlug: null,
      place: undefined,
      ogPreview: undefined,
      isLoading: false,
      hasContent: false,
    };
  },
}));

const EXTERNAL_URL = "https://tracker.example/page";

function renderBubble(text: string, isSent: boolean) {
  const message: ChatMessage = {
    id: "message-1",
    from: isSent ? "me" : "them",
    text,
  };
  return render(
    <TestProviders>
      <MessageBubbleBody
        message={message}
        index={0}
        lastIndex={0}
        isSent={isSent}
        isLast
        senderName="Ana"
        metaStatus={null}
        labelIds={{
          sender: "sender",
          content: "content",
          caption: "caption",
          details: "details",
        }}
      />
    </TestProviders>,
  );
}

beforeEach(() => {
  mockState.isPendingConnection = false;
  mockState.linkCardUrls = [];
});

describe("MessageBubbleBody: a stranger's link (SEC-23)", () => {
  it("never unfurls an external link a stranger sent, and keeps it in the text", () => {
    mockState.isPendingConnection = true;

    const { container } = renderBubble(`look ${EXTERNAL_URL}`, false);

    expect(mockState.linkCardUrls.length).toBeGreaterThan(0);
    expect(mockState.linkCardUrls).not.toContain(EXTERNAL_URL);
    expect(mockState.linkCardUrls.every((url) => url === null)).toBe(true);
    expect(container.querySelector(`a[href="${EXTERNAL_URL}"]`)).not.toBeNull();
  });

  it("still unfurls the viewer's own link in a pending thread", () => {
    mockState.isPendingConnection = true;

    renderBubble(`look ${EXTERNAL_URL}`, true);

    expect(mockState.linkCardUrls).toContain(EXTERNAL_URL);
  });

  it("unfurls an external link once the two are connected", () => {
    renderBubble(`look ${EXTERNAL_URL}`, false);

    expect(mockState.linkCardUrls).toContain(EXTERNAL_URL);
  });

  it("keeps the card for a QueerPulse place link from a stranger", () => {
    mockState.isPendingConnection = true;
    const placeUrl = `${window.location.origin}${routes.directory}/casa-bonita`;

    renderBubble(`meet here ${placeUrl}`, false);

    expect(mockState.linkCardUrls).toContain(placeUrl);
  });
});
