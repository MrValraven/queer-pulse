import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestEmailCode } from "./emailCode.api";

const mockPost = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("../../../shared/api/client", () => ({
  apiPostUnversioned: mockPost.post,
}));

describe("requestEmailCode", () => {
  beforeEach(() => {
    mockPost.post.mockReset();
  });

  it("sends isRegistration only when it is true", async () => {
    await requestEmailCode("sam@example.com", "en", true);
    expect(mockPost.post).toHaveBeenCalledWith(
      "/auth/email-code/request",
      { email: "sam@example.com", locale: "en", isRegistration: true },
      expect.any(Function),
    );
  });

  it("omits isRegistration when it is false or absent", async () => {
    await requestEmailCode("sam@example.com", "en");
    await requestEmailCode("sam@example.com", "pt", false);
    expect(mockPost.post.mock.calls[0]?.[1]).toStrictEqual({
      email: "sam@example.com",
      locale: "en",
    });
    expect(mockPost.post.mock.calls[1]?.[1]).toStrictEqual({
      email: "sam@example.com",
      locale: "pt",
    });
  });
});
