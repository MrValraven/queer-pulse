import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { AUTH_STORAGE_KEY } from "../../cookies.data";
import { PerformersLandingPage } from "./PerformersLandingPage";

afterEach(() => {
  localStorage.clear();
});

describe("PerformersLandingPage in Portuguese", () => {
  it("a guest reads the page in pt", async () => {
    localStorage.setItem("qp.lang", "pt");
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    render(
      <TestProviders initialEntries={["/for/performers"]}>
        <PerformersLandingPage />
      </TestProviders>,
    );
    expect(
      (await screen.findAllByRole("link", { name: "Pedir um convite" })).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Request an invite")).toBeNull();
  });
});
