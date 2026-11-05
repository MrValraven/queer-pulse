import { describe, expect, it } from "vitest";
import { dropStudioPlayBreadcrumb } from "./sentry";

describe("dropStudioPlayBreadcrumb on the VJ pages", () => {
  it("drops clicks, inputs and console lines on every VJ page", () => {
    const startPath = window.location.pathname;
    try {
      for (const path of [
        "/admin/vj",
        "/admin/vj/screen",
        "/admin/vj/remote",
      ]) {
        window.history.pushState(null, "", path);
        expect(
          dropStudioPlayBreadcrumb({
            category: "ui.click",
            message: 'button[aria-label="Edit Neon grid"]',
          }),
        ).toBeNull();
        expect(
          dropStudioPlayBreadcrumb({
            category: "ui.input",
            message: "input[name=packName]",
          }),
        ).toBeNull();
        expect(
          dropStudioPlayBreadcrumb({
            category: "console",
            message: "clip saved",
          }),
        ).toBeNull();
      }
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });

  it("drops API, file and bucket breadcrumbs that name VJ media", () => {
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: { url: "https://api.example/v1/admin/vj/packs/abc/media" },
      }),
    ).toBeNull();
    expect(
      dropStudioPlayBreadcrumb({
        category: "fetch",
        data: { url: "https://api.example/files/vj-thumbnails/u/u.webp" },
      }),
    ).toBeNull();
    expect(
      dropStudioPlayBreadcrumb({
        category: "xhr",
        data: {
          url: "https://bucket.example/vj-clips/u/u.mp4?X-Amz-Signature=x",
        },
      }),
    ).toBeNull();
  });

  it("keeps clicks elsewhere in admin", () => {
    const startPath = window.location.pathname;
    try {
      window.history.pushState(null, "", "/admin/media");
      expect(
        dropStudioPlayBreadcrumb({ category: "ui.click", message: "button" }),
      ).not.toBeNull();
    } finally {
      window.history.pushState(null, "", startPath);
    }
  });
});
