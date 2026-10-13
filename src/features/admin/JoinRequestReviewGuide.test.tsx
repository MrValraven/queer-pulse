import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { JoinRequestReviewGuide } from "./JoinRequestReviewGuide";

const STORAGE_KEY = "qp.admin.joinRequestGuide.open";

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

function stubScreenWidth(isWide: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    () => ({ matches: isWide }) as MediaQueryList,
  );
}

describe("JoinRequestReviewGuide", () => {
  it("opens on a first visit on a wide screen", async () => {
    stubScreenWidth(true);
    render(<JoinRequestReviewGuide />, { wrapper: TestProviders });
    const toggle = await screen.findByRole("button", {
      name: "How to review someone nobody here knows",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("starts closed on a first visit on a narrow screen", async () => {
    stubScreenWidth(false);
    render(<JoinRequestReviewGuide />, { wrapper: TestProviders });
    const toggle = await screen.findByRole("button", {
      name: "How to review someone nobody here knows",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("remembers that the reviewer closed it", async () => {
    stubScreenWidth(true);
    render(<JoinRequestReviewGuide />, { wrapper: TestProviders });
    const toggle = await screen.findByRole("button", {
      name: "How to review someone nobody here knows",
    });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("false");
  });

  it("stays open when storage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(<JoinRequestReviewGuide />, { wrapper: TestProviders });
    const toggle = await screen.findByRole("button", {
      name: "How to review someone nobody here knows",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
