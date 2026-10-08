import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateField, type FieldMode } from "./DateField";
import { TestProviders } from "../../../test/TestProviders";

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestProviders });
}

describe("DateField segments and typing", () => {
  it("en-US date field orders month/day/year", () => {
    renderWithProviders(
      <DateField
        mode="date"
        value="2026-03-05"
        onChange={() => {}}
        locale="en-US"
      />,
    );
    const segments = screen.getAllByRole("spinbutton");
    expect(segments.map((seg) => seg.getAttribute("aria-label"))).toEqual([
      "Month",
      "Day",
      "Year",
    ]);
  });

  it("pt date field orders day/month/year", () => {
    renderWithProviders(
      <DateField
        mode="date"
        value="2026-03-05"
        onChange={() => {}}
        locale="pt"
      />,
    );
    const segments = screen.getAllByRole("spinbutton");
    expect(segments.map((seg) => seg.getAttribute("aria-label"))).toEqual([
      "Dia",
      "Mês",
      "Ano",
    ]);
  });

  it("ArrowUp on the day segment increments and emits ISO", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateField
        mode="date"
        value="2026-03-05"
        onChange={onChange}
        locale="en-US"
      />,
    );
    const day = screen.getByRole("spinbutton", { name: "Day" });
    fireEvent.keyDown(day, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith("2026-03-06");
  });

  it("typing digits fills and auto-advances", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateField mode="date" value={null} onChange={onChange} locale="en-US" />,
    );
    const month = screen.getByRole("spinbutton", { name: "Month" });
    fireEvent.keyDown(month, { key: "1" });
    fireEvent.keyDown(month, { key: "2" }); // -> December, advance to Day
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Day");
  });

  it("shows the localized placeholder token until a segment has a value", () => {
    renderWithProviders(
      <DateField mode="date" value={null} onChange={() => {}} locale="en-US" />,
    );
    const month = screen.getByRole("spinbutton", { name: "Month" });
    expect(month).toHaveTextContent("mm");
    expect(month).not.toHaveAttribute("aria-valuenow");
  });

  it("datetime mode appends hour/minute/meridiem for a 12h locale", () => {
    renderWithProviders(
      <DateField
        mode="datetime"
        value="2026-03-05T13:30"
        onChange={() => {}}
        locale="en-US"
      />,
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
    renderWithProviders(
      <DateField mode="time" value="13:30" onChange={() => {}} locale="pt" />,
    );
    const segments = screen.getAllByRole("spinbutton");
    expect(segments.map((seg) => seg.getAttribute("aria-label"))).toEqual([
      "Hora",
      "Minuto",
    ]);
  });

  it("Backspace clears the focused segment and reports incomplete", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateField
        mode="date"
        value="2026-03-05"
        onChange={onChange}
        locale="en-US"
      />,
    );
    const day = screen.getByRole("spinbutton", { name: "Day" });
    fireEvent.keyDown(day, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(null);
    expect(day).not.toHaveAttribute("aria-valuenow");
  });
});

