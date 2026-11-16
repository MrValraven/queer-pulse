import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { JoinRequestReviewGuide } from "./JoinRequestReviewGuide";

const STORAGE_KEY = "qp.admin.joinRequestGuide.open";

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("JoinRequestReviewGuide", () => {
  it("starts closed on a first visit", async () => {
    render(<JoinRequestReviewGuide />, { wrapper: TestProviders });
    const toggle = await screen.findByRole("button", {
      name: "How to review someone nobody here knows",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("remembers that the reviewer opened it", async () => {
    render(<JoinRequestReviewGuide />, { wrapper: TestProviders });
    const toggle = await screen.findByRole("button", {
      name: "How to review someone nobody here knows",
    });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("true");
  });

  it("stays closed when storage throws", async () => {
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
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
