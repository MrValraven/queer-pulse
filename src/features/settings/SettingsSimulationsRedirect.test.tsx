import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { Route, Routes } from "react-router-dom";
import { TestProviders } from "../../test/TestProviders";
import { SettingsPage } from "./SettingsPage";

// jsdom has no layout engine, so `Element.prototype.scrollIntoView` is absent
// (see SettingsPage.save.test.tsx for the same stub and rationale). Even
// though this test redirects before the mobile-nav scrollspy effect would
// fire, SettingsPage still mounts briefly, so guard the same way.
beforeAll(() => {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

describe("settings simulations redirect", () => {
  it("redirects ?pane=simulations to /simulations", async () => {
    render(
      <TestProviders initialEntries={["/account/settings?pane=simulations"]}>
        <Routes>
          <Route path="/account/settings" element={<SettingsPage />} />
          <Route path="/simulations" element={<div>simulations home</div>} />
        </Routes>
      </TestProviders>,
    );
    expect(await screen.findByText("simulations home")).toBeInTheDocument();
  });
});
