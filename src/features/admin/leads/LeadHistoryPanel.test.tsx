import { QueryClient } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { currentUser } from "../../members/data/demoCurrentUser";
import { leadKeys } from "./api/leadKeys";
import { LEAD_NOTE_MAX, type LeadDTO } from "./api/leads.types";
import { useLead } from "./api/useLead";
import { LeadHistoryPanel } from "./LeadHistoryPanel";
import { demoGetLead, resetDemoLeads } from "./leadsDemoStore";

// TestProviders forces demo mode, so the panel reads and writes the demo
// leads store.

const CAVE_ID = "demo-lead-cave-23";
const AFTERHOURS_ID = "demo-lead-afterhours";
const VIEWER_NAME = `${currentUser.first} ${currentUser.last}`;
const NEWEST_CAVE_NOTE = "Waiting on their door split proposal";

/** Reads the lead the way the page does, then draws only its history. */
function HistoryHarness({ leadId }: { leadId: string }) {
  const { data } = useLead(leadId);
  return data ? <LeadHistoryPanel lead={data} /> : null;
}

function renderHistory(leadId: string, queryClient?: QueryClient) {
  const user = userEvent.setup();
  render(
    <TestProviders queryClient={queryClient}>
      <HistoryHarness leadId={leadId} />
    </TestProviders>,
  );
  return user;
}

const historyItems = () =>
  within(screen.getByRole("list", { name: "History" })).getAllByRole(
    "listitem",
  );

/** The element at `index`, failing the test by name when the list is
 *  shorter. */
function elementAt(elements: HTMLElement[], index: number): HTMLElement {
  const element = elements.at(index);
  if (element === undefined) {
    throw new Error(`Expected an element at index ${index}`);
  }
  return element;
}

/** The newest entry: the history reads newest first. */
const newestHistoryItem = () => elementAt(historyItems(), 0);

/** The textarea labelled `label`, failing the test by name when the label
 *  points at something else. */
function textareaLabelled(label: string): HTMLTextAreaElement {
  const element = screen.getByLabelText(label);
  if (!(element instanceof HTMLTextAreaElement)) {
    throw new Error(`"${label}" does not label a textarea`);
  }
  return element;
}

/** The history item holding `text`. */
const itemWith = (text: string): HTMLElement => {
  const item = historyItems().find((candidate) =>
    within(candidate).queryByText(text),
  );
  if (!item) throw new Error(`No history item reads "${text}"`);
  return item;
};

const noteCountOf = (leadId: string) =>
  demoGetLead(leadId).entries.filter((entry) => entry.kind === "note").length;

