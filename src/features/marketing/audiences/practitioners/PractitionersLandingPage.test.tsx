import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { AUTH_STORAGE_KEY } from "../../cookies.data";
import {
  duplicateIds,
  outsideInert,
} from "../shared/testing/audienceTestUtils";
import { PractitionersLandingPage } from "./PractitionersLandingPage";

const INVITE_HREF = "/auth/request-invite?from=for_practitioners";
const CREATE_PERSONA = "Create a persona";
/** The en `subprofiles:therapist.side.similar.label`: the heading of the
 *  sidebar block that reads the live therapist directory. */
const SIMILAR_THERAPISTS_LABEL = "Also worth a look";
/** En and em dashes, built from their code points so neither character sits
 *  in source (a lint fix turns the escapes back into the characters). */
const DASHES = new RegExp(
  `[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`,
);

function renderPage() {
  return render(
    <TestProviders>
      <PractitionersLandingPage />
    </TestProviders>,
  );
}

afterEach(() => {
  localStorage.clear();
});

describe("PractitionersLandingPage", () => {
  it("signed out: one h1 and two invite links with the page source", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
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
    expect(screen.queryByRole("link", { name: CREATE_PERSONA })).toBeNull();
  });

  it("a member gets Create a persona and no invite", async () => {
    renderPage();
    const createLinks = await screen.findAllByRole("link", {
      name: CREATE_PERSONA,
    });
    expect(createLinks).toHaveLength(2);
    for (const link of createLinks) {
      expect(link).toHaveAttribute(
        "href",
        "/account/subprofiles?create=1&kind=tattoo_artist",
      );
    }
    expect(
      screen.queryByRole("link", { name: "Request an invite" }),
    ).toBeNull();
  });

  it("Create a persona follows the Try it choice", async () => {
    renderPage();
    await screen.findAllByRole("link", { name: CREATE_PERSONA });
    fireEvent.click(screen.getByRole("tab", { name: "Therapist" }));
    await waitFor(() => {
      for (const link of screen.getAllByRole("link", {
        name: CREATE_PERSONA,
      })) {
        expect(link).toHaveAttribute(
          "href",
          "/account/subprofiles?create=1&kind=therapist",
        );
      }
    });
  });

  it("noindex", async () => {
    renderPage();
    await waitFor(() =>
      expect(
        document.querySelector(
          'meta[name="robots"][content="noindex, nofollow"]',
        ),
      ).not.toBeNull(),
    );
  });

  it("every showcase is inert and labelled", async () => {
    const { container } = renderPage();
    await screen.findAllByRole("link", { name: CREATE_PERSONA });
    const showcases = [...container.querySelectorAll("figure[aria-label]")];
    expect(showcases.length).toBeGreaterThanOrEqual(7);
    for (const showcase of showcases) {
      expect(showcase.getAttribute("aria-label")).not.toBe("");
      expect(showcase.querySelector("[inert]")).not.toBeNull();
    }
  });

  it("no duplicate ids", async () => {
    const { container } = renderPage();
    await screen.findAllByRole("link", { name: CREATE_PERSONA });
    expect(duplicateIds(container)).toEqual([]);
  });

  it("no em or en dashes in rendered text", async () => {
    renderPage();
    await screen.findAllByRole("link", { name: CREATE_PERSONA });
    expect(document.body.textContent ?? "").not.toMatch(DASHES);
  });

  it("no fetch-bound therapist parts", async () => {
    const { container } = renderPage();
    await screen.findAllByRole("link", { name: CREATE_PERSONA });
    fireEvent.click(screen.getByRole("tab", { name: "Therapist" }));
    // The practical bits render only on the full therapist page, so the
    // Try it panel has switched once this id is in.
    await waitFor(() =>
      expect(container.querySelector("#therapist-practical")).not.toBeNull(),
    );
    expect(container.textContent ?? "").not.toContain(SIMILAR_THERAPISTS_LABEL);
  });
});
