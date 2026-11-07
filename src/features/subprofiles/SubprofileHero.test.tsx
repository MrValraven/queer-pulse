import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SubprofileHero } from "./SubprofileHero";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import { awaitCatalog } from "../../test/awaitCatalog";

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
    sections: [],
    endorsementCount: 0,
    followerCount: 0,
    viewerEndorsed: false,
    viewerFollowing: false,
    viewerIsMember: false,
    ...overrides,
  } as PublicSubprofileView;
}

async function metaLine(view: PublicSubprofileView) {
  const { container } = render(
    <TestProviders>
      <SubprofileHero view={view} mode="preview" onAction={() => {}} />
    </TestProviders>,
  );
  await awaitCatalog("subprofiles");
  return container.querySelector(".pp-meta")?.textContent ?? "";
}

describe("SubprofileHero engagement counts (N1)", () => {
  it("drops the zero counts on a members-only persona, which takes no follows or endorsements", async () => {
    const text = await metaLine(makeView({ visibility: "network" }));
    expect(text).not.toMatch(/endorsement/);
    expect(text).not.toMatch(/follower/);
  });

  it("keeps the counts a members-only persona already holds", async () => {
    const text = await metaLine(
      makeView({
        visibility: "network",
        endorsementCount: 3,
        followerCount: 2,
      }),
    );
    expect(text).toMatch(/3 endorsements/);
    expect(text).toMatch(/2 followers/);
  });

  // Every skin leaves a zero count out (PersonaEngagementCounts), so a count
  // above zero stands alone with no separator left behind.
  it("shows only the counts above zero on an open persona", async () => {
    const text = await metaLine(makeView({ followerCount: 14 }));
    expect(text).not.toMatch(/endorsement/);
    expect(text).toMatch(/14 followers/);
  });

  it("drops both zero counts on an open persona", async () => {
    const text = await metaLine(makeView());
    expect(text).not.toMatch(/endorsement/);
    expect(text).not.toMatch(/follower/);
  });
});
