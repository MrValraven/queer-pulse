import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { AUTH_STORAGE_KEY } from "../../cookies.data";
import {
  duplicateIds,
  outsideInert,
} from "../shared/testing/audienceTestUtils";
import { BusinessesLandingPage } from "./BusinessesLandingPage";

const INVITE_HREF = "/auth/request-invite?from=for_businesses";

// En and em dashes, built from their code points so the dash characters
// themselves never appear in source.
const DASHES = new RegExp(
  `[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`,
);

function renderPage() {
  return render(
    <TestProviders initialEntries={["/for/businesses"]}>
      <BusinessesLandingPage />
    </TestProviders>,
  );
}

function signOut() {
  localStorage.setItem(AUTH_STORAGE_KEY, "false");
}

afterEach(() => {
  localStorage.clear();
});

describe("BusinessesLandingPage", () => {
  it("signed out: one h1 and two invite links with the page source", async () => {
    signOut();
    renderPage();
    const inviteLinks = await screen.findAllByRole("link", {
      name: "Request an invite",
    });
    expect(inviteLinks).toHaveLength(2);
    for (const link of inviteLinks) {
      expect(link).toHaveAttribute("href", INVITE_HREF);
    }
    expect(
      outsideInert(screen.getAllByRole("heading", { level: 1 })),
    ).toHaveLength(1);
    expect(
      screen.queryByRole("link", { name: "List your business" }),
    ).toBeNull();
  });

  it("a member gets List your business", async () => {
    renderPage();
    const listLinks = await screen.findAllByRole("link", {
      name: "List your business",
    });
    expect(listLinks.length).toBeGreaterThan(0);
    for (const link of listLinks) {
      expect(link).toHaveAttribute("href", "/local/directory/list");
    }
    expect(
      screen.queryByRole("link", { name: "Request an invite" }),
    ).toBeNull();
  });

  it("noindex", async () => {
    signOut();
    renderPage();
    await screen.findAllByRole("link", { name: "Request an invite" });
    expect(
      document.querySelector(
        'meta[name="robots"][content="noindex, nofollow"]',
      ),
    ).not.toBeNull();
  });

  it("every showcase is inert and labelled", async () => {
    signOut();
    const { container } = renderPage();
    await screen.findAllByRole("link", { name: "Request an invite" });
    const figures = container.querySelectorAll("figure[aria-label]");
    expect(figures.length).toBeGreaterThanOrEqual(4);
    for (const figure of figures) {
      expect(figure.getAttribute("aria-label")).not.toBe("");
      expect(figure.querySelector("[inert]")).not.toBeNull();
    }
  });

  it("no duplicate ids", async () => {
    signOut();
    const { container } = renderPage();
    await screen.findAllByRole("link", { name: "Request an invite" });
    expect(duplicateIds(container)).toEqual([]);
  });

  it("no em or en dashes in rendered text", async () => {
    signOut();
    renderPage();
    await screen.findAllByRole("link", { name: "Request an invite" });
    expect(document.body.textContent ?? "").not.toMatch(DASHES);
  });

  it("the walkthrough is the hero's jump target", async () => {
    signOut();
    const { container } = renderPage();
    await screen.findAllByRole("link", { name: "Request an invite" });
    const walkthrough = container.querySelector("#how-it-works");
    const heading = document.getElementById("how-it-works-heading");
    expect(walkthrough).not.toBeNull();
    expect(heading?.tagName).toBe("H2");
    expect(walkthrough?.contains(heading)).toBe(true);
  });
});
