import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./FormField";

/**
 * The contract these cover: FormField owns the label/control wiring so no call
 * site has to. Before this, the `<label>` had no `htmlFor`, the control had no
 * `id`, the minted error id was referenced by nothing, and `aria-invalid` /
 * `aria-required` were documented but never set — on every form in the app.
 */
describe("FormField", () => {
  it("associates the label with the control", () => {
    render(
      <FormField label="Display name">
        <input type="text" />
      </FormField>,
    );
    // getByLabelText resolves through htmlFor → id, so it only passes if the
    // association is real.
    expect(screen.getByLabelText("Display name")).toBe(
      screen.getByRole("textbox"),
    );
  });

  it("puts helper text in the control's accessible description", () => {
    render(
      <FormField label="Pronouns" helper="Shown on your profile">
        <input type="text" />
      </FormField>,
    );
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "Shown on your profile",
    );
  });

  it("marks an errored control invalid and describes it with the error", () => {
    render(
      <FormField label="Email" error="That address looks incomplete">
        <input type="text" />
      </FormField>,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("That address looks incomplete");
  });

  it("describes the control with helper and error together", () => {
    render(
      <FormField label="Email" helper="We never show this" error="Required">
        <input type="text" />
      </FormField>,
    );
    const description =
      screen.getByRole("textbox").getAttribute("aria-describedby") ?? "";
    expect(description.split(" ")).toHaveLength(2);
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "We never show this Required",
    );
  });

  it("leaves a valid control without aria-invalid", () => {
    render(
      <FormField label="Email">
        <input type="text" />
      </FormField>,
    );
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("sets aria-required when the field is required", () => {
    render(
      <FormField label="Name" required>
        <input type="text" />
      </FormField>,
    );
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-required",
      "true",
    );
  });

  it("keeps a caller-supplied id and points the label at it", () => {
    render(
      <FormField label="Bio" helper="Keep it short">
        <textarea id="profile-bio" />
      </FormField>,
    );
    const textarea = screen.getByLabelText("Bio");
    expect(textarea).toHaveAttribute("id", "profile-bio");
    expect(textarea).toHaveAccessibleDescription("Keep it short");
  });

  it("merges an existing aria-describedby rather than replacing it", () => {
    render(
      <>
        <span id="external-hint">Visible elsewhere</span>
        <FormField label="Handle" helper="Letters and numbers">
          <input type="text" aria-describedby="external-hint" />
        </FormField>
      </>,
    );
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "Visible elsewhere Letters and numbers",
    );
  });

  it("wires a <select> child the same way", () => {
    render(
      <FormField label="City" required>
        <select>
          <option>Lisboa</option>
        </select>
      </FormField>,
    );
    // The visible required marker is aria-hidden but still part of the label's
    // text content, so match loosely.
    const select = screen.getByLabelText(/City/);
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveAttribute("aria-required", "true");
  });

  it("degrades gracefully when the child is not a single native element", () => {
    // A custom component may not spread unknown props, so nothing is injected
    // and the label carries no dangling htmlFor. It must still render.
    function CustomControl() {
      return <div data-testid="custom" role="group" />;
    }
    const { container } = render(
      <FormField
        label="Interests"
        helper="Pick a few"
        error="Pick at least one"
      >
        <CustomControl />
      </FormField>,
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(container.querySelector("label")).not.toHaveAttribute("for");
    expect(screen.getByText("Pick at least one")).toBeInTheDocument();
  });

  it("degrades gracefully with multiple children", () => {
    const { container } = render(
      <FormField label="Range">
        <input type="text" aria-label="From" />
        <input type="text" aria-label="To" />
      </FormField>,
    );
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    expect(container.querySelector("label")).not.toHaveAttribute("for");
  });
});
