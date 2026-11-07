import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  demoAdminPersonaWall,
  resetDemoPersonaWall,
} from "../../subprofiles/personaWallDemoStore";
import { useAdminPersonaWall } from "../api/useAdminPersonaWall";
import { PersonaWallFillOrder } from "./PersonaWallFillOrder";

/** Reads the wall the way the page does and hands its fill order down. */
function Harness() {
  const wall = useAdminPersonaWall();
  if (!wall.data) return null;
  return <PersonaWallFillOrder fillOrder={wall.data.fillOrder} />;
}

function renderFillOrder() {
  render(<Harness />, { wrapper: TestProviders });
}

/** The panel's own saved line. The toast region also carries the status
 *  role, so the query stays inside the "Fill the rest" panel. */
function savedLine(): HTMLElement {
  return within(
    screen.getByRole("region", { name: "Fill the rest" }),
  ).getByRole("status");
}

describe("PersonaWallFillOrder", () => {
  beforeEach(() => resetDemoPersonaWall());
  afterEach(() => vi.useRealTimers());

  it("checks the stored order", async () => {
    renderFillOrder();
    const endorsed = await screen.findByRole("radio", {
      name: /Most endorsed/,
    });
    expect(endorsed).toHaveAttribute("aria-checked", "true");
    expect(screen.getAllByRole("radio")).toHaveLength(4);
  });

  it("saves a new order and says so", async () => {
    renderFillOrder();
    fireEvent.click(
      await screen.findByRole("radio", { name: /Most followed/ }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("radio", { name: /Most followed/ }),
      ).toHaveAttribute("aria-checked", "true"),
    );
    await waitFor(() =>
      expect(savedLine()).toHaveTextContent("Fill order saved"),
    );
    expect(demoAdminPersonaWall().fillOrder).toBe("followed");
  });

  it("clears the saved line a few seconds after the save", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderFillOrder();
    fireEvent.click(
      await screen.findByRole("radio", { name: /Most followed/ }),
    );
    await waitFor(() =>
      expect(savedLine()).toHaveTextContent("Fill order saved"),
    );
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    await waitFor(() => expect(savedLine()).toBeEmptyDOMElement());
  });

  it("gives every card a decorative check that only the checked card shows", async () => {
    renderFillOrder();
    await screen.findByRole("radio", { name: /Most endorsed/ });
    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) =>
      expect(radio.querySelector("svg")).toHaveAttribute("aria-hidden", "true"),
    );
    expect(
      radios.filter((radio) => radio.hasAttribute("data-checked")),
    ).toHaveLength(1);
  });
});
