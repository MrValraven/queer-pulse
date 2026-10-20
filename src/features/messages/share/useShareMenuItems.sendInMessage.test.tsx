import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { useShareMenuItems } from "./useShareMenuItems";

const content = {
  path: "/studio/collection?id=pl1",
  title: "Kitchen tapes",
  kind: "studio" as const,
  text: "Kitchen tapes",
};
const shareToChat = {
  canShare: true,
  isOpen: false,
  open: vi.fn(),
  close: vi.fn(),
};
const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

describe("useShareMenuItems", () => {
  it("offers Send in a message by default", () => {
    const { result } = renderHook(
      () => useShareMenuItems(content, shareToChat),
      { wrapper },
    );
    expect(result.current.map((item) => item.key)).toContain("message");
  });

  it("leaves Send in a message out when the caller says so and keeps Copy link", () => {
    const { result } = renderHook(
      () =>
        useShareMenuItems(content, shareToChat, {
          shouldOfferSendInMessage: false,
        }),
      { wrapper },
    );
    const keys = result.current.map((item) => item.key);
    expect(keys).not.toContain("message");
    expect(keys).toContain("copyLink");
  });
});
