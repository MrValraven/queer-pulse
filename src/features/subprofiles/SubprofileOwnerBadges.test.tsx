import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SubprofileOwnerBadges } from "./SubprofileOwnerBadges";

/**
 * `SubprofileOwnerBadges` is pure presentational branching shared by the hero
 * and the compact switch-list row, with one subtle rule worth locking down:
 * a `"published"` status is HIDDEN in `compact` mode (the "exceptional state
 * only" convention) but SHOWN on the hero, while `"draft"` always shows. The
 * public path (no status/visibility) must render nothing at all. No hooks to
 * mock — only `TestProviders` for the lazy `subprofiles`/`shared` catalogs, so
 * the badge labels come via `findBy*`; the "renders nothing" case is a
 * synchronous DOM-emptiness assertion.
 */

describe("SubprofileOwnerBadges", () => {
  it("renders nothing on the public path (no status, no visibility)", () => {
    render(
      <TestProviders>
        <div data-testid="host">
          <SubprofileOwnerBadges />
        </div>
      </TestProviders>,
    );
    expect(screen.getByTestId("host")).toBeEmptyDOMElement();
  });

  it("shows a published status badge on the hero (compact unset)", async () => {
    render(
      <TestProviders>
        <SubprofileOwnerBadges status="published" />
      </TestProviders>,
    );
    expect(await screen.findByText("Published")).toBeInTheDocument();
  });

  it("hides the published badge in compact mode but keeps the visibility badge", async () => {
    render(
      <TestProviders>
        <SubprofileOwnerBadges status="published" visibility="open" compact />
      </TestProviders>,
    );
    // Visibility badge still renders — waiting on it also lets the (absent)
    // status badge's catalog resolve, so the negative assertion is reliable.
    expect(await screen.findByText("Open to connect")).toBeInTheDocument();
    expect(screen.queryByText("Published")).not.toBeInTheDocument();
  });

  it("still shows a draft status badge in compact mode (exceptional state)", async () => {
    render(
      <TestProviders>
        <SubprofileOwnerBadges status="draft" compact />
      </TestProviders>,
    );
    expect(await screen.findByText("Draft")).toBeInTheDocument();
  });
});
