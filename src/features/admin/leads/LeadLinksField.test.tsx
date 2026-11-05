import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { LEAD_LINKS_MAX } from "./api/leads.types";
import {
  emptyLeadFormValues,
  newLeadLinkRow,
  type LeadFieldError,
  type LeadFormValues,
} from "./leadForm.model";
import { LeadLinksField } from "./LeadLinksField";

const openLeadPath = (leadId: string) => `/admin/leads/${leadId}`;

/** Holds the form values in state, as a real form does. */
function LinksHarness({
  initialLinks,
  fieldError = null,
}: {
  initialLinks: string[];
  fieldError?: LeadFieldError | null;
}) {
  const [values, setValues] = useState<LeadFormValues>(() => ({
    ...emptyLeadFormValues(),
    links: initialLinks.map((text) => newLeadLinkRow(text)),
  }));
  return (
    <LeadLinksField
      idPrefix="test-lead"
      values={values}
      onChange={setValues}
      fieldError={fieldError}
      openLeadPath={openLeadPath}
    />
  );
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

/** Renders the field and waits until the admin catalog has loaded (the
 *  first render shows raw keys), so every query after it reads real copy. */
async function renderLinks(
  initialLinks: string[],
  fieldError: LeadFieldError | null = null,
) {
  render(
    <TestProviders>
      <LinksHarness initialLinks={initialLinks} fieldError={fieldError} />
    </TestProviders>,
  );
  await screen.findByRole("button", { name: "Add link" });
  return userEvent.setup();
}

describe("LeadLinksField", () => {
  it("adds a row with Add link and focuses it", async () => {
    const user = await renderLinks([""]);
    await user.click(screen.getByRole("button", { name: "Add link" }));
    expect(screen.getByLabelText("Link 1")).toBeInTheDocument();
    const secondInput = screen.getByLabelText("Link 2");
    await waitFor(() => expect(secondInput).toHaveFocus());
  });

  it("shows the detected platform for a typed link", async () => {
    const user = await renderLinks([""]);
    await user.type(screen.getByLabelText("Link 1"), "soundcloud.com/x");
    const openLink = await screen.findByRole("link", {
      name: "Open link 1 in a new tab",
    });
    expect(openLink).toHaveAttribute("href", "https://soundcloud.com/x");
    expect(openLink).toHaveAttribute("target", "_blank");
  });

  it("removes a row with Remove link", async () => {
    const user = await renderLinks([
      "instagram.com/first",
      "instagram.com/second",
    ]);
    await user.click(screen.getByRole("button", { name: "Remove link 1" }));
    await waitFor(() => expect(screen.getAllByRole("textbox")).toHaveLength(1));
    expect(screen.getByRole("textbox")).toHaveValue("instagram.com/second");
  });

  it("stops at twelve links and says so", async () => {
    const user = await renderLinks(
      Array.from(
        { length: LEAD_LINKS_MAX },
        (_unused, index) => `example.com/${index}`,
      ),
    );
    expect(screen.getAllByRole("textbox")).toHaveLength(12);
    const addButton = screen.getByRole("button", { name: "Add link" });
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("A lead holds up to 12 links")).toBeInTheDocument();
    await user.click(addButton);
    expect(screen.getAllByRole("textbox")).toHaveLength(12);
  });

  it("puts a refusal under the row it names", async () => {
    await renderLinks(["instagram.com/first", "ra.co/dj/cave"], {
      field: "links",
      rowIndex: 1,
      messageKey: "admin:leads.error.linkTaken",
      values: { name: "Cave 23" },
      openLeadId: "lead-4",
      openLeadName: "Cave 23",
    });
    const rows = screen.getAllByRole("listitem");
    const firstRow = elementAt(rows, 0);
    const secondRow = elementAt(rows, 1);
    expect(within(firstRow).queryByRole("alert")).toBeNull();
    expect(within(secondRow).getByRole("alert")).toHaveTextContent(
      "Cave 23 already has this link",
    );
    expect(
      within(secondRow).getByRole("link", { name: "Open Cave 23" }),
    ).toHaveAttribute("href", openLeadPath("lead-4"));
    expect(screen.getByLabelText("Link 2")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
