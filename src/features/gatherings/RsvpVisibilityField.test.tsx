import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { RsvpDetailsVisibility } from "./api/events.api";
import { RsvpVisibilityField } from "./RsvpVisibilityField";
import { awaitCatalog } from "../../test/awaitCatalog";

/**
 * "Who can see you're going?" in both RSVP details modals (PRD-414). The
 * options are a radiogroup of full-width rows, each with its own scope line,
 * named by the visible question and described by the privacy note.
 */
async function renderField(
  value: RsvpDetailsVisibility,
  onChange = vi.fn<(visibility: RsvpDetailsVisibility) => void>(),
) {
  render(
    <TestProviders>
      <RsvpVisibilityField
        value={value}
        onChange={onChange}
        note="The hosts always see what you write here."
      />
    </TestProviders>,
  );
  await awaitCatalog("gatherings");
  return onChange;
}

describe("RsvpVisibilityField", () => {
  it("names the group by the question and describes it by the note", async () => {
    await renderField("everyone");
    const group = screen.getByRole("radiogroup", {
      name: "Who can see you're going?",
    });
    expect(group).toHaveAccessibleDescription(
      "The hosts always see what you write here.",
    );
  });

  it("offers the three choices in order and marks the saved one", async () => {
    await renderField("connections");
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(radios[0]).toHaveTextContent("Everyone");
    expect(radios[1]).toHaveTextContent("My connections");
    expect(radios[2]).toHaveTextContent("Only the hosts");
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
  });

  it("gives each choice its own scope line", async () => {
    await renderField("everyone");
    expect(
      screen.getByRole("radio", { name: /Only the hosts/ }),
    ).toHaveTextContent("Your name stays off the guest list");
  });

  it("reports the canonical id of the tapped choice", async () => {
    const onChange = await renderField("everyone");
    fireEvent.click(screen.getByRole("radio", { name: /Only the hosts/ }));
    expect(onChange).toHaveBeenCalledWith("justMe");
  });
});
