import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LegacyRedirect } from "./routes.redirects";

/** Renders where the redirect actually landed, as one string. */
function Landing() {
  const location = useLocation();
  return (
    <div data-testid="landing">
      {`${location.pathname}${location.search}${location.hash}`}
    </div>
  );
}

function renderRedirect(entry: string, from: string, to: string) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path={from} element={<LegacyRedirect to={to} />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </MemoryRouter>,
  );
  return screen.getByTestId("landing").textContent;
}

describe("LegacyRedirect", () => {
  it("keeps the query string, so an old article bookmark still names its piece", () => {
    // PRD-100: a plain <Navigate> dropped `?id=`, and the reader landed on the
    // article page with no id at all.
    expect(
      renderRedirect("/article?id=some-slug", "/article", "/magazine/article"),
    ).toBe("/magazine/article?id=some-slug");
  });

  it("keeps the hash", () => {
    expect(renderRedirect("/help#billing", "/help", "/about/help")).toBe(
      "/about/help#billing",
    );
  });

  it("merges into a target that already carries its own query", () => {
    expect(
      renderRedirect(
        "/flatmates?sort=newest",
        "/flatmates",
        "/work/housing?tab=flatmates",
      ),
    ).toBe("/work/housing?tab=flatmates&sort=newest");
  });

  it("keeps the target's own params when the incoming URL repeats one", () => {
    expect(
      renderRedirect(
        "/flatmates?tab=rooms",
        "/flatmates",
        "/work/housing?tab=flatmates",
      ),
    ).toBe("/work/housing?tab=flatmates");
  });

  it("leaves a plain path untouched", () => {
    expect(renderRedirect("/badges", "/badges", "/account/badges")).toBe(
      "/account/badges",
    );
  });
});
