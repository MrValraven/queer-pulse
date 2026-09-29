import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CommunityGuidelinesNote } from "./CommunityGuidelinesNote";

function renderNote(
  props: Partial<ComponentProps<typeof CommunityGuidelinesNote>> = {},
) {
  return render(
    <TestProviders>
      <CommunityGuidelinesNote
        communityName="Trans Joy"
        rules={[]}
        inheritedRules={null}
        parentName={null}
        variant="reports"
        {...props}
      />
    </TestProviders>,
  );
}

describe("CommunityGuidelinesNote", () => {
  it("renders a community's own rules as a numbered list", async () => {
    renderNote({ rules: ["Be kind to strangers", "No outside links"] });

    // i18n catalogs load lazily, so the first assertion needs findBy*.
    expect(
      await screen.findByText("Measured against Trans Joy's shared values"),
    ).toBeInTheDocument();
    expect(screen.getByText("Be kind to strangers")).toBeInTheDocument();
    expect(screen.getByText("No outside links")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows a space's inherited rules first, then its own additions", async () => {
    renderNote({
      rules: ["No off-topic posts in this space"],
      inheritedRules: {
        rules: ["Follow the platform's community guidelines"],
        rulesVersion: 1,
      },
      parentName: "Trans Joy",
    });

    expect(await screen.findByText("From Trans Joy")).toBeInTheDocument();
    const parentRule = screen.getByText(
      "Follow the platform's community guidelines",
    );
    const spaceAddsLabel = screen.getByText("This space adds");
    const ownRule = screen.getByText("No off-topic posts in this space");

    // DOCUMENT_POSITION_FOLLOWING (4) means the left node comes before the
    // right node, so the parent's rules read ahead of the space's own.
    expect(
      parentRule.compareDocumentPosition(spaceAddsLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      spaceAddsLabel.compareDocumentPosition(ownRule) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("omits the from-parent label when a space's parent has no rules of its own", async () => {
    renderNote({
      rules: ["No off-topic posts in this space"],
      inheritedRules: { rules: [], rulesVersion: 1 },
      parentName: "Trans Joy",
    });

    expect(
      await screen.findByText("No off-topic posts in this space"),
    ).toBeInTheDocument();
    expect(screen.getByText("This space adds")).toBeInTheDocument();
    expect(screen.queryByText("From Trans Joy")).not.toBeInTheDocument();
  });

  it("omits the space-adds label when a space has not added anything of its own", async () => {
    renderNote({
      rules: [],
      inheritedRules: {
        rules: ["Follow the platform's community guidelines"],
        rulesVersion: 1,
      },
      parentName: "Trans Joy",
    });

    expect(await screen.findByText("From Trans Joy")).toBeInTheDocument();
    expect(
      screen.getByText("Follow the platform's community guidelines"),
    ).toBeInTheDocument();
    expect(screen.queryByText("This space adds")).not.toBeInTheDocument();
  });

  it("shows the empty-state copy when the community has not written any shared values", async () => {
    renderNote({ rules: [], inheritedRules: null });

    expect(
      await screen.findByText(
        "Trans Joy hasn't written its shared values yet. The owner can add them from Edit community.",
      ),
    ).toBeInTheDocument();
  });
});
