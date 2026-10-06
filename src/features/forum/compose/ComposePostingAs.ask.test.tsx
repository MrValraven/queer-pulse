import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ComposePostingAs } from "./ComposePostingAs";
import type { PostKind } from "./composeThread.types";

function renderPostingAs(kind: PostKind | null) {
  render(
    <TestProviders>
      <ComposePostingAs
        author={{ name: "Inês T", initials: "IT" }}
        canPostAsOfficial={false}
        isOfficial={false}
        onOfficialChange={vi.fn()}
        isAnonymous={false}
        onAnonymousChange={vi.fn()}
        category="funding"
        kind={kind}
        coAuthorSlug={null}
        coAuthor={null}
        onCoAuthorChange={vi.fn()}
      />
    </TestProviders>,
  );
}

describe("ComposePostingAs and a fundraiser", () => {
  it("keeps the name on a fundraiser and says why", () => {
    renderPostingAs("ask");
    expect(
      screen.getByRole("switch", { name: "Post without my name" }),
    ).toBeDisabled();
    expect(
      screen.getByText(
        "Fundraisers always carry your name, so donors know who they're trusting.",
      ),
    ).toBeInTheDocument();
  });

  it("still offers anonymity on an open call in the same category", () => {
    renderPostingAs("call");
    expect(
      screen.getByRole("switch", { name: "Post without my name" }),
    ).toBeEnabled();
  });
});