describe("DateField accessibility attributes", () => {
  it("disabled segments are not tabbable", () => {
    renderWithProviders(
      <DateField
        mode="date"
        value="2026-03-05"
        onChange={() => {}}
        locale="en-US"
        disabled
      />,
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
      <DateField
        mode="date"
        value="2026-03-05"
        onChange={() => {}}
        locale="en-US"
        invalid
      />,
    );
    for (const segment of screen.getAllByRole("spinbutton")) {
      expect(segment).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("aria-invalid alone (without the invalid prop) also marks every segment invalid", () => {
    renderWithProviders(
      <DateField
        mode="date"
        value="2026-03-05"
        onChange={() => {}}
        locale="en-US"
        aria-invalid
      />,
    );
    for (const segment of screen.getAllByRole("spinbutton")) {
      expect(segment).toHaveAttribute("aria-invalid", "true");
    }
  });
});

describe("DateField clamping and availability", () => {
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
      <DateField
        mode="time"
        value="09:00"
        onChange={onChange}
        locale="pt"
        min="09:00"
      />,
    );
    const hour = screen.getByRole("spinbutton", { name: "Hora" });
    fireEvent.keyDown(hour, { key: "ArrowDown" }); // 09 -> would be 08 (08:00 < 09:00), clamped back to 09:00
    expect(onChange).toHaveBeenCalledWith("09:00");
  });

  it("time mode min clamps a typed value below the bound", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateField
        mode="time"
        value={null}
        onChange={onChange}
        locale="pt"
        min="09:00"
      />,
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

describe("DateField 12h hour stepping and entry", () => {
  function renderDatetime(value: string, locale: string) {
    const onChange = vi.fn();
    renderWithProviders(
      <DateField
        mode="datetime"
        value={value}
        onChange={onChange}
        locale={locale}
      />,
    );
    return onChange;
  }

  it("ArrowUp at 11 AM moves to 12 PM (noon) and flips the meridiem", () => {
    const onChange = renderDatetime("2026-03-05T11:00", "en-US");
    const hour = screen.getByRole("spinbutton", { name: "Hour" });
    fireEvent.keyDown(hour, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith("2026-03-05T12:00");
    expect(hour).toHaveTextContent("12");
    expect(screen.getByRole("spinbutton", { name: "AM/PM" })).toHaveTextContent(
      "PM",
    );
  });

  it("ArrowUp at 11 PM wraps to 12 AM (midnight) on the same day", () => {
    const onChange = renderDatetime("2026-03-05T23:00", "en-US");
    const hour = screen.getByRole("spinbutton", { name: "Hour" });
    fireEvent.keyDown(hour, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith("2026-03-05T00:00");
    expect(screen.getByRole("spinbutton", { name: "AM/PM" })).toHaveTextContent(
      "AM",
    );
  });

  it("ArrowDown at 12 PM moves to 11 AM", () => {
    const onChange = renderDatetime("2026-03-05T12:00", "en-US");
    const hour = screen.getByRole("spinbutton", { name: "Hour" });
    fireEvent.keyDown(hour, { key: "ArrowDown" });
    expect(onChange).toHaveBeenCalledWith("2026-03-05T11:00");
    expect(screen.getByRole("spinbutton", { name: "AM/PM" })).toHaveTextContent(
      "AM",
    );
  });

  it("ArrowDown at 12 AM wraps to 11 PM on the same day", () => {
    const onChange = renderDatetime("2026-03-05T00:00", "en-US");
    const hour = screen.getByRole("spinbutton", { name: "Hour" });
    fireEvent.keyDown(hour, { key: "ArrowDown" });
    expect(onChange).toHaveBeenCalledWith("2026-03-05T23:00");
    expect(hour).toHaveTextContent("11");
    expect(screen.getByRole("spinbutton", { name: "AM/PM" })).toHaveTextContent(
      "PM",
    );
  });

  it("typing 12 then A emits midnight and 12 then P emits noon", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <DateField mode="time" value={null} onChange={onChange} locale="en-US" />,
    );
    const hour = screen.getByRole("spinbutton", { name: "Hour" });
    const minute = screen.getByRole("spinbutton", { name: "Minute" });
    const meridiem = screen.getByRole("spinbutton", { name: "AM/PM" });
    fireEvent.keyDown(hour, { key: "1" });
    fireEvent.keyDown(hour, { key: "2" });
    fireEvent.keyDown(minute, { key: "0" });
    fireEvent.keyDown(minute, { key: "0" });
    fireEvent.keyDown(meridiem, { key: "a" });
    expect(onChange).toHaveBeenLastCalledWith("00:00");
    fireEvent.keyDown(meridiem, { key: "p" });
    expect(onChange).toHaveBeenLastCalledWith("12:00");
  });

  it("typing 00 into a 12h hour reads as 12", () => {
    renderWithProviders(
      <DateField mode="time" value={null} onChange={() => {}} locale="en-US" />,
    );
    const hour = screen.getByRole("spinbutton", { name: "Hour" });
    fireEvent.keyDown(hour, { key: "0" });
    fireEvent.keyDown(hour, { key: "0" });
    expect(hour).toHaveTextContent("12");
  });

  it("a 24h locale steps hour 11 to 12", () => {
    const onChange = renderDatetime("2026-03-05T11:00", "pt");
    fireEvent.keyDown(screen.getByRole("spinbutton", { name: "Hora" }), {
      key: "ArrowUp",
    });
    expect(onChange).toHaveBeenCalledWith("2026-03-05T12:00");
  });

  it("a 24h locale wraps hour 23 to 00 without touching the date", () => {
    const onChange = renderDatetime("2026-03-05T23:00", "pt");
    const hour = screen.getByRole("spinbutton", { name: "Hora" });
    fireEvent.keyDown(hour, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith("2026-03-05T00:00");
    expect(hour).toHaveTextContent("00");
  });
});

/** Holds the value the way every real caller does, echoing each change back. */
function ControlledField({
  mode,
  initialValue,
  onChange,
}: {
  mode: FieldMode;
  initialValue: string;
  onChange: (value: string | null) => void;
}) {
  const [value, setValue] = useState<string | null>(initialValue);
  return (
    <DateField
      mode={mode}
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange(nextValue);
      }}
      locale="en-US"
    />
  );
}

describe("DateField under a controlled parent", () => {
  it("typing 12 into a filled 12h hour keeps both digits", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ControlledField mode="time" initialValue="21:00" onChange={onChange} />,
    );
    const hour = screen.getByRole("spinbutton", { name: "Hour" });
    fireEvent.keyDown(hour, { key: "1" });
    fireEvent.keyDown(hour, { key: "2" });
    expect(hour).toHaveTextContent("12");
    expect(onChange).toHaveBeenLastCalledWith("12:00");
  });

  it("clearing one segment keeps the other segments", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <ControlledField
        mode="date"
        initialValue="2026-03-05"
        onChange={onChange}
      />,
    );
    fireEvent.keyDown(screen.getByRole("spinbutton", { name: "Day" }), {
      key: "Backspace",
    });
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole("spinbutton", { name: "Month" })).toHaveTextContent(
      "03",
    );
    expect(screen.getByRole("spinbutton", { name: "Year" })).toHaveTextContent(
      "2026",
    );
  });
});
