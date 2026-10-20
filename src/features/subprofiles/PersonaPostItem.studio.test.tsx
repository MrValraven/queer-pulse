import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { PersonaPostView } from "./api/personaPosts.adapters";
import { PersonaPostItem } from "./PersonaPostItem";

vi.mock("../studio/share/LazyStudioShareCard", () => ({
  LazyStudioShareCard: ({
    target,
    surface,
  }: {
    target: { kind: string };
    surface: string;
  }) => (
    <div
      data-testid="studio-card"
      data-kind={target.kind}
      data-surface={surface}
    />
  ),
}));

const RELEASE_URL =
  "https://queerpulse.com/studio/album?id=3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";

const releasePost: PersonaPostView = {
  id: "post-release",
  body: "it's all up now",
  linkUrl: RELEASE_URL,
  link: { href: RELEASE_URL, host: "queerpulse.com" },
  imageUrl: null,
  createdAt: new Date().toISOString(),
  editedAt: null,
  isEdited: false,
  canEdit: false,
};

function renderItem(isInteractive: boolean) {
  return render(
    <TestProviders>
      <PersonaPostItem
        post={releasePost}
        subprofileId="sp-1"
        isInteractive={isInteractive}
        isEditing={false}
        menuItems={[]}
        onEditDone={() => {}}
      />
    </TestProviders>,
  );
}

describe("PersonaPostItem with a Studio link", () => {
  it("shows the Studio card and no host link card", () => {
    renderItem(true);
    expect(screen.getByTestId("studio-card")).toHaveAttribute(
      "data-kind",
      "release",
    );
    expect(screen.queryByText("queerpulse.com")).toBeNull();
    expect(screen.getByText("it's all up now")).toBeInTheDocument();
  });

  it("makes the card inert in the editor preview", () => {
    renderItem(false);
    expect(screen.getByTestId("studio-card").parentElement).toHaveAttribute(
      "inert",
    );
  });
});
