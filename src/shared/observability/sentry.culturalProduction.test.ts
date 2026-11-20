import { describe, expect, it } from "vitest";
import { dropStudioPlayBreadcrumb } from "./sentry";

describe("dropStudioPlayBreadcrumb on the Cultural Production page", () => {
  it("drops a breadcrumb naming a cultural production request", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: {
          url: "https://api.example/v1/admin/cultural-production/ideas?q=zine",
        },
      }),
    ).toBeNull();
    expect(
      dropStudioPlayBreadcrumb({
        category: "navigation",
        data: { to: "/admin/cultural-production" },
      }),
    ).toBeNull();
  });

  it("drops ui and console breadcrumbs on the page", () => {
    const startPath = window.location.pathname;
    try {
      window.history.pushState(null, "", "/admin/cultural-production");
      expect(
        dropStudioPlayBreadcrumb({
          category: "ui.click",
          message: 'button[aria-label="Open Zine night"]',
        }),
      ).toBeNull();
      expect(
        dropStudioPlayBreadcrumb({
          category: "ui.input",
          message: "textarea[name=comment]",
        }),
      ).toBeNull();
      expect(
        dropStudioPlayBreadcrumb({
          category: "console",
          message: "idea saved",
        }),
      ).toBeNull();
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });

  it("keeps a breadcrumb for another admin page", () => {
    const startPath = window.location.pathname;
    try {
      window.history.pushState(null, "", "/admin/music-events");
      expect(
        dropStudioPlayBreadcrumb({ category: "ui.click", message: "button" }),
      ).not.toBeNull();
      window.history.pushState(null, "", "/admin/cultural-productions");
      expect(
        dropStudioPlayBreadcrumb({ category: "ui.click", message: "button" }),
      ).not.toBeNull();
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });
});
