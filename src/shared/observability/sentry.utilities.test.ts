import { describe, expect, it } from "vitest";
import { dropStudioPlayBreadcrumb } from "./sentry";

describe("dropStudioPlayBreadcrumb on the staff utilities pages", () => {
  it("drops clicks, inputs and console lines on the PDF tool and the hub", () => {
    const startPath = window.location.pathname;
    try {
      for (const path of ["/admin/utilities/pdf", "/admin/utilities"]) {
        window.history.pushState(null, "", path);
        expect(
          dropStudioPlayBreadcrumb({
            category: "ui.click",
            message: 'button.tile[aria-label="Page 1, from contract.pdf"]',
          }),
        ).toBeNull();
        expect(
          dropStudioPlayBreadcrumb({
            category: "ui.input",
            message: "input[type=file]",
          }),
        ).toBeNull();
        expect(
          dropStudioPlayBreadcrumb({
            category: "console",
            message: "qpdf: /input.pdf",
          }),
        ).toBeNull();
      }
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });

  it("keeps navigation breadcrumbs there and clicks elsewhere in admin", () => {
    const startPath = window.location.pathname;
    try {
      window.history.pushState(null, "", "/admin/utilities/pdf");
      expect(
        dropStudioPlayBreadcrumb({
          category: "navigation",
          data: { from: "/admin", to: "/admin/utilities/pdf" },
        }),
      ).not.toBeNull();
      window.history.pushState(null, "", "/admin/utilities-archive");
      expect(
        dropStudioPlayBreadcrumb({ category: "ui.click", message: "button" }),
      ).not.toBeNull();
      window.history.pushState(null, "", "/admin/feature-usage");
      expect(
        dropStudioPlayBreadcrumb({ category: "ui.click", message: "button" }),
      ).not.toBeNull();
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });
});
