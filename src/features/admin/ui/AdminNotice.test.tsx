import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminNotice } from "./AdminNotice";

describe("AdminNotice", () => {
  it("uses role alert for the error tone", () => {
    render(
      <AdminNotice tone="error">The member list failed to load</AdminNotice>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The member list failed to load",
    );
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("uses role status for warn, info and success", () => {
    const tones = ["warn", "info", "success"] as const;
    for (const tone of tones) {
      const { unmount } = render(
        <AdminNotice tone={tone}>Message for {tone}</AdminNotice>,
      );
      expect(screen.getByRole("status")).toHaveTextContent(
        `Message for ${tone}`,
      );
      expect(screen.queryByRole("alert")).toBeNull();
      unmount();
    }
  });

  it("uses liveRole when set", () => {
    render(
      <AdminNotice tone="error" liveRole="status">
        Moderation queue is behind
      </AdminNotice>,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Moderation queue is behind",
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
