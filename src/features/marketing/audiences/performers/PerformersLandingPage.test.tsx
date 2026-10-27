import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { AUTH_STORAGE_KEY } from "../../cookies.data";
import {
  duplicateIds,
  outsideInert,
} from "../shared/testing/audienceTestUtils";
import { PerformersLandingPage } from "./PerformersLandingPage";

const INVITE_HREF = "/auth/request-invite?from=for_performers";

// En and em dashes, built from their code points so the dash characters
// themselves never sit in source.
const DASHES = new RegExp(
  `[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`,
);

function renderPage() {
  return render(
    <TestProviders initialEntries={["/for/performers"]}>
      <PerformersLandingPage />
    </TestProviders>,
  );
}

function signOut() {
  localStorage.setItem(AUTH_STORAGE_KEY, "false");
}

afterEach(() => {
  localStorage.clear();
});

describe("PerformersLandingPage", () => {
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
    expect(screen.queryByRole("link", { name: "Create a persona" })).toBeNull();
  });

  it("a member gets Create a persona and no invite", async () => {
    renderPage();
    const createLinks = await screen.findAllByRole("link", {
      name: "Create a persona",
    });
    expect(createLinks).toHaveLength(2);
    expect(
      screen.queryByRole("link", { name: "Request an invite" }),
    ).toBeNull();
  });

  it("a member's Create a persona follows the Try it choice", async () => {
    renderPage();
    const createLinks = await screen.findAllByRole("link", {
      name: "Create a persona",
    });
    for (const link of createLinks) {
      expect(link).toHaveAttribute(
        "href",
        "/account/subprofiles?create=1&kind=drag",
      );
    }
    fireEvent.click(screen.getByRole("tab", { name: "DJ" }));
    await waitFor(() => {
      for (const link of screen.getAllByRole("link", {
        name: "Create a persona",
      })) {
        expect(link).toHaveAttribute(
          "href",
          "/account/subprofiles?create=1&kind=dj",
        );
      }
    });
  });

  it("the persona page renders once", async () => {
    signOut();
    const { container } = renderPage();
    await screen.findAllByRole("link", { name: "Request an invite" });
    expect(container.querySelectorAll(".pp .pp-runhead").length).toBe(1);
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

  it("a guest reads Studio as plain text and gets no gated link", async () => {
    signOut();
    const { container } = renderPage();
    await screen.findAllByRole("link", { name: "Request an invite" });
    expect(screen.getByText(/QueerPulse Studio is our space/)).not.toBeNull();
    expect(
      screen.queryByRole("link", { name: "Open QueerPulse Studio" }),
    ).toBeNull();
    const page = container.querySelector('[data-audience="performers"]');
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

  it("a member gets the Studio link", async () => {
    renderPage();
    expect(
      await screen.findByRole("link", { name: "Open QueerPulse Studio" }),
    ).toHaveAttribute("href", "/studio");
  });
});
