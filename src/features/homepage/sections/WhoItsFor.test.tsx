import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { WhoItsFor } from "./WhoItsFor";

describe("WhoItsFor", () => {
  it("four tiles link to the four pages", async () => {
    render(
      <TestProviders>
        <WhoItsFor />
      </TestProviders>,
    );
    // The homepage catalog loads lazily, so findBy waits for the title.
    const region = await screen.findByRole("region", {
      name: /Made for the way/,
    });
    const hrefs = within(region)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual([
      "/for/businesses",
      "/for/communities",
      "/for/performers",
      "/for/practitioners",
    ]);
  });

  it("the strip sits between personas and pain points", () => {
    const source = readFileSync(
      new URL("../HomePage.tsx", import.meta.url),
      "utf8",
    );
    const personas = source.indexOf("<PersonasShowcase />");
    const strip = source.indexOf("<WhoItsFor />");
    const pain = source.indexOf("<PainPoints />");
    expect(personas).toBeGreaterThan(-1);
    expect(personas).toBeLessThan(strip);
    expect(strip).toBeLessThan(pain);
  });
});
