import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { TestProviders } from "../../../test/TestProviders";
import { currentUser } from "../../members/data/demoCurrentUser";
import { useLead } from "./api/useLead";
import { LEAD_ASSIGNEE_PHONE_QUERY } from "./leadAssignees.data";
import { LeadAssigneesPanel } from "./LeadAssigneesPanel";
import { demoGetLead, leadRefusal, resetDemoLeads } from "./leadsDemoStore";
import { DEMO_LEAD_VIEWER_ID } from "./leadsDemoViewer";

// TestProviders forces demo mode, so the panel reads and writes the demo
// leads store. TestProviders has no MotionProvider, and the pills and the
// picker leave through motion exits, so the harness adds one.

interface AssignControl {
  /** A refusal the next assign throws once. */
  next: Error | null;
  /** While set, every assign waits on it before it answers. */
  hold: Promise<void> | null;
  /** The user ids each assign was sent for, in order. */
  calls: string[];
}

const assignControl: AssignControl = vi.hoisted(() => ({
  next: null,
  hold: null,
  calls: [],
}));

// The real store, with its assign able to wait and to throw once. The
// mutation hooks load the store through a dynamic import, which this covers.
vi.mock("./leadsDemoStore", async (importOriginal) => {
  const actualStore = await importOriginal<typeof import("./leadsDemoStore")>();
  return {
    ...actualStore,
    demoAssignLeadStaff: async (
      ...assignArguments: Parameters<typeof actualStore.demoAssignLeadStaff>
    ) => {
      assignControl.calls.push(assignArguments[1].userId);
      if (assignControl.hold) await assignControl.hold;
      const refusal = assignControl.next;
      if (refusal !== null) {
        assignControl.next = null;
        throw refusal;
      }
      return actualStore.demoAssignLeadStaff(...assignArguments);
    },
  };
});

const CAVE_ID = "demo-lead-cave-23";
const LUA_ID = "demo-lead-lua-marques";
const VIEWER_NAME = `${currentUser.first} ${currentUser.last}`;

function PanelHarness({ leadId }: { leadId: string }) {
  const { data } = useLead(leadId);
  return data ? <LeadAssigneesPanel lead={data} /> : null;
}

function renderPanel(leadId: string) {
  const user = userEvent.setup();
  render(
    <TestProviders>
      <MotionProvider>
        <PanelHarness leadId={leadId} />
      </MotionProvider>
    </TestProviders>,
  );
  return user;
}

const assigneeIdsOf = (leadId: string) =>
  demoGetLead(leadId).assignees.map((person) => person.id);

describe("LeadAssigneesPanel (demo)", () => {
  beforeEach(() => {
    assignControl.next = null;
    assignControl.hold = null;
    assignControl.calls = [];
    resetDemoLeads();
  });
  afterEach(() => vi.restoreAllMocks());

  it("says nobody is in charge and assigns the viewer from the picker", async () => {
    const user = renderPanel(CAVE_ID);
    expect(
      await screen.findByText("Nobody is in charge yet"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Assign staff" }));
    await user.click(
      await screen.findByRole("option", { name: new RegExp(VIEWER_NAME) }),
    );
    expect(
      await screen.findByRole("button", { name: "Unassign yourself" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("You're in charge of this lead"),
    ).toBeInTheDocument();
    expect(assigneeIdsOf(CAVE_ID)).toEqual([DEMO_LEAD_VIEWER_ID]);
  });

  it("keeps Assign staff in the heading row above the pills", async () => {
    renderPanel(LUA_ID);
    const heading = await screen.findByRole("heading", { name: "In charge" });
    const assignButton = screen.getByRole("button", { name: "Assign staff" });
    const pillList = screen.getByRole("list", { name: "In charge" });
    expect(heading.parentElement).toBe(assignButton.parentElement);
    expect(
      assignButton.compareDocumentPosition(pillList) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows You for the viewer's chip and each name on its Unassign button", async () => {
    renderPanel(LUA_ID);
    expect(await screen.findByText("You")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Unassign yourself" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Unassign Marta Lobo" }),
    ).toBeInTheDocument();
  });

  it("unassigns someone and names them in the toast", async () => {
    const user = renderPanel(LUA_ID);
    await user.click(
      await screen.findByRole("button", { name: "Unassign Marta Lobo" }),
    );
    expect(
      await screen.findByText("Marta Lobo is no longer in charge"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Unassign Marta Lobo" }),
      ).not.toBeInTheDocument(),
    );
    expect(assigneeIdsOf(LUA_ID)).toEqual([DEMO_LEAD_VIEWER_ID]);
  });

  it("sends one write when a second row is pressed while the first is in flight", async () => {
    let release = () => {};
    assignControl.hold = new Promise<void>((resolve) => {
      release = resolve;
    });
    const user = renderPanel(CAVE_ID);
    await user.click(
      await screen.findByRole("button", { name: "Assign staff" }),
    );
    await user.click(await screen.findByRole("option", { name: /Bea Moniz/ }));
    await user.click(screen.getByRole("option", { name: /Duda Fontes/ }));
    release();
    await screen.findByText("Bea Moniz is in charge of this lead");
    expect(assignControl.calls).toEqual(["demo-staff-bea"]);
  });

  it("names the cause when the person cannot be put in charge", async () => {
    assignControl.next = leadRefusal("LEAD_ASSIGNEE_NOT_STAFF", 400, {
      reason: "suspended",
    });
    const user = renderPanel(CAVE_ID);
    await user.click(
      await screen.findByRole("button", { name: "Assign staff" }),
    );
    await user.click(await screen.findByRole("option", { name: /Bea Moniz/ }));
    // The toast region is an alert too, so the refusal is found in the
    // picker.
    const picker = await screen.findByRole("dialog", { name: "Assign staff" });
    expect(await within(picker).findByRole("alert")).toHaveTextContent(
      "This account is suspended, so it can't be put in charge",
    );
  });

  it("closes the picker with Escape and returns focus to Assign staff", async () => {
    const user = renderPanel(CAVE_ID);
    const assignButton = await screen.findByRole("button", {
      name: "Assign staff",
    });
    await user.click(assignButton);
    await screen.findByRole("dialog", { name: "Assign staff" });
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Assign staff" }),
      ).not.toBeInTheDocument(),
    );
    expect(assignButton).toHaveFocus();
  });

  it("opens the picker as a sheet on a phone", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query === LEAD_ASSIGNEE_PHONE_QUERY,
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    );
    const user = renderPanel(CAVE_ID);
    await user.click(
      await screen.findByRole("button", { name: "Assign staff" }),
    );
    const sheet = await screen.findByRole("dialog", { name: "Assign staff" });
    // The Modal head's X and the footer button both read "Close".
    expect(
      within(sheet).getAllByRole("button", { name: "Close" }),
    ).toHaveLength(2);
  });
});
