import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { Footer } from "./Footer";

interface AuthHarness {
  isLoggedIn: boolean;
}
const harness = vi.hoisted<AuthHarness>(() => ({ isLoggedIn: true }));

vi.mock("../../../app/providers/authContext", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../app/providers/authContext")>();
  return {
    ...actual,
    useAuth: () => ({ ...actual.useAuth(), loggedIn: harness.isLoggedIn }),
  };
});

const EXPECTED_HREFS = [
  "/for/businesses",
  "/for/communities",
  "/for/performers",
  "/for/practitioners",
];

describe("Footer who it's for group", () => {
  it.each([
    ["signed out", false],
    ["signed in", true],
  ])("%s sees the group with four links", (_label, isLoggedIn) => {
    harness.isLoggedIn = isLoggedIn;
    render(
      <TestProviders>
        <Footer />
      </TestProviders>,
    );
    const group = screen.getByRole("navigation", { name: "Who it's for" });
    const hrefs = within(group)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(EXPECTED_HREFS);
  });
});
