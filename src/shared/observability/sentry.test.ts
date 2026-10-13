import { describe, expect, it } from "vitest";
import { dropStudioPlayBreadcrumb } from "./sentry";

describe("dropStudioPlayBreadcrumb", () => {
  it("drops a fetch breadcrumb for a track stream URL", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: { url: "/v1/studio/tracks/abc/stream", method: "GET" },
      }),
    ).toBeNull();
  });

  it("drops a breadcrumb for a release URL", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "xhr",
        data: { url: "https://api.example.com/v1/studio/releases/r1" },
      }),
    ).toBeNull();
  });

  it("drops a navigation breadcrumb whose message or target names a track", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "navigation",
        message: "/studio/tracks/abc",
      }),
    ).toBeNull();
    expect(
      dropStudioPlayBreadcrumb({
        category: "navigation",
        data: { from: "/studio", to: "/studio/tracks/abc" },
      }),
    ).toBeNull();
  });

  it("keeps every other breadcrumb unchanged", () => {
    const fetchCrumb = {
      category: "fetch",
      data: { url: "/v1/feed", method: "GET" },
    };
    const clickCrumb = { category: "ui.click", message: "button.save" };
    expect(dropStudioPlayBreadcrumb(fetchCrumb)).toBe(fetchCrumb);
    expect(dropStudioPlayBreadcrumb(clickCrumb)).toBe(clickCrumb);
  });
});
