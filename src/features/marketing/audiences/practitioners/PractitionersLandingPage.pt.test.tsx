import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { AUTH_STORAGE_KEY } from "../../cookies.data";
import { PractitionersLandingPage } from "./PractitionersLandingPage";

afterEach(() => {
  localStorage.clear();
});

describe("PractitionersLandingPage in Portuguese", () => {
  it("a guest reads the invite in Portuguese", async () => {
    localStorage.setItem("qp.lang", "pt");
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    render(
      <TestProviders>
        <PractitionersLandingPage />
      </TestProviders>,
    );
    expect(
      (await screen.findAllByText("Pedir um convite")).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Request an invite")).toBeNull();
  });
});
