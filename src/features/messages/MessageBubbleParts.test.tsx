import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { BubbleHiddenLabels, BubbleTrailingMarks } from "./MessageBubbleParts";
import type { ChatMessage } from "./data";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
);

/** Unique hidden-label ids per rendered bubble. */
function labelIdsFor(testId: string) {
  return {
    sender: `${testId}-sender`,
    content: `${testId}-content`,
    caption: `${testId}-caption`,
    details: `${testId}-details`,
  };
}

const editedAt = "2026-09-01T10:00:00Z";

function editedText(): ChatMessage {
  return { id: "text-1", from: "them", text: "See you at 8", editedAt };
}

/** A sticker a pre-fix edit left with body text and an `editedAt` stamp. */
function legacyEditedSticker(): ChatMessage {
  return {
    id: "sticker-1",
    from: "them",
    text: "Bi reverse",
    kind: "sticker",
    editedAt,
  };
}

function MarksAndLabels({
  message,
  testId,
}: {
  message: ChatMessage;
  testId: string;
}) {
  return (
    <div data-testid={testId}>
      <BubbleTrailingMarks message={message} />
      <BubbleHiddenLabels
        labelIds={labelIdsFor(testId)}
        senderName="Ana"
        message={message}
      />
    </div>
  );
}

describe("MessageBubbleParts: edited mark", () => {
  it("shows and announces the edited mark on an edited text message", async () => {
    render(<MarksAndLabels message={editedText()} testId="text" />, {
      wrapper,
    });
    // Waits for the lazy "messages" namespace to resolve, so the sticker
    // case below proves the mark is really absent.
    await waitFor(() => {
      expect(screen.getByTestId("text").textContent).toContain("· edited");
    });
    expect(
      document.getElementById(labelIdsFor("text").details)?.textContent,
    ).toContain("edited");
  });

  it("never shows or announces the edited mark on a legacy edited sticker", async () => {
    render(
      <>
        <MarksAndLabels message={editedText()} testId="text" />
        <MarksAndLabels message={legacyEditedSticker()} testId="sticker" />
      </>,
      { wrapper },
    );
    await waitFor(() => {
      expect(screen.getByTestId("text").textContent).toContain("· edited");
    });
    expect(screen.getByTestId("sticker").textContent).not.toContain("edited");
    expect(
      document.getElementById(labelIdsFor("sticker").details)?.textContent,
    ).not.toContain("edited");
  });
});
