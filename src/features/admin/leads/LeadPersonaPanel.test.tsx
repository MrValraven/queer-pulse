import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { useLead } from "./api/useLead";
import { LeadPersonaPanel } from "./LeadPersonaPanel";
import { demoGetLead, resetDemoLeads } from "./leadsDemoStore";

// TestProviders forces demo mode, so the panel reads and writes the demo
// leads store.

const ZINE_TINTA_ID = "demo-lead-zine-tinta";
const AFTERHOURS_ID = "demo-lead-afterhours";
const VANDA_DIESEL_ID = "demo-lead-vanda-diesel";

/** Reads the lead as the lead page does, then mounts the panel on it. */
function PanelHarness({ leadId }: { leadId: string }) {
  const { data } = useLead(leadId);
  return data ? <LeadPersonaPanel lead={data} /> : null;
}

function renderPanel(leadId: string) {
  render(
    <TestProviders>
      <PanelHarness leadId={leadId} />
    </TestProviders>,
  );
  return userEvent.setup();
}

/** The admin namespace loads lazily, so every test waits for the heading. */
async function waitForPanel() {
  await screen.findByRole("heading", { name: "Persona" });
}

describe("LeadPersonaPanel", () => {
  beforeEach(() => resetDemoLeads());

  it("links a persona and offers Move to On board", async () => {
    const user = renderPanel(ZINE_TINTA_ID);
    await waitForPanel();
    expect(
      screen.getByText(
        "No persona linked yet. Link one once they join QueerPulse",
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Link persona" }));
    const dialog = await screen.findByRole("dialog", { name: "Link persona" });
    await user.type(within(dialog).getByLabelText("Search personas"), "Bloco");
    await user.click(
      await screen.findByRole("button", {
        name: "Link BLOCO ROSA to this lead",
      }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Link persona" })).toBeNull(),
    );
    expect(screen.getByText("BLOCO ROSA")).toBeInTheDocument();
    expect(
      await screen.findByText("BLOCO ROSA is linked to this lead"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Persona linked. The stage is still To contact"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Move to On board" }));
    await waitFor(() =>
      expect(demoGetLead(ZINE_TINTA_ID).stage).toBe("on_board"),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Move to On board" }),
      ).toBeNull(),
    );
  });

  it("keeps the card and names why when the persona left the directory", async () => {
    renderPanel(AFTERHOURS_ID);
    await waitForPanel();
    expect(screen.getByText("Afterhours")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Not public now: the owner made this persona members only or private",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Unlink persona" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Link persona" })).toBeNull();
  });

  it("unlinks a persona", async () => {
    const user = renderPanel(VANDA_DIESEL_ID);
    await waitForPanel();
    await user.click(screen.getByRole("button", { name: "Unlink persona" }));
    expect(
      await screen.findByText(
        "No persona linked yet. Link one once they join QueerPulse",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Vanda Diesel is no longer linked"),
    ).toBeInTheDocument();
    expect(demoGetLead(VANDA_DIESEL_ID).linkedPersona).toBeNull();
    // An unlink offers no stage prompt.
    expect(
      screen.queryByRole("button", { name: "Move to On board" }),
    ).toBeNull();
  });

  it("names a persona already linked elsewhere", async () => {
    const user = renderPanel(ZINE_TINTA_ID);
    await waitForPanel();
    await user.click(screen.getByRole("button", { name: "Link persona" }));
    const dialog = await screen.findByRole("dialog", { name: "Link persona" });
    await user.type(within(dialog).getByLabelText("Search personas"), "@vanda");
    const result = await screen.findByRole("button", {
      name: "Link Vanda Diesel to this lead",
    });
    expect(result).toHaveAttribute("aria-disabled", "true");
    expect(result).toHaveTextContent("Linked to Vanda Diesel");
    await user.click(result);
    expect(demoGetLead(ZINE_TINTA_ID).linkedPersona).toBeNull();
  });
});
