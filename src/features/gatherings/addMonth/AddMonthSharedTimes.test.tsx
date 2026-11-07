import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { AddMonthSharedTimes } from "./AddMonthSharedTimes";
import type { AddMonthTimes } from "./addMonthState";
import { awaitCatalog } from "../../../test/awaitCatalog";

// The time picker's own typing and popover are covered by its suite. Here a
// plain input stands in, named by the same label id.
vi.mock("../../../shared/components/ui/DatePicker", () => ({
  DatePicker: ({
    labelledBy,
    value,
    onChange,
  }: {
    labelledBy?: string;
    value: string | null;
    onChange: (value: string | null) => void;
  }) => (
    <input
      aria-labelledby={labelledBy}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || null)}
    />
  ),
}));

const DEVICE_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const OTHER_ZONE =
  DEVICE_ZONE === "Pacific/Auckland" ? "America/Lima" : "Pacific/Auckland";

async function renderTimes(times: AddMonthTimes, timezone = DEVICE_ZONE) {
  const onChange = vi.fn();
  render(
    <TestProviders>
      <AddMonthSharedTimes
        times={times}
        timezone={timezone}
        onChange={onChange}
      />
    </TestProviders>,
  );
  await awaitCatalog("gatherings");
  return { onChange };
}

describe("AddMonthSharedTimes", () => {
  it("reports a new start time with the end kept", async () => {
    const { onChange } = await renderTimes({
      startTime: "19:00",
      endTime: "23:00",
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Starts at" }), {
      target: { value: "20:30" },
    });
    expect(onChange).toHaveBeenCalledWith({
      startTime: "20:30",
      endTime: "23:00",
    });
  });

  it("keeps the last start time when the start field is cleared", async () => {
    const { onChange } = await renderTimes({
      startTime: "19:00",
      endTime: null,
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Starts at" }), {
      target: { value: "" },
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clears the end to no end time", async () => {
    const { onChange } = await renderTimes({
      startTime: "19:00",
      endTime: "23:00",
    });
    fireEvent.change(screen.getByRole("textbox", { name: /Ends at/ }), {
      target: { value: "" },
    });
    expect(onChange).toHaveBeenCalledWith({
      startTime: "19:00",
      endTime: null,
    });
  });

  it("says the event ends the next day when the end is at or before the start", async () => {
    await renderTimes({ startTime: "22:00", endTime: "03:00" });
    expect(screen.getByText("Ends the next day")).toBeInTheDocument();
  });

  it("stays quiet about the next day when the end is later the same day", async () => {
    await renderTimes({ startTime: "19:00", endTime: "23:00" });
    expect(screen.queryByText("Ends the next day")).not.toBeInTheDocument();
  });

  it("names the template's time zone when it differs from the device's", async () => {
    await renderTimes({ startTime: "19:00", endTime: null }, OTHER_ZONE);
    expect(
      screen.getByText(
        `Times are in ${OTHER_ZONE}, the time zone of the event you started from.`,
      ),
    ).toBeInTheDocument();
  });

  it("leaves the zone unsaid when it matches the device's", async () => {
    await renderTimes({ startTime: "19:00", endTime: null }, DEVICE_ZONE);
    expect(screen.queryByText(/Times are in/)).not.toBeInTheDocument();
  });
});
