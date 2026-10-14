import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioScheduleForm } from "./StudioScheduleForm";

const now = new Date(2026, 9, 13, 10, 0);

function renderForm(onSubmit = vi.fn()) {
  render(
    <TestProviders>
      <StudioScheduleForm
        submitLabelKey="studio:schedule.form.scheduleCta"
        isWorking={false}
        now={now}
        onSubmit={onSubmit}
      />
    </TestProviders>,
  );
  return onSubmit;
}

describe("StudioScheduleForm", () => {
  it("reads the picked time back and sends it as an instant", async () => {
    const onSubmit = renderForm();
    fireEvent.change(await screen.findByLabelText("Date"), {
      target: { value: "2026-10-20" },
    });
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "18:00" },
    });
    expect(
      screen.getByText(/Goes live on Tue,? (Oct 20|20 Oct) at 18:00/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Schedule release" }));
    expect(onSubmit).toHaveBeenCalledWith(
      new Date(2026, 9, 20, 18, 0).toISOString(),
    );
  });

  it("says why a time too soon is refused and sends nothing", async () => {
    const onSubmit = renderForm();
    fireEvent.change(await screen.findByLabelText("Date"), {
      target: { value: "2026-10-13" },
    });
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "10:05" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Schedule release" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("Pick a time at least 15 minutes from now"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Time")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("refuses a date more than a year ahead", async () => {
    const onSubmit = renderForm();
    fireEvent.change(await screen.findByLabelText("Date"), {
      target: { value: "2027-11-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Schedule release" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("Pick a date within the next 365 days"),
    ).toBeInTheDocument();
  });
});
