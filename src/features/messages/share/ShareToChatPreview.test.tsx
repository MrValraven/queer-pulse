import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ShareToChatPreview } from "./ShareToChatPreview";

vi.mock("../api/useLinkPreview", () => ({
  useLinkPreview: () => ({ data: undefined, isLoading: false }),
  hasPreviewContent: () => false,
}));
vi.mock("../../studio/share/LazyStudioShareCard", () => ({
  LazyStudioShareCard: ({
    target,
  }: {
    target: { kind: string; id: string };
  }) => <div data-testid="studio-card">{`${target.kind}:${target.id}`}</div>,
}));

const PLAYLIST_URL =
  "https://queerpulse.com/studio/collection?id=3f2b8c1e-4d5a-4b6c-8e9f-0a1b2c3d4e5f";

describe("ShareToChatPreview with a Studio link", () => {
  it("shows the live card with the note under it and hides the URL", () => {
    render(
      <TestProviders>
        <ShareToChatPreview
          recipients={[]}
          body={`para a viagem\n${PLAYLIST_URL}`}
        />
      </TestProviders>,
    );
    expect(screen.getByTestId("studio-card")).toHaveTextContent(
      "playlist:3f2b8c1e-4d5a-4b6c-8e9f-0a1b2c3d4e5f",
    );
    expect(screen.getByText("para a viagem")).toBeInTheDocument();
    expect(screen.queryByText(/queerpulse\.com/)).toBeNull();
  });
});
