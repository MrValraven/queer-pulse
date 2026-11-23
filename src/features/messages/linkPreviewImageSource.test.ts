import { afterEach, describe, expect, it, vi } from "vitest";

const API_ORIGIN = "https://api.queerpulse.test";

/** Re-freezes `shared/api/config` against `apiUrl`, then loads the check. */
async function loadCheck(apiUrl: string) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", apiUrl);
  const module = await import("./linkPreviewImageSource");
  return module.isLoadableLinkPreviewImage;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isLoadableLinkPreviewImage (SEC-23)", () => {
  it("loads the API's own link preview image route", async () => {
    const isLoadable = await loadCheck(API_ORIGIN);

    expect(isLoadable(`${API_ORIGIN}/link-preview-images/abc.def`)).toBe(true);
  });

  it("refuses an image on the linked page's own host", async () => {
    const isLoadable = await loadCheck(API_ORIGIN);

    expect(isLoadable("https://tracker.example/pixel.png")).toBe(false);
    expect(
      isLoadable("https://tracker.example/link-preview-images/abc.def"),
    ).toBe(false);
  });

  it("refuses another path on the API origin", async () => {
    const isLoadable = await loadCheck(API_ORIGIN);

    expect(isLoadable(`${API_ORIGIN}/files/some-key`)).toBe(false);
  });

  it("loads the inline demo thumbnail and nothing when the value is empty", async () => {
    const isLoadable = await loadCheck(API_ORIGIN);

    expect(isLoadable("data:image/svg+xml;utf8,%3Csvg%2F%3E")).toBe(true);
    expect(isLoadable(null)).toBe(false);
    expect(isLoadable(undefined)).toBe(false);
    expect(isLoadable("")).toBe(false);
  });

  it("loads only the inline thumbnail in a build with no API", async () => {
    const isLoadable = await loadCheck("");

    expect(isLoadable(`${API_ORIGIN}/link-preview-images/abc.def`)).toBe(false);
    expect(isLoadable("data:image/png;base64,AAAA")).toBe(true);
  });
});
