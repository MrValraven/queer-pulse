import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  resetSkipLinkPrefForTests,
  setSkipLinkPref,
} from "../../../features/settings/skipLinkPref";
import { MAIN_CONTENT_ID, SkipToContentLink } from "./SkipToContentLink";

afterEach(() => {
  resetSkipLinkPrefForTests(false);
  localStorage.clear();
});

function renderLink() {
  return render(
    <TestProviders>
      <SkipToContentLink />
    </TestProviders>,
  );
}

describe("SkipToContentLink", () => {
  it("renders nothing while the pref is off (the default)", () => {
    resetSkipLinkPrefForTests(false);
    renderLink();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders an anchor targeting <main> once the pref is on", () => {
    resetSkipLinkPrefForTests(true);
    renderLink();
    const link = screen.getByRole("link", { name: /skip to main content/i });
    expect(link).toHaveAttribute("href", `#${MAIN_CONTENT_ID}`);
  });

  // The regression this whole item exists for: the Accessibility toggle used to
  // flip a boolean that no render code read, so turning it on changed nothing.
  // Flipping the pref must reach an already-mounted shell.
  it("appears when the pref is flipped on while mounted", () => {
    resetSkipLinkPrefForTests(false);
    renderLink();
    expect(screen.queryByRole("link")).toBeNull();

    // The store lives outside React, so its notify must be act-wrapped.
    act(() => setSkipLinkPref(true));
    expect(
      screen.getByRole("link", { name: /skip to main content/i }),
    ).toBeInTheDocument();
  });

  it("is focusable, not hidden from the tab order", () => {
    resetSkipLinkPrefForTests(true);
    renderLink();
    const link = screen.getByRole("link", { name: /skip to main content/i });
    link.focus();
    expect(link).toHaveFocus();
  });
});
