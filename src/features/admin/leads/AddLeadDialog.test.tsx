import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { EMPTY_LEAD_FILTERS } from "./api/leads.types";
import { AddLeadDialog } from "./AddLeadDialog";
import { adminLeadPath } from "./leadPaths";
import { demoListLeads, resetDemoLeads } from "./leadsDemoStore";

// TestProviders forces demo mode, so the dialog writes to the demo leads
// store.

const CAVE_23_INSTAGRAM = "https://instagram.com/cave23.demo";

interface CreateHold {
  pending: Promise<void> | null;
}

const createHold: CreateHold = vi.hoisted(() => ({ pending: null }));

// The real store, with its create able to wait on `createHold.pending`. The
// create hook loads the store through a dynamic import, which this covers.
vi.mock("./leadsDemoStore", async (importOriginal) => {
  const actualStore = await importOriginal<typeof import("./leadsDemoStore")>();
  return {
    ...actualStore,
    demoCreateLead: async (
      ...createArguments: Parameters<typeof actualStore.demoCreateLead>
    ) => {
      if (createHold.pending) await createHold.pending;
      return actualStore.demoCreateLead(...createArguments);
    },
  };
});

function renderDialog() {
  const onClose = vi.fn();
  render(
    <TestProviders>
      <AddLeadDialog onClose={onClose} />
    </TestProviders>,
  );
  return { onClose, user: userEvent.setup() };
}

/** The admin namespace loads lazily, so every test waits for the title. */
async function waitForDialog(): Promise<HTMLElement> {
  return screen.findByRole("dialog", { name: "Add lead" });
}

async function chooseType(user: UserEvent, typeLabel: string) {
  await user.click(screen.getByRole("button", { name: /^Type/ }));
  await user.click(await screen.findByRole("option", { name: typeLabel }));
}

function nameInput(): HTMLElement {
  return screen.getByRole("textbox", { name: /^Name/ });
}

function submitButton(dialog: HTMLElement): HTMLElement {
  const buttons = within(dialog).getAllByRole("button", { name: "Add lead" });
  const submit = buttons.at(-1);
  if (submit === undefined) throw new Error("The Add lead button is missing");
  return submit;
}

function leadCount(): number {
  return demoListLeads(EMPTY_LEAD_FILTERS).totalCount;
}

/** The element at `index`, failing the test by name when the list is
 *  shorter. */
function elementAt(elements: HTMLElement[], index: number): HTMLElement {
  const element = elements.at(index);
  if (element === undefined) {
    throw new Error(`Expected an element at index ${index}`);
  }
  return element;
}

describe("AddLeadDialog", () => {
  beforeEach(() => {
    createHold.pending = null;
    resetDemoLeads();
  });

  it("focuses the name field when it opens", async () => {
    renderDialog();
    await waitForDialog();
    await waitFor(() => expect(nameInput()).toHaveFocus());
  });

  it("adds a lead and closes", async () => {
    const { onClose, user } = renderDialog();
    const dialog = await waitForDialog();
    await user.type(nameInput(), "Nova Onda");
    await chooseType(user, "Band");
    await user.click(submitButton(dialog));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByText("Nova Onda is in the leads"),
    ).toBeInTheDocument();
    const added = demoListLeads(EMPTY_LEAD_FILTERS).items.find(
      (item) => item.name === "Nova Onda",
    );
    expect(added?.type).toBe("band");
    expect(added?.stage).toBe("to_contact");
  });

  it("submits through the form so Enter adds the lead", async () => {
    const { onClose, user } = renderDialog();
    const dialog = await waitForDialog();
    const formElement = nameInput().closest("form");
    if (formElement === null) throw new Error("The lead form is missing");
    // The footer's Add lead is the form's own submit button, so a browser
    // submits the form on Enter in any field. jsdom's user-event only finds
    // submit buttons inside the form, so the submit is fired directly.
    const footerSubmit = submitButton(dialog);
    if (!(footerSubmit instanceof HTMLButtonElement)) {
      throw new Error("Add lead is not a button");
    }
    expect(footerSubmit).toHaveAttribute("type", "submit");
    expect(footerSubmit).toHaveAttribute("form", formElement.id);
    expect(footerSubmit.form).toBe(formElement);
    await user.type(nameInput(), "Nova Onda");
    await chooseType(user, "Band");
    fireEvent.submit(formElement);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(
      demoListLeads(EMPTY_LEAD_FILTERS).items.some(
        (item) => item.name === "Nova Onda",
      ),
    ).toBe(true);
  });

  it("keeps the dialog open while the lead is being added", async () => {
    let release: () => void = () => {};
    createHold.pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const { onClose, user } = renderDialog();
    const dialog = await waitForDialog();
    await user.type(nameInput(), "Nova Onda");
    await chooseType(user, "Band");
    await user.click(submitButton(dialog));
    const cancelButton = within(dialog).getByRole("button", { name: "Cancel" });
    await waitFor(() =>
      expect(cancelButton).toHaveAttribute("aria-disabled", "true"),
    );
    await user.click(cancelButton);
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
    release();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByText("Nova Onda is in the leads"),
    ).toBeInTheDocument();
  });

  it("names a missing name before sending", async () => {
    const { onClose, user } = renderDialog();
    const dialog = await waitForDialog();
    const countBefore = leadCount();
    await chooseType(user, "Band");
    await user.click(submitButton(dialog));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Add a name for this lead",
    );
    expect(nameInput()).toHaveAttribute("aria-invalid", "true");
    expect(leadCount()).toBe(countBefore);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("offers Open with the other lead's name on a taken email", async () => {
    const { onClose, user } = renderDialog();
    const dialog = await waitForDialog();
    const countBefore = leadCount();
    await user.type(nameInput(), "Nova Onda");
    await chooseType(user, "Band");
    await user.type(
      screen.getByRole("textbox", { name: /^Email/ }),
      "bookings@cave23.example",
    );
    await user.click(submitButton(dialog));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cave 23 already has this email",
    );
    expect(screen.getByRole("link", { name: "Open Cave 23" })).toHaveAttribute(
      "href",
      adminLeadPath("demo-lead-cave-23"),
    );
    expect(leadCount()).toBe(countBefore);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows the taken link under the row that holds it with Open Cave 23", async () => {
    const { user } = renderDialog();
    const dialog = await waitForDialog();
    await user.type(nameInput(), "Nova Onda");
    await chooseType(user, "Band");
    const addLink = screen.getByRole("button", { name: "Add link" });
    await user.click(addLink);
    await user.click(addLink);
    // Link 1 stays blank, so it is never sent and the refusal's index
    // counts from Link 2.
    await user.type(screen.getByLabelText("Link 2"), "https://ok.example");
    await user.type(screen.getByLabelText("Link 3"), CAVE_23_INSTAGRAM);
    await user.click(submitButton(dialog));
    await screen.findByRole("alert");
    const linkRows = within(
      screen.getByRole("group", { name: "Links" }),
    ).getAllByRole("listitem");
    expect(linkRows).toHaveLength(3);
    expect(within(elementAt(linkRows, 0)).queryByRole("alert")).toBeNull();
    expect(within(elementAt(linkRows, 1)).queryByRole("alert")).toBeNull();
    const takenRow = elementAt(linkRows, 2);
    expect(within(takenRow).getByRole("alert")).toHaveTextContent(
      "Cave 23 already has this link",
    );
    expect(
      within(takenRow).getByRole("link", { name: "Open Cave 23" }),
    ).toHaveAttribute("href", adminLeadPath("demo-lead-cave-23"));
    expect(screen.getByLabelText("Link 3")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
