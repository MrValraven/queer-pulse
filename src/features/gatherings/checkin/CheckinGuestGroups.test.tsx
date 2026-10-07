import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { AttendeeRow } from "../api/events.adapters";
import type { AttendeePagesResult } from "../api/useAttendeePages";
import { CheckinGuestGroups } from "./CheckinGuestGroups";

const row = (
  slug: string,
  name: string,
  extra: Partial<AttendeeRow> = {},
): AttendeeRow => ({
  id: `att-${slug}`,
  slug,
  name,
  initials: name.slice(0, 2),
  background: "",
  color: "",
  checkedInAt: null,
  ...extra,
});

const group = (rows: AttendeeRow[]): AttendeePagesResult => ({
  rows,
  total: rows.length,
  hasMore: false,
  isLoading: false,
  isFetchingMore: false,
  isLoadError: false,
  isLoadMoreError: false,
  loadMore: vi.fn(),
  retry: vi.fn(),
});

const baseProps = {
  expectedCount: 2,
  arrivedCount: 1,
  isRosterLoaded: true,
  searchTerm: "",
  isArrivedOpen: false,
  onArrivedOpenChange: vi.fn(),
  canCheckIn: true,
  pendingSlugs: new Set<string>(),
  lingeringRows: new Map<string, AttendeeRow>(),
  gatheringSlug: "supper-club",
  onCheckIn: vi.fn(),
  onUndo: vi.fn(),
  onClearSearch: vi.fn(),
};

// The gatherings catalog loads as its own chunk, so each test awaits its first
// positive query before asserting on translated text.
describe("CheckinGuestGroups", () => {
  it("checks a guest in by tapping the row", async () => {
    const onCheckIn = vi.fn();
    render(
      <CheckinGuestGroups
        {...baseProps}
        onCheckIn={onCheckIn}
        expected={group([
          row("nuno", "Nuno Menezes", {
            guestCount: 1,
            accessNeeds: "Step-free entry",
          }),
        ])}
        arrived={group([])}
      />,
      { wrapper: TestProviders },
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Check in Nuno Menezes" }),
    );
    expect(onCheckIn).toHaveBeenCalledWith("nuno");
    expect(screen.getByText("+1 guest")).toBeInTheDocument();
    expect(screen.getByText("Access needs")).toBeInTheDocument();
  });

  it("sends one request when a pending row is tapped again", async () => {
    const onCheckIn = vi.fn();
    render(
      <CheckinGuestGroups
        {...baseProps}
        onCheckIn={onCheckIn}
        pendingSlugs={new Set(["nuno"])}
        expected={group([row("nuno", "Nuno Menezes")])}
        arrived={group([])}
      />,
      { wrapper: TestProviders },
    );
    const rowButton = await screen.findByRole("button", {
      name: "Check in Nuno Menezes",
    });
    expect(rowButton).toBeDisabled();
    fireEvent.click(rowButton);
    expect(onCheckIn).not.toHaveBeenCalled();
  });

  it("keeps Arrived collapsed until its header is pressed", async () => {
    const onArrivedOpenChange = vi.fn();
    render(
      <CheckinGuestGroups
        {...baseProps}
        onArrivedOpenChange={onArrivedOpenChange}
        expected={group([])}
        arrived={group([row("ana", "Ana Sousa", { checkedInAt: new Date(0) })])}
      />,
      { wrapper: TestProviders },
    );
    const header = await screen.findByRole("button", {
      name: /Arrived \(1\)/,
    });
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Ana Sousa")).not.toBeInTheDocument();
    fireEvent.click(header);
    expect(onArrivedOpenChange).toHaveBeenCalledWith(true);
  });

  it("offers the RSVP code when a search finds nobody", async () => {
    render(
      <CheckinGuestGroups
        {...baseProps}
        searchTerm="Sam"
        expected={group([])}
        arrived={group([])}
      />,
      { wrapper: TestProviders },
    );
    expect(
      await screen.findByText('No one called "Sam" is going'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show RSVP code" }));
    expect(screen.getByText("Scan to RSVP")).toBeInTheDocument();
  });

  it("hides check-in once the window has closed but keeps undo", async () => {
    render(
      <CheckinGuestGroups
        {...baseProps}
        canCheckIn={false}
        isArrivedOpen
        expected={group([row("nuno", "Nuno Menezes")])}
        arrived={group([row("ana", "Ana Sousa", { checkedInAt: new Date(0) })])}
      />,
      { wrapper: TestProviders },
    );
    const arrivedSection = await screen.findByRole("region", {
      name: /Arrived/,
    });
    expect(
      screen.queryByRole("button", { name: "Check in Nuno Menezes" }),
    ).not.toBeInTheDocument();
    expect(
      within(arrivedSection).getByRole("button", {
        name: "Undo check-in for Ana Sousa",
      }),
    ).toBeInTheDocument();
  });
});
