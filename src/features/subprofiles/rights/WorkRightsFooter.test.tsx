import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { WorkRightsFooter } from "./WorkRightsFooter";

/**
 * `WorkRightsFooter` is pure presentational: a copyright line ("© {year}
 * {author}. All rights reserved.") plus a "First published on QueerPulse ·
 * {date}" line, derived from `createdAtISO`. Only `TestProviders` for the
 * lazy `subprofiles` catalog, so the translated text comes via `findBy*`.
 */
describe("WorkRightsFooter", () => {
  it("renders the copyright year, author name, and 'All rights reserved'", async () => {
    render(
      <TestProviders>
        <WorkRightsFooter authorName="Tiago" createdAtISO="2025-07-14T09:32:00.000Z" />
      </TestProviders>,
    );

    expect(await screen.findByText(/2025/)).toBeInTheDocument();
    expect(await screen.findByText(/Tiago/)).toBeInTheDocument();
    expect(await screen.findByText(/All rights reserved/i)).toBeInTheDocument();
  });
});
