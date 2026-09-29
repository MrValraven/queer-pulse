import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SubprofileHero } from "./SubprofileHero";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

/** Just enough of a public persona for the hero in `preview` mode, which
 *  mounts no mutating widget. */
function makeView(
  overrides: Partial<PublicSubprofileView> = {},
): PublicSubprofileView {
  return {
    id: "sp-test",
    kind: "developer",
    displayName: "Afterhours",
    slug: "afterhours",
    handle: "afterhours",
    linkVisibility: "unlinked",
    visibility: "open",
    status: "published",
    socialLinks: [],
    endorsementCount: 0,
    followerCount: 0,
    viewerEndorsed: false,
    viewerFollowing: false,
    viewerIsMember: false,
    ...overrides,
  } as PublicSubprofileView;
}

function metaLine(view: PublicSubprofileView) {
  const { container } = render(
    <TestProviders>
      <SubprofileHero view={view} mode="preview" onAction={() => {}} />
    </TestProviders>,
  );
  return container.querySelector(".pp-meta")?.textContent ?? "";
}

describe("SubprofileHero engagement counts (N1)", () => {
  it("drops the zero counts on a members-only persona, which takes no follows or endorsements", () => {
    const text = metaLine(makeView({ visibility: "network" }));
    expect(text).not.toMatch(/endorsement/);
    expect(text).not.toMatch(/follower/);
  });

  it("keeps the counts a members-only persona already holds", () => {
    const text = metaLine(
      makeView({ visibility: "network", endorsementCount: 3 }),
    );
    expect(text).toMatch(/endorsement/);
    expect(text).toMatch(/follower/);
  });

  it("keeps zero counts on an open persona, where a visitor can move them", () => {
    const text = metaLine(makeView());
    expect(text).toMatch(/endorsement/);
    expect(text).toMatch(/follower/);
  });
});
