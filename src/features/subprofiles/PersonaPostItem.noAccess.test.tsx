import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { PersonaPostItem } from "./PersonaPostItem";

vi.mock("../studio/api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: "denied",
    hasAccess: false,
    isPending: false,
    uploadablePersonas: [],
  }),
}));

const RELEASE_URL =
  "https://queerpulse.com/studio/album?id=3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";

describe("PersonaPostItem for a reader without Studio access", () => {
  it("shows the quiet card with no play control and no title", async () => {
    render(
      <TestProviders>
        <PersonaPostItem
          post={{
            id: "post-release",
            body: "it's all up now",
            linkUrl: RELEASE_URL,
            link: { href: RELEASE_URL, host: "queerpulse.com" },
            imageUrl: null,
            createdAt: new Date().toISOString(),
            editedAt: null,
            isEdited: false,
            canEdit: false,
          }}
          subprofileId="sp-1"
          isInteractive
          isEditing={false}
          menuItems={[]}
          onEditDone={() => {}}
        />
      </TestProviders>,
    );
    expect(await screen.findByText("it's all up now")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /play/i })).toBeNull();
    expect(screen.queryByText("queerpulse.com")).toBeNull();
  });
});
