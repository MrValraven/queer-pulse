import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { routes } from "../../app/routeMap";
import { AccessibilityStatementPage } from "./AccessibilityStatementPage";
import { ACCESSIBILITY_FEEDBACK_PATH } from "./accessibilityStatement.data";

/**
 * The accessibility statement makes claims about the platform and about the
 * law, so this suite guards the parts that must not quietly disappear: a named
 * standard, an honest conformance status, the known shortfalls, how the
 * statement was prepared, the legal position and its non-advice line, a
 * feedback route, and an escalation route that goes somewhere real. A refactor
 * that drops one of those has changed what QueerPulse tells people, and the
 * test should say so.
 *
 * The escalation assertions are deliberately specific about IDiPD and ANACOM.
 * Decreto-Lei 82/2022 gives e-commerce services to ANACOM under Article
 * 28(1)(a), and the body that follows the decree-law was renamed from INR to
 * IDiPD by Decreto-Lei 60/2026, so a regression to either old name is a
 * factual error on a published page.
 *
 * Catalog text arrives from a lazily loaded namespace, so every assertion uses
 * `findBy*`.
 */
function renderStatement() {
  return render(
    <TestProviders initialEntries={[routes.policiesAccessibility]}>
      <AccessibilityStatementPage />
    </TestProviders>,
  );
}

describe("AccessibilityStatementPage", () => {
  it("names the standard and the conformance level it aims at", async () => {
    renderStatement();
    // The meta line, matched exactly: the same phrase appears in the prose
    // several times, and `getNodeText` compares an element's own text nodes.
    expect(
      await screen.findByText("Measured against WCAG 2.2 Level AA"),
    ).toBeInTheDocument();
  });

  it("renders every section the statement is required to contain", async () => {
    renderStatement();

    for (const heading of [
      /our commitment/i,
      /what this statement covers/i,
      /where the law stands/i,
      /conformance status/i,
      /what works today/i,
      /what is not fully accessible/i,
      /how this statement was prepared/i,
      /tell us about a barrier/i,
      /if our answer is not enough/i,
    ]) {
      expect(
        await screen.findByRole("heading", { level: 2, name: heading }),
      ).toBeInTheDocument();
    }
  });

  it("states the conformance status as partial rather than full", async () => {
    renderStatement();
    // Exact match on the <strong>: the surrounding paragraph explains what
    // "partially conformant" means, so a substring match would find both.
    expect(await screen.findByText("partially conformant")).toBeInTheDocument();
  });

  it("says plainly that no assistive-technology testing is on record", async () => {
    renderStatement();
    expect(
      await screen.findByText("No assistive-technology testing on record."),
    ).toBeInTheDocument();
  });

  it("routes barrier reports to the contact form on the accessibility topic", async () => {
    renderStatement();
    const reportLink = await screen.findByRole("link", {
      name: /report an access barrier/i,
    });
    expect(reportLink).toHaveAttribute("href", ACCESSIBILITY_FEEDBACK_PATH);
  });

  it("claims no legal obligation to publish, and links the decree-law", async () => {
    renderStatement();
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: /where the law stands/i,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: /Decreto-Lei n.º 82\/2022/ }),
    ).toHaveAttribute(
      "href",
      "https://diariodarepublica.pt/dr/detalhe/decreto-lei/82-2022-204379872",
    );
    expect(
      await screen.findByText(/nothing currently obliges us to/i),
    ).toBeInTheDocument();
  });

  it("carries the non-advice line", async () => {
    renderStatement();
    expect(await screen.findByText("Not legal advice")).toBeInTheDocument();
  });

  it("escalates to IDiPD by its current name, linked to its own site", async () => {
    renderStatement();
    const idipdLink = await screen.findByRole("link", {
      name: /its own site/i,
    });
    expect(idipdLink).toHaveAttribute("href", "https://idipd.mtsss.gov.pt/");
    expect(idipdLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(
      await screen.findByText(
        /Instituto para os Direitos das Pessoas com Deficiência/,
      ),
    ).toBeInTheDocument();
  });

  it("names ANACOM as the Article 28 regulator and says it may not apply", async () => {
    renderStatement();
    expect(
      await screen.findByText(/E-commerce services fall to ANACOM/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/this route may well not be open to you today/i),
    ).toBeInTheDocument();
  });

  it("carries the prepared and last-reviewed dates", async () => {
    renderStatement();
    expect(await screen.findByText(/^Prepared /)).toBeInTheDocument();
    expect(await screen.findByText(/^Last reviewed /)).toBeInTheDocument();
  });

  it("gives the document a single level-one heading", async () => {
    renderStatement();
    await screen.findByRole("heading", { level: 2, name: /our commitment/i });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
