import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { CheckinMeter } from "./CheckinMeter";

const startAt = new Date("2026-10-10T20:00:00Z");
const base = {
  goingCount: 3,
  seatsTaken: 4,
  waitlistCount: 0,
  startAt,
  endAt: null,
  now: new Date("2026-10-10T20:30:00Z"),
};

describe("CheckinMeter", () => {
  it("states arrivals against the people going, and the seats with guests", async () => {
    render(<CheckinMeter {...base} arrivedCount={1} />, {
      wrapper: TestProviders,
    });
    expect(await screen.findByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuemax",
      "3",
    );
    expect(screen.getByText(/4 seats/)).toBeInTheDocument();
    expect(screen.getByText(/\+ 1 guest/)).toBeInTheDocument();
    expect(screen.getByText("Live now")).toBeInTheDocument();
  });

  it("handles an empty roster without dividing by zero or celebrating", async () => {
    render(
      <CheckinMeter {...base} goingCount={0} seatsTaken={0} arrivedCount={0} />,
      { wrapper: TestProviders },
    );
    expect(await screen.findByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(screen.queryByText("Everyone's here")).not.toBeInTheDocument();
  });

  it("celebrates when the last guest arrives", async () => {
    const { rerender } = render(<CheckinMeter {...base} arrivedCount={2} />, {
      wrapper: TestProviders,
    });
    await screen.findByRole("progressbar");
    rerender(<CheckinMeter {...base} arrivedCount={3} />);
    expect(await screen.findByText("Everyone's here")).toBeInTheDocument();
  });

  it("states that check-ins are no longer kept", async () => {
    render(<CheckinMeter {...base} arrivedCount={null} />, {
      wrapper: TestProviders,
    });
    expect(await screen.findByText("No longer kept")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