describe("LeadHistoryPanel (demo)", () => {
  beforeEach(() => resetDemoLeads());

  it("adds a note at the top", async () => {
    const user = renderHistory(CAVE_ID);
    const addNote = await screen.findByRole("button", { name: "Add note" });
    expect(addNote).toHaveAttribute("aria-disabled", "true");

    const composer = screen.getByLabelText("New note");
    await user.type(composer, "Sent the rider");
    expect(addNote).not.toHaveAttribute("aria-disabled");
    await user.click(addNote);

    await waitFor(() =>
      expect(newestHistoryItem()).toHaveTextContent("Sent the rider"),
    );
    expect(newestHistoryItem()).toHaveTextContent(VIEWER_NAME);
    expect(composer).toHaveValue("");
  });

  it("edits a note and marks it edited", async () => {
    const user = renderHistory(CAVE_ID);
    await screen.findByText(NEWEST_CAVE_NOTE);
    expect(newestHistoryItem()).toHaveTextContent(NEWEST_CAVE_NOTE);

    await user.click(
      within(newestHistoryItem()).getByRole("button", { name: "Edit note" }),
    );
    const editor = screen.getByLabelText("Edit this note");
    await user.clear(editor);
    await user.type(editor, "Door split agreed at 70 30");
    await user.click(screen.getByRole("button", { name: "Save note" }));

    const editedItem = await waitFor(() =>
      itemWith("Door split agreed at 70 30"),
    );
    expect(within(editedItem).getByText("edited")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText(NEWEST_CAVE_NOTE)).not.toBeInTheDocument(),
    );
    expect(
      demoGetLead(CAVE_ID).entries.find((entry) => entry.kind === "note")?.body,
    ).toBe("Door split agreed at 70 30");
  });

  it("opens the note editor with the caret after the last word", async () => {
    const user = renderHistory(CAVE_ID);
    await screen.findByText(NEWEST_CAVE_NOTE);

    await user.click(
      within(newestHistoryItem()).getByRole("button", { name: "Edit note" }),
    );
    const editor = textareaLabelled("Edit this note");
    await waitFor(() => expect(editor).toHaveFocus());
    expect(editor.value).toBe(NEWEST_CAVE_NOTE);
    expect(editor.selectionStart).toBe(editor.value.length);
    expect(editor.selectionEnd).toBe(editor.value.length);

    // Typing adds to the end of the note.
    await user.keyboard(" today");
    expect(editor).toHaveValue(`${NEWEST_CAVE_NOTE} today`);
  });

  it("deletes a note after the confirm", async () => {
    const user = renderHistory(CAVE_ID);
    await screen.findByText(NEWEST_CAVE_NOTE);
    const notesBefore = noteCountOf(CAVE_ID);

    await user.click(
      within(itemWith(NEWEST_CAVE_NOTE)).getByRole("button", {
        name: "Delete note",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Delete this note",
    });
    await user.click(
      within(dialog).getByRole("button", { name: "Delete note" }),
    );

    await waitFor(() =>
      expect(screen.queryByText(NEWEST_CAVE_NOTE)).not.toBeInTheDocument(),
    );
    expect(noteCountOf(CAVE_ID)).toBe(notesBefore - 1);
    // Delete note left with its note, so focus lands on the new note box.
    await waitFor(() =>
      expect(screen.getByLabelText("New note")).toHaveFocus(),
    );
  });

  it("hides note controls when canEdit is false", async () => {
    const storedLead = demoGetLead(CAVE_ID);
    const lockedLead: LeadDTO = {
      ...storedLead,
      entries: storedLead.entries.map((entry) => ({
        ...entry,
        canEdit: false,
      })),
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(leadKeys.detail(CAVE_ID, true), lockedLead);

    renderHistory(CAVE_ID, queryClient);

    expect(await screen.findByText(NEWEST_CAVE_NOTE)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit note" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete note" }),
    ).not.toBeInTheDocument();
  });

  it("reads a blank author name as a former team member", async () => {
    const storedLead = demoGetLead(CAVE_ID);
    const [newestEntry, ...olderEntries] = storedLead.entries;
    if (newestEntry?.author == null) {
      throw new Error("The newest Cave 23 entry should have an author");
    }
    const blankAuthorLead: LeadDTO = {
      ...storedLead,
      entries: [
        { ...newestEntry, author: { ...newestEntry.author, displayName: " " } },
        ...olderEntries,
      ],
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(leadKeys.detail(CAVE_ID, true), blankAuthorLead);

    renderHistory(CAVE_ID, queryClient);

    await screen.findByText(NEWEST_CAVE_NOTE);
    expect(
      within(newestHistoryItem()).getByText("A former team member"),
    ).toBeInTheDocument();
  });

  it("shows the gone persona line in the history", async () => {
    renderHistory(AFTERHOURS_ID);
    // The seed wrote that link from an account that is gone too, so the
    // line names neither the persona nor the author by name.
    expect(
      await screen.findByText(
        "A former team member linked a persona that is no longer available",
      ),
    ).toBeInTheDocument();
  });

  it("names the cause when the note is too long", async () => {
    const user = renderHistory(CAVE_ID);
    const composer = await screen.findByLabelText("New note");
    const notesBefore = noteCountOf(CAVE_ID);

    fireEvent.change(composer, {
      target: { value: "a".repeat(LEAD_NOTE_MAX + 1) },
    });
    // The line names the limit as soon as the box passes it, and Add note
    // stays unavailable until the note is short enough.
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Notes can be up to 4000 characters",
    );
    const addNote = screen.getByRole("button", { name: "Add note" });
    expect(addNote).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("4001 of 4000")).toHaveAttribute("data-over");
    await user.click(addNote);
    expect(composer).toHaveAttribute("aria-invalid", "true");
    expect(noteCountOf(CAVE_ID)).toBe(notesBefore);
  });
});
