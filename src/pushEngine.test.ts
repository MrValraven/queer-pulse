import { describe, expect, it } from "vitest";
import { isWebKitPushEngine } from "./pushEngine";

describe("isWebKitPushEngine", () => {
  it("is true for an iPhone Home Screen web app user agent without Safari", () => {
    expect(
      isWebKitPushEngine(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      ),
    ).toBe(true);
  });

  it("is true for iPhone Safari", () => {
    expect(
      isWebKitPushEngine(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(true);
  });

  it("is true for iPhone Chrome (CriOS), which runs on WebKit", () => {
    expect(
      isWebKitPushEngine(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/137.0.7151.79 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(true);
  });

  it("is true for the Mac Safari user agent iPadOS reports in desktop mode", () => {
    expect(
      isWebKitPushEngine(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      ),
    ).toBe(true);
  });

  it("is true for macOS Safari", () => {
    expect(
      isWebKitPushEngine(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
      ),
    ).toBe(true);
  });

  it("is false for desktop Chrome", () => {
    expect(
      isWebKitPushEngine(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
      ),
    ).toBe(false);
  });

  it("is false for Android Chrome", () => {
    expect(
      isWebKitPushEngine(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
      ),
    ).toBe(false);
  });

  it("is false for desktop Edge", () => {
    expect(
      isWebKitPushEngine(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0",
      ),
    ).toBe(false);
  });

  it("is false for desktop Firefox, which has no AppleWebKit token", () => {
    expect(
      isWebKitPushEngine(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0",
      ),
    ).toBe(false);
  });

  it("is false for an empty user agent", () => {
    expect(isWebKitPushEngine("")).toBe(false);
  });
});
