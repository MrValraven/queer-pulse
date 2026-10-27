import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { AUTH_STORAGE_KEY } from "../../cookies.data";
import {
  duplicateIds,
  outsideInert,
} from "../shared/testing/audienceTestUtils";
import { CommunitiesLandingPage } from "./CommunitiesLandingPage";

const INVITE_HREF = "/auth/request-invite?from=for_communities";

// En and em dashes, built from their code points so the dash characters
// themselves never appear in source.
const DASHES = new RegExp(
  `[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`,
);

function renderPage() {
  return render(
    <TestProviders initialEntries={["/for/communities"]}>
      <CommunitiesLandingPage />
    </TestProviders>,
  );
}

function signOut() {
  localStorage.setItem(AUTH_STORAGE_KEY, "false");
}

afterEach(() => {
  localStorage.clear();
});

describe("CommunitiesLandingPage", () => {
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
      screen.queryByRole("link", { name: "Start a community" }),
    ).toBeNull();
  });

  it("a member gets both actions", async () => {
    renderPage();
    const startLinks = await screen.findAllByRole("link", {
      name: "Start a community",
    });
    expect(startLinks.length).toBeGreaterThan(0);
    for (const link of startLinks) {
      expect(link).toHaveAttribute("href", "/communities/start");
    }
    const createLinks = screen.getAllByRole("link", {
      name: "Create an event",
    });
    expect(createLinks.length).toBeGreaterThan(0);
    for (const link of createLinks) {
      expect(link).toHaveAttribute("href", "/create-gathering");
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

  it("guests reach the public code of conduct, and no gated route", async () => {
    signOut();
    const { container } = renderPage();
    await screen.findAllByRole("link", { name: "Request an invite" });
    expect(
      screen.getByRole("link", { name: "Read the code of conduct" }),
    ).toHaveAttribute("href", "/about/governance/code-of-conduct");
    const page = container.querySelector('[data-audience="communities"]');
    expect(page).not.toBeNull();
    const gatedLinks = outsideInert([
      ...(page?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []),
    ]).filter((link) =>
      /^\/(communities|create-gathering|account|studio)(\/|$|\?)/.test(
        link.getAttribute("href") ?? "",
      ),
    );
    expect(gatedLinks).toEqual([]);
  });
});
