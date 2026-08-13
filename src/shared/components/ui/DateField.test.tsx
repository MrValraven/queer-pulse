import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateField } from "./DateField";
import { TestProviders } from "../../../test/TestProviders";

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestProviders });
}

describe("DateField", () => {
  it("en-US date field orders month/day/year", () => {
    renderWithProviders(<DateField mode="date" value="2026-03-05" onChange={() => {}} locale="en-US" />);
    const segments = screen.getAllByRole("spinbutton");
    expect(segments.map((seg) => seg.getAttribute("aria-label"))).toEqual(["Month", "Day", "Year"]);
  });

  it("pt date field orders day/month/year", () => {
    renderWithProviders(<DateField mode="date" value="2026-03-05" onChange={() => {}} locale="pt" />);
    const segments = screen.getAllByRole("spinbutton");
    expect(segments.map((seg) => seg.getAttribute("aria-label"))).toEqual(["Dia", "Mês", "Ano"]);
  });

  it("ArrowUp on the day segment increments and emits ISO", () => {
    const onChange = vi.fn();
    renderWithProviders(<DateField mode="date" value="2026-03-05" onChange={onChange} locale="en-US" />);
    const day = screen.getByRole("spinbutton", { name: "Day" });
    fireEvent.keyDown(day, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith("2026-03-06");
  });

  it("typing digits fills and auto-advances", () => {
    const onChange = vi.fn();
    renderWithProviders(<DateField mode="date" value={null} onChange={onChange} locale="en-US" />);
    const month = screen.getByRole("spinbutton", { name: "Month" });
    fireEvent.keyDown(month, { key: "1" });
    fireEvent.keyDown(month, { key: "2" }); // -> December, advance to Day
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Day");
  });

  it("shows the localized placeholder token until a segment has a value", () => {
    renderWithProviders(<DateField mode="date" value={null} onChange={() => {}} locale="en-US" />);
    const month = screen.getByRole("spinbutton", { name: "Month" });
    expect(month).toHaveTextContent("mm");
    expect(month).not.toHaveAttribute("aria-valuenow");
  });

  it("datetime mode appends hour/minute/meridiem for a 12h locale", () => {
    renderWithProviders(
      <DateField mode="datetime" value="2026-03-05T13:30" onChange={() => {}} locale="en-US" />,
    );
    const segments = screen.getAllByRole("spinbutton");
    expect(segments.map((seg) => seg.getAttribute("aria-label"))).toEqual([
      "Month",
      "Day",
      "Year",
      "Hour",
      "Minute",
      "AM/PM",
    ]);
    const hour = screen.getByRole("spinbutton", { name: "Hour" });
    expect(hour).toHaveTextContent("01");
    const meridiem = screen.getByRole("spinbutton", { name: "AM/PM" });
    expect(meridiem).toHaveTextContent("PM");
  });

  it("time mode omits the meridiem segment for a 24h locale", () => {
    renderWithProviders(<DateField mode="time" value="13:30" onChange={() => {}} locale="pt" />);
    const segments = screen.getAllByRole("spinbutton");
    expect(segments.map((seg) => seg.getAttribute("aria-label"))).toEqual(["Hora", "Minuto"]);
  });

  it("Backspace clears the focused segment and reports incomplete", () => {
    const onChange = vi.fn();
    renderWithProviders(<DateField mode="date" value="2026-03-05" onChange={onChange} locale="en-US" />);
    const day = screen.getByRole("spinbutton", { name: "Day" });
    fireEvent.keyDown(day, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(null);
    expect(day).not.toHaveAttribute("aria-valuenow");
  });

  it("disabled segments are not tabbable", () => {
    renderWithProviders(
      <DateField mode="date" value="2026-03-05" onChange={() => {}} locale="en-US" disabled />,
    );
    for (const segment of screen.getAllByRole("spinbutton")) {
      expect(segment).toHaveAttribute("tabindex", "-1");
    }
  });

  it("threads aria-describedby and aria-required onto every segment, not just the wrapper", () => {
    renderWithProviders(
      <DateField
        mode="date"
        value="2026-03-05"
        onChange={() => {}}
        locale="en-US"
        aria-describedby="helper-text"
        aria-required
      />,
    );
    for (const segment of screen.getAllByRole("spinbutton")) {
      expect(segment).toHaveAttribute("aria-describedby", "helper-text");
      expect(segment).toHaveAttribute("aria-required", "true");
    }
  });

  it("unifies invalid + aria-invalid onto every segment's aria-invalid", () => {
    renderWithProviders(
      <DateField mode="date" value="2026-03-05" onChange={() => {}} locale="en-US" invalid />,
    );
    for (const segment of screen.getAllByRole("spinbutton")) {
      expect(segment).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("aria-invalid alone (without the invalid prop) also marks every segment invalid", () => {
    renderWithProviders(
      <DateField mode="date" value="2026-03-05" onChange={() => {}} locale="en-US" aria-invalid />,
    );
    for (const segment of screen.getAllByRole("spinbutton")) {
      expect(segment).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("datetime min/max clamps the date portion even when the bound is a full datetime ISO", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateField
        mode="datetime"
        value="2026-03-05T09:00"
        onChange={onChange}
        locale="en-US"
        min="2026-03-06T00:00"
      />,
    );
    const day = screen.getByRole("spinbutton", { name: "Day" });
    fireEvent.keyDown(day, { key: "ArrowDown" }); // 5 -> would be 4, clamped up to the min's day (6)
    expect(onChange).toHaveBeenCalledWith("2026-03-06T09:00");
  });

  it("time mode min clamps ArrowDown stepping below the bound", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateField mode="time" value="09:00" onChange={onChange} locale="pt" min="09:00" />,
    );
    const hour = screen.getByRole("spinbutton", { name: "Hora" });
    fireEvent.keyDown(hour, { key: "ArrowDown" }); // 09 -> would be 08 (08:00 < 09:00), clamped back to 09:00
    expect(onChange).toHaveBeenCalledWith("09:00");
  });

  it("time mode min clamps a typed value below the bound", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateField mode="time" value={null} onChange={onChange} locale="pt" min="09:00" />,
    );
    const hour = screen.getByRole("spinbutton", { name: "Hora" });
    fireEvent.keyDown(hour, { key: "0" });
    fireEvent.keyDown(hour, { key: "8" }); // -> 08, advances to Minute
    const minute = screen.getByRole("spinbutton", { name: "Minuto" });
    fireEvent.keyDown(minute, { key: "0" }); // -> 08:00, below the 09:00 min, clamps to 09:00 immediately
    fireEvent.keyDown(minute, { key: "0" }); // second digit re-enters against the already-clamped 09:00
    expect(onChange).toHaveBeenLastCalledWith("09:00");
  });

  it("marks segments aria-invalid when the typed date is rejected by isDateUnavailable", () => {
    renderWithProviders(
      <DateField
        mode="date"
        value="2026-03-05"
        onChange={() => {}}
        locale="en-US"
        isDateUnavailable={(iso) => iso === "2026-03-05"}
      />,
    );
    for (const segment of screen.getAllByRole("spinbutton")) {
      expect(segment).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("does not mark segments invalid when isDateUnavailable accepts the typed date", () => {
    renderWithProviders(
      <DateField
        mode="date"
        value="2026-03-05"
        onChange={() => {}}
        locale="en-US"
        isDateUnavailable={(iso) => iso === "2099-01-01"}
      />,
    );
    for (const segment of screen.getAllByRole("spinbutton")) {
      expect(segment).not.toHaveAttribute("aria-invalid");
    }
  });
});
