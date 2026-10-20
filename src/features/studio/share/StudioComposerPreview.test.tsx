import { useRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { StudioComposerPreview } from "./StudioComposerPreview";

vi.mock("./LazyStudioShareCard", () => ({
  LazyStudioShareCard: ({
    target,
    surface,
    onRemove,
  }: {
    target: { kind: string };
    surface: string;
    onRemove?: () => void;
  }) => (
    <div
      data-testid="studio-card"
      data-kind={target.kind}
      data-surface={surface}
    >
      {onRemove && (
        <button type="button" onClick={onRemove}>
          remove card
        </button>
      )}
    </div>
  ),
}));

const TRACK_URL =
  "https://queerpulse.com/studio/track?id=3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";

function Draft({
  initialText,
  isRemovable,
}: {
  initialText: string;
  isRemovable?: boolean;
}) {
  const [text, setText] = useState(initialText);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  return (
    <>
      <textarea
        ref={fieldRef}
        aria-label="draft field"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <StudioComposerPreview
        text={text}
        onTextChange={setText}
        fieldRef={fieldRef}
        isRemovable={isRemovable}
      />
      <output data-testid="draft">{text}</output>
    </>
  );
}

function renderDraft(initialText: string, isRemovable?: boolean) {
  render(
    <TestProviders>
      <Draft initialText={initialText} isRemovable={isRemovable} />
    </TestProviders>,
  );
}

describe("StudioComposerPreview", () => {
  it("shows no card for a draft without a Studio link", () => {
    renderDraft("see you Sunday");
    expect(screen.queryByTestId("studio-card")).toBeNull();
  });

  it("previews the card and the remove control strips the link", () => {
    renderDraft(`this one\n\n${TRACK_URL}`);
    const card = screen.getByTestId("studio-card");
    expect(card).toHaveAttribute("data-surface", "composer");
    expect(card).toHaveAttribute("data-kind", "track");
    fireEvent.click(screen.getByRole("button", { name: "remove card" }));
    expect(screen.getByTestId("draft")).toHaveTextContent(/^this one$/);
  });

  it("leaves the remove control off the card when isRemovable is false", () => {
    renderDraft(`this one\n\n${TRACK_URL}`, false);
    expect(screen.getByTestId("studio-card")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "remove card" })).toBeNull();
  });

  it("returns focus to the text field after the remove", () => {
    renderDraft(`this one\n\n${TRACK_URL}`);
    fireEvent.click(screen.getByRole("button", { name: "remove card" }));
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "draft field" }),
    );
  });

  it("leaves the label when the remove runs on a markdown draft", () => {
    renderDraft(`listen to [the EP](${TRACK_URL}) tonight`);
    fireEvent.click(screen.getByRole("button", { name: "remove card" }));
    expect(screen.getByTestId("draft")).toHaveTextContent(
      /^listen to the EP tonight$/,
    );
  });
});
