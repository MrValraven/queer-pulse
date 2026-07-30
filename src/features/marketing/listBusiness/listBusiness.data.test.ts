import { describe, expect, it } from "vitest";
import { isPastableImageUrl } from "./listBusiness.data";

describe("isPastableImageUrl", () => {
  it("accepts https URLs (the only value the backend persists)", () => {
    expect(isPastableImageUrl("https://example.com/a.jpg")).toBe(true);
    expect(isPastableImageUrl("  https://example.com/a.jpg  ")).toBe(true);
  });
  it("rejects empty, whitespace, and everything the backend refuses", () => {
    expect(isPastableImageUrl("")).toBe(false);
    expect(isPastableImageUrl("   ")).toBe(false);
    // http is a mixed-content downgrade; data:/blob: are stored-XSS vectors —
    // the backend's @IsImageReference refuses all three, so the paste field must
    // too (otherwise the value 400s the whole listing save).
    expect(isPastableImageUrl("http://example.com/a.jpg")).toBe(false);
    expect(isPastableImageUrl("data:image/png;base64,AAAA")).toBe(false);
    expect(isPastableImageUrl("blob:https://app/uuid")).toBe(false);
    expect(isPastableImageUrl("javascript:alert(1)")).toBe(false);
    expect(isPastableImageUrl("not a url")).toBe(false);
  });
});
