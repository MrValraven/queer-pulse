import { describe, expect, it } from "vitest";
import { dropStudioPlayBreadcrumb } from "./sentry";

describe("dropStudioPlayBreadcrumb on the leads pages", () => {
  it("drops clicks, inputs and console lines on the leads pages", () => {
    const startPath = window.location.pathname;
    try {
      for (const path of ["/admin/leads", "/admin/leads/demo-lead-cave-23"]) {
        window.history.pushState(null, "", path);
        expect(
          dropStudioPlayBreadcrumb({
            category: "ui.click",
            message: 'a[aria-label="Open Cave 23"]',
          }),
        ).toBeNull();
        expect(
          dropStudioPlayBreadcrumb({
            category: "ui.input",
            message: "input[name=email]",
          }),
        ).toBeNull();
        expect(
          dropStudioPlayBreadcrumb({
            category: "console",
            message: "lead saved",
          }),
        ).toBeNull();
      }
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });

  it("drops fetch and navigation breadcrumbs that name a lead", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: { url: "https://api.example/v1/admin/leads?q=cave" },
      }),
    ).toBeNull();
    expect(
      dropStudioPlayBreadcrumb({
        category: "navigation",
        data: { to: "/admin/leads/demo-lead-cave-23" },
      }),
    ).toBeNull();
  });

  it("keeps clicks elsewhere in admin", () => {
    const startPath = window.location.pathname;
    try {
      window.history.pushState(null, "", "/admin/music-events");
      expect(
        dropStudioPlayBreadcrumb({ category: "ui.click", message: "button" }),
      ).not.toBeNull();
      window.history.pushState(null, "", "/admin/leads-archive");
      expect(
        dropStudioPlayBreadcrumb({ category: "ui.click", message: "button" }),
      ).not.toBeNull();
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });
});
