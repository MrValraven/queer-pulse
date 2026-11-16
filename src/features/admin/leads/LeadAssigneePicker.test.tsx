import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { currentUser } from "../../members/data/demoCurrentUser";
import type { LeadStaffSummaryDTO } from "./api/leads.types";
import { LeadAssigneePicker } from "./LeadAssigneePicker";
import { LeadAssigneePopover } from "./LeadAssigneePopover";
import type { LeadFieldError } from "./leadForm.model";
import { DEMO_LEAD_STAFF, DEMO_LEAD_VIEWER_ID } from "./leadsDemo.data";
import { demoStaffSummaryOf } from "./leadsDemoStaff";
import { demoGetLead, resetDemoLeads } from "./leadsDemoStore";

// TestProviders forces demo mode, so the picker searches the demo staff.

/** How many demo staff searches still throw before the store answers. */
const searchFailures = vi.hoisted(() => ({ remaining: 0 }));

/** While set, the demo staff search answers this many people at most. */
const searchSize = vi.hoisted(() => ({ limit: null as number | null }));

vi.mock("./leadsDemoStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./leadsDemoStore")>();
  return {
    ...actual,
    demoSearchLeadStaff: (query: string) => {
      if (searchFailures.remaining > 0) {
        searchFailures.remaining -= 1;
        throw new Error("demo staff search failed on purpose");
      }
      const results = actual.demoSearchLeadStaff(query);
      return searchSize.limit === null
        ? results
        : results.slice(0, searchSize.limit);
    },
  };
});

const VIEWER_NAME = `${currentUser.first} ${currentUser.last}`;
const onToggle = vi.fn();

function MotionWrapper({ children }: { children: ReactNode }) {
  return (
    <TestProviders>
      <MotionProvider>{children}</MotionProvider>
    </TestProviders>
  );
}

async function renderPicker({
  assignees,
  error = null,
}: {
  assignees: readonly LeadStaffSummaryDTO[];
  error?: LeadFieldError | null;
}) {
  const user = userEvent.setup();
  render(
    <LeadAssigneePicker
      assignees={assignees}
      viewerId={DEMO_LEAD_VIEWER_ID}
      isBusy={false}
      error={error}
      onToggle={onToggle}
    />,
    { wrapper: MotionWrapper },
  );
  await awaitCatalog("admin", "shared");
  return user;
}

function PopoverHarness({
  onClose,
}: {
  onClose: (shouldRestoreFocus: boolean) => void;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={anchorRef} type="button">
        Anchor
      </button>
      <p>Outside</p>
      <LeadAssigneePopover
        anchorRef={anchorRef}
        label="Assign staff"
        onClose={onClose}
      >
        <input aria-label="Probe" />
      </LeadAssigneePopover>
    </>
  );
}

/** The caller's mount: a toggle anchor and the panel under AnimatePresence,
 *  keyed so a quick reopen lands on the exiting instance. */
