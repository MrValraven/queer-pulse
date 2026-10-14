import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AppRoutes } from "../../app/routes";
import { TestProviders } from "../../test/TestProviders";

beforeEach(() => {
  window.localStorage.clear();
});

describe("persona page Updates (demo)", () => {
  it("shows NIGHTFORM's latest three updates under the hero", async () => {
    const { container } = render(
      <TestProviders initialEntries={["/p/nightform"]}>
        <AppRoutes />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: /NIGHTFORM/ }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Updates" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("new single in nine days, Night bus, the long version"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "thank you to everyone who came out on Saturday, still buzzing",
      ),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Show more updates" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector("#updates")).not.toBeNull(),
    );
    expect(screen.queryByRole("button", { name: "Post update" })).toBeNull();
  });

  it("shows nothing on a persona of another kind", async () => {
    const { container } = render(
      <TestProviders initialEntries={["/p/anika-poetry"]}>
        <AppRoutes />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { level: 1 }),
    ).toBeInTheDocument();
    expect(container.querySelector("#updates")).toBeNull();
  });
});
