import { describe, expect, it } from "vitest";
import { listingViewsFor } from "./adminListingViews";

describe("listingViewsFor", () => {
  it("offers Partners to an Admin", () => {
    expect(listingViewsFor({ role: "admin", isDemoMode: false })).toContain(
      "partners",
    );
  });

  it("hides Partners from a Moderator", () => {
    expect(
      listingViewsFor({ role: "moderator", isDemoMode: false }),
    ).not.toContain("partners");
  });

  it("hides Partners from a member holding the directory_moderator grant", () => {
    expect(listingViewsFor({ role: "member", isDemoMode: false })).toEqual([
      "queue",
      "editSuggestions",
      "claims",
    ]);
  });

  it("offers every view in demo mode", () => {
    expect(listingViewsFor({ role: null, isDemoMode: true })).toEqual([
      "queue",
      "editSuggestions",
      "claims",
      "drafts",
      "partners",
    ]);
  });

  it("hands each caller its own list", () => {
    const firstViews = listingViewsFor({ role: "admin", isDemoMode: false });
    firstViews.pop();
    expect(listingViewsFor({ role: "admin", isDemoMode: false })).toHaveLength(
      5,
    );
  });
});
