import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { subprofiles as enSubprofiles } from "../../shared/i18n/catalogs/en/subprofiles";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { EditorConflictAlert } from "./EditorConflictAlert";
import {
  SubprofileEditorContext,
  type SubprofileEditorContextValue,
} from "./subprofileEditorContext";
import type { PendingChange } from "./subprofileEditorDiff";

/**
 * ENG-451: the save-conflict alert, rendered against a stub editor context
 * inside a `.savebar`, the way every savebar layout mounts it. The copy
 * assertions read the EN catalog strings for `subprofiles:editConflict.*`,
 * so a copy edit there keeps these specs meaningful.
 */

type AlertContext = Pick<
  SubprofileEditorContextValue,
  | "hasEditConflict"
  | "dirty"
  | "pending"
  | "reloadLatest"
  | "isReloading"
  | "hasReloadFailed"
  | "reloadGeneration"
>;

/** The EN catalog string for `key`. Catalog lookups are typed optional, so
 *  this narrows them once and fails loudly if a key goes missing. */
function copy(key: string): string {
  const value = enSubprofiles[key];
  if (value === undefined) {
    throw new Error(`Missing EN catalog key: subprofiles:${key}`);
  }
  return value;
}

const TAGLINE_CHANGE: PendingChange = {
  area: { kind: "meta" },
  areaLabelKey: "subprofiles:pending.area.meta",
  summaryKey: "subprofiles:pending.metaEdited",
  params: { field: "subprofiles:pending.field.tagline" },
};

function contextValue(overrides: Partial<AlertContext>) {
  const value: AlertContext = {
    hasEditConflict: true,
    dirty: true,
    pending: [TAGLINE_CHANGE],
    reloadLatest: vi.fn(),
    isReloading: false,
    hasReloadFailed: false,
    reloadGeneration: 0,
    ...overrides,
  };
  // The alert reads only the fields above.
  return value as SubprofileEditorContextValue;
}

function Harness({ value }: { value: SubprofileEditorContextValue }) {
  return (
    <TestProviders>
      <SubprofileEditorContext.Provider value={value}>
        <label>
          Name
          <input />
        </label>
        <div className="savebar">
          <button type="button">Save</button>
          <EditorConflictAlert />
        </div>
      </SubprofileEditorContext.Provider>
    </TestProviders>
  );
}

const reloadButton = () => screen.getByRole("button", { name: /reload/i });

/** The savebar the alert renders in. The toast deck's own assertive region
 *  also carries role=alert, so alert queries stay inside the bar. */
function savebar(): HTMLElement {
  const element = document.querySelector<HTMLElement>(".savebar");
  if (!element) throw new Error("Expected the harness savebar");
  return element;
}

/** Renders the harness and waits for the subprofiles catalog, which loads
 *  on demand, so the alert's copy and the Reload label are painted. */
async function renderHarness(value: SubprofileEditorContextValue) {
  const view = render(<Harness value={value} />);
  await awaitCatalog("subprofiles");
  return view;
}

describe("EditorConflictAlert (ENG-451)", () => {
  it("renders nothing while there is no conflict", async () => {
    await renderHarness(contextValue({ hasEditConflict: false }));
    expect(within(savebar()).queryByRole("alert")).toBeNull();
  });

  it("renders a role=alert with the title and the body, and Reload beside it", async () => {
    await renderHarness(contextValue({}));
    const alert = within(savebar()).getByRole("alert");
    expect(alert).toHaveTextContent(copy("editConflict.title"));
    expect(alert).toHaveTextContent(copy("editConflict.body"));
    expect(reloadButton()).toBeInTheDocument();
  });

  it("keeps the controls out of the live region, so a moving count is not read out", async () => {
    await renderHarness(contextValue({}));
    expect(
      within(within(savebar()).getByRole("alert")).queryByRole("button"),
    ).toBeNull();
  });

  it("folds the unsaved list behind a toggle that opens it for copying", async () => {
    await renderHarness(contextValue({}));
    const toggle = screen.getByRole("button", { name: /unsaved/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Tagline edited")).not.toBeVisible();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Tagline edited")).toBeVisible();
  });

  it("shows no unsaved toggle once the editor is clean", async () => {
    await renderHarness(contextValue({ dirty: false, pending: [] }));
    expect(screen.queryByRole("button", { name: /unsaved/i })).toBeNull();
    expect(reloadButton()).toBeInTheDocument();
  });

  it("moves focus to Reload when the conflict lands while focus is in the savebar", async () => {
    const { rerender } = await renderHarness(
      contextValue({ hasEditConflict: false }),
    );
    screen.getByRole("button", { name: "Save" }).focus();

    rerender(<Harness value={contextValue({})} />);

    expect(reloadButton()).toHaveFocus();
  });

  it("moves focus to Reload when the conflict lands with focus on the page body", async () => {
    const { rerender } = await renderHarness(
      contextValue({ hasEditConflict: false }),
    );
    expect(document.activeElement).toBe(document.body);

    rerender(<Harness value={contextValue({})} />);

    expect(reloadButton()).toHaveFocus();
  });

  it("leaves focus where it is when the member is working in a field", async () => {
    const { rerender } = await renderHarness(
      contextValue({ hasEditConflict: false }),
    );
    const nameField = screen.getByRole("textbox", { name: "Name" });
    nameField.focus();

    rerender(<Harness value={contextValue({})} />);

    expect(nameField).toHaveFocus();
  });

  it("hands focus back to Reload when the bar changes and leaves focus on the body", async () => {
    const { rerender } = await renderHarness(contextValue({}));
    screen.getByRole("textbox", { name: "Name" }).focus();
    (document.activeElement as HTMLElement).blur();

    rerender(<Harness value={contextValue({ dirty: false })} />);

    expect(reloadButton()).toHaveFocus();
  });

  it("calls reloadLatest on press and ignores a press while a reload runs", async () => {
    const reloadLatest = vi.fn();
    const { rerender } = await renderHarness(contextValue({ reloadLatest }));
    fireEvent.click(reloadButton());
    expect(reloadLatest).toHaveBeenCalledTimes(1);

    rerender(
      <Harness value={contextValue({ reloadLatest, isReloading: true })} />,
    );
    fireEvent.click(reloadButton());

    expect(reloadLatest).toHaveBeenCalledTimes(1);
    expect(reloadButton()).toHaveAttribute("aria-busy", "true");
    expect(reloadButton()).toBeEnabled();
  });

  it("says the reload failed, keeping the alert and Reload on screen", async () => {
    await renderHarness(contextValue({ hasReloadFailed: true }));
    expect(within(savebar()).getByRole("alert")).toHaveTextContent(
      copy("editConflict.reloadFailed"),
    );
    expect(reloadButton()).toBeInTheDocument();
  });
});
