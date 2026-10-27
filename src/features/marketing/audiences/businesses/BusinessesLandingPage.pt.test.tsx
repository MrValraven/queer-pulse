import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { AUTH_STORAGE_KEY } from "../../cookies.data";
import { BusinessesLandingPage } from "./BusinessesLandingPage";

afterEach(() => {
  localStorage.clear();
});

describe("BusinessesLandingPage in pt", () => {
  it("a pt guest reads the invite in pt", async () => {
    localStorage.setItem("qp.lang", "pt");
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    render(
      <TestProviders initialEntries={["/for/businesses"]}>
        <BusinessesLandingPage />
      </TestProviders>,
    );
    expect(
      (await screen.findAllByText("Pedir um convite")).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Request an invite")).toBeNull();
  });
});
