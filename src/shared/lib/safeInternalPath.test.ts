import { describe, expect, it } from "vitest";
import { safeInternalPath } from "./safeInternalPath";

// jsdom serves window.location.origin as http://localhost:3000 by default; the
// exact value does not matter, only that it is stable across the assertions.
const ORIGIN = window.location.origin;

describe("safeInternalPath", () => {
  it("passes a valid same-origin path with query and hash through unchanged", () => {
    expect(safeInternalPath("/feed?tab=x#y")).toBe("/feed?tab=x#y");
  });

  it("preserves a bare path", () => {
    expect(safeInternalPath("/messages")).toBe("/messages");
  });

  it("rejects a protocol-relative host (`//evil.com`)", () => {
    expect(safeInternalPath("//evil.com")).toBe("/feed");
  });

  it("rejects a backslash smuggle (`/\\evil.com`)", () => {
    expect(safeInternalPath("/\\evil.com")).toBe("/feed");
  });

  it("rejects a mixed backslash smuggle (`/\\/evil.com`)", () => {
    expect(safeInternalPath("/\\/evil.com")).toBe("/feed");
  });

  it("keeps an encoded-slash value on-origin instead of following it off-origin", () => {
    // `/%2f%2fevil.com` must never resolve to another origin. The URL parser
    // keeps it on our origin (the `%2f` stays encoded in the path), so the
    // result is a harmless same-origin path, never `//evil.com`.
    const result = safeInternalPath("/%2f%2fevil.com");
    const resolved = new URL(result, ORIGIN);
    expect(resolved.origin).toBe(ORIGIN);
    expect(result.startsWith("//")).toBe(false);
  });

  it("rejects an absolute off-origin URL", () => {
    expect(safeInternalPath("https://evil.com/path")).toBe("/feed");
  });

  it("rejects control characters (tab/newline)", () => {
    expect(safeInternalPath("/foo\tbar")).toBe("/feed");
    expect(safeInternalPath("/foo\nbar")).toBe("/feed");
  });

  it("rejects a non-string input", () => {
    expect(safeInternalPath(null)).toBe("/feed");
    expect(safeInternalPath(undefined)).toBe("/feed");
    expect(safeInternalPath(42)).toBe("/feed");
  });

  it("honours a caller-supplied fallback", () => {
    expect(safeInternalPath(null, "/messages")).toBe("/messages");
    expect(safeInternalPath("//evil.com", "/messages")).toBe("/messages");
  });
});
