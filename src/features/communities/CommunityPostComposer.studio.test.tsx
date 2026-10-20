import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CommunityPostComposer } from "./CommunityPostComposer";
import { usePostImageAttach } from "./usePostImageAttach";

vi.mock("../studio/share/LazyStudioShareCard", () => ({
  LazyStudioShareCard: ({
    surface,
    onRemove,
  }: {
    surface: string;
    onRemove?: () => void;
  }) => (
    <div data-testid="studio-card" data-surface={surface}>
      <button type="button" onClick={onRemove}>
        remove card
      </button>
    </div>
  ),
}));

const TRACK_URL =
  "https://queerpulse.com/studio/track?id=3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";

function Composer() {
  const [draft, setDraft] = useState("");
  const attach = usePostImageAttach();
  return (
    <>
      <CommunityPostComposer
        viewer={null}
        className={undefined}
        textareaClassName={undefined}
        placeholder="Share something with the community"
        value={draft}
        onChange={setDraft}
        onSubmit={() => {}}
        submitLabel="Share"
        attach={attach}
      />
      <output data-testid="draft">{draft}</output>
    </>
  );
}

describe("CommunityPostComposer with a pasted Studio link", () => {
  it("previews the card and removing it strips the link from the draft", () => {
    render(
      <TestProviders>
        <Composer />
      </TestProviders>,
    );
    fireEvent.change(
      screen.getByLabelText("Share something with the community"),
      { target: { value: `this one\n\n${TRACK_URL}` } },
    );
    expect(screen.getByTestId("studio-card")).toHaveAttribute(
      "data-surface",
      "composer",
    );
    fireEvent.click(screen.getByRole("button", { name: "remove card" }));
    expect(screen.getByTestId("draft")).toHaveTextContent(/^this one$/);
  });
});
