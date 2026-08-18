import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SimulationsHome } from "./SimulationsHome";
import { SIM_GROUPS } from "./simulations.data";

describe("SimulationsHome", () => {
  it("links each flow card to its /simulations/:id player", async () => {
    render(
      <MemoryRouter>
        <SimulationsHome />
      </MemoryRouter>,
    );
    const firstGroup = SIM_GROUPS[0];
    if (!firstGroup) throw new Error("expected at least one group");
    const firstFlow = firstGroup.flows[0];
    if (!firstFlow) throw new Error("expected at least one flow");
    const link = (await screen.findByRole("link", {
      name: new RegExp(firstFlow.title, "i"),
    })) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe(
      `/simulations/${firstFlow.id}`,
    );
  });

  it("filters flows by query and shows a no-results message", async () => {
    render(
      <MemoryRouter>
        <SimulationsHome />
      </MemoryRouter>,
    );
    const firstGroup = SIM_GROUPS[0];
    if (!firstGroup) throw new Error("expected a group");
    const firstFlow = firstGroup.flows[0];
    if (!firstFlow) throw new Error("expected a flow");

    const input = await screen.findByPlaceholderText(/filter simulations/i);
    fireEvent.change(input, { target: { value: firstFlow.title } });
    expect(
      screen.getByRole("link", { name: new RegExp(firstFlow.title, "i") }),
    ).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "zzz-no-such-flow-xyz" } });
    expect(await screen.findByText(/no simulations match/i)).toBeInTheDocument();
  });
});