function ReopenHarness({
  onClose,
}: {
  onClose: (shouldRestoreFocus: boolean) => void;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        Anchor
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <LeadAssigneePopover
            key="popover"
            anchorRef={anchorRef}
            label="Assign staff"
            onClose={(shouldRestoreFocus) => {
              onClose(shouldRestoreFocus);
              setIsOpen(false);
            }}
          >
            <input aria-label="Probe" />
          </LeadAssigneePopover>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function renderPopover({
  onClose,
}: {
  onClose: (shouldRestoreFocus: boolean) => void;
}) {
  const user = userEvent.setup();
  render(<PopoverHarness onClose={onClose} />, { wrapper: MotionWrapper });
  return user;
}

beforeEach(() => {
  resetDemoLeads();
  searchFailures.remaining = 0;
  searchSize.limit = null;
  onToggle.mockReset();
});

describe("LeadAssigneePicker", () => {
  it("previews five staff with the viewer first and marked You", async () => {
    await renderPicker({ assignees: [] });
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveTextContent(VIEWER_NAME);
    expect(options[0]).toHaveTextContent("You");
    expect(
      screen.getByText("Search to find more of the team"),
    ).toBeInTheDocument();
  });

  it("leaves the search hint out for a team that fits in the preview", async () => {
    searchSize.limit = 3;
    await renderPicker({ assignees: [] });
    expect(await screen.findAllByRole("option")).toHaveLength(3);
    expect(
      screen.queryByText("Search to find more of the team"),
    ).not.toBeInTheDocument();
  });

  it("checks current assignees and reports each toggle", async () => {
    const user = await renderPicker({
      assignees: demoGetLead("demo-lead-lua-marques").assignees,
    });
    const marta = await screen.findByRole("option", { name: /Marta Lobo/ });
    expect(marta).toHaveAttribute("aria-selected", "true");
    await user.click(await screen.findByRole("option", { name: /Bea Moniz/ }));
    expect(onToggle).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "demo-staff-bea" }),
      false,
    );
    await user.click(marta);
    expect(onToggle).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "demo-staff-marta" }),
      true,
    );
  });

  it("finds the rest of the team by search", async () => {
    const user = await renderPicker({ assignees: [] });
    await user.type(
      screen.getByRole("searchbox", { name: "Search staff" }),
      "rafa",
    );
    expect(
      await screen.findByRole("option", { name: /Rafa Quintas/ }),
    ).toBeInTheDocument();
  });

  it("names the search when nobody matches", async () => {
    const user = await renderPicker({ assignees: [] });
    await user.type(
      screen.getByRole("searchbox", { name: "Search staff" }),
      "zzzz",
    );
    expect(
      await screen.findByText("No staff with Leads access match zzzz"),
    ).toBeInTheDocument();
  });

  it("disables unchecked rows and names the limit at ten", async () => {
    const extras: LeadStaffSummaryDTO[] = [
      "extra-1",
      "extra-2",
      "extra-3",
      "extra-4",
    ].map((id) => ({
      id,
      slug: `${id}-demo`,
      displayName: `Extra ${id}`,
      avatarUrl: null,
      avatarCrop: null,
    }));
    const staffSummaries = DEMO_LEAD_STAFF.map((person) =>
      demoStaffSummaryOf(person.id),
    ).filter((summary): summary is LeadStaffSummaryDTO => summary !== null);
    const tenAssignees = [...staffSummaries, ...extras];
    expect(tenAssignees).toHaveLength(10);
    await renderPicker({ assignees: tenAssignees });
    expect(
      await screen.findByRole("option", { name: new RegExp(VIEWER_NAME) }),
    ).toBeDisabled();
    expect(screen.getByRole("option", { name: /Marta Lobo/ })).toBeEnabled();
    expect(
      screen.getByText(
        "A lead can have up to 10 people in charge. Unassign someone to add another",
      ),
    ).toBeInTheDocument();
  });

  it("names the cause and loads again when the staff list fails", async () => {
    searchFailures.remaining = 1;
    const user = await renderPicker({ assignees: [] });
    expect(
      await screen.findByText("We couldn't load the staff list"),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Load the staff list again" }),
    );
    expect(await screen.findAllByRole("option")).toHaveLength(5);
  });

  it("shows a refusal under the list", async () => {
    await renderPicker({
      assignees: [],
      error: {
        field: null,
        rowIndex: null,
        messageKey: "admin:leads.error.assigneeNotStaff.suspended",
        values: {},
        openLeadId: null,
        openLeadName: null,
      },
    });
    // ToastProvider keeps its own empty alert region, so the line is found
    // by its words and checked for its role.
    expect(
      screen.getByText(
        "This account is suspended, so it can't be put in charge",
      ),
    ).toHaveAttribute("role", "alert");
  });
});

describe("LeadAssigneePopover", () => {
  it("closes and returns to the anchor on Tab past its last field", async () => {
    const onClose = vi.fn();
    const user = renderPopover({ onClose });
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Probe" })).toHaveFocus(),
    );
    await user.tab();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it("focuses the first field inside once it is placed", async () => {
    renderPopover({ onClose: vi.fn() });
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Probe" })).toHaveFocus(),
    );
  });

  it("closes the popover on Escape and asks to restore focus", async () => {
    const onClose = vi.fn();
    const user = renderPopover({ onClose });
    expect(
      screen.getByRole("dialog", { name: "Assign staff" }),
    ).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it("closes the popover on a press outside", async () => {
    const onClose = vi.fn();
    const user = renderPopover({ onClose });
    await user.click(screen.getByText("Outside"));
    expect(onClose).toHaveBeenCalledWith(false);
  });

  it("closes again with Escape after a reopen during its exit", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ReopenHarness onClose={onClose} />, { wrapper: MotionWrapper });
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Probe" })).toHaveFocus(),
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Anchor" }));
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Probe" })).toHaveFocus(),
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("stays open on a press on its anchor", async () => {
    const onClose = vi.fn();
    const user = renderPopover({ onClose });
    await user.click(screen.getByRole("button", { name: "Anchor" }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
