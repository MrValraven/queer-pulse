import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createFormatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { TestProviders } from "../../test/TestProviders";
import type { GuestCommunityDraftEntry } from "./api/eventCommunities.api";
import type { GatheringDetail } from "./data";
import { EditDetailsAudience } from "./EditDetailsAudience";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import type { GuestCommunitiesPickerProps } from "./GuestCommunitiesPicker";
import { editDraftFromState, liveInitialState } from "./manageGatheringState";
import {
  SavedGuestListContext,
  type SavedGuestList,
} from "./savedGuestListContext";

/** The stubs' own labels, hoisted so the mock factories can read them. */
const STUB_LABELS = vi.hoisted(() => ({
  leadSelect: "Lead community",
  guestRows: "Guest rows",
  handBack: "Hand back the same rows",
}));

vi.mock("./useHostableCommunities", () => ({
  useHostableCommunities: () => ({
    options: [
      { slug: "queer-runners", name: "Queer Runners Lisboa" },
      { slug: "trans-hub", name: "Trans & Non-Binary Hub" },
    ],
    isResolving: false,
  }),
}));
vi.mock("../communities/api/useMyCommunityOptions", () => ({
  useMyCommunityOptions: () => [],
}));
// A native select stands in for the design-system one, so a test can pick
// a lead with one change event.
vi.mock("../../shared/components/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/components/ui")>()),
  Select: ({
    options,
    value,
    onChange,
  }: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string | null) => void;
  }) => (
    <select
      aria-label={STUB_LABELS.leadSelect}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
// The picker lists the rows it was handed and can hand the same rows back.
vi.mock("./GuestCommunitiesPicker", () => ({
  GuestCommunitiesPicker: ({
    guests,
    onChange,
  }: GuestCommunitiesPickerProps) => (
    <div>
      <ul aria-label={STUB_LABELS.guestRows}>
        {guests.map((guest) => (
          <li key={guest.slug}>{guest.name}</li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...guests])}>
        {STUB_LABELS.handBack}
      </button>
    </div>
  ),
}));

const t: TFunction = (key) => key;
const fmt = createFormatters("en-GB");

const joined: GuestCommunityDraftEntry = {
  slug: "trans-hub",
  name: "Trans & Non-Binary Hub",
  accessTier: "public",
  status: "accepted",
};
const invited: GuestCommunityDraftEntry = {
  slug: "rainbow-arts",
  name: "Rainbow Arts Collective",
  accessTier: "request",
  status: "pending",
};

const gathering = {
  slug: "end-of-month-run",
  title: "End-of-Month Run",
  body: "A flat, friendly 5K.",
  date: new Date("2026-11-01T09:00:00"),
  hood: "Tejo path",
  communitySlug: "queer-runners",
} as unknown as GatheringDetail;

/** A draft opened before the saved guest list answered. */
function draftWithoutGuestList(): GatheringDetailsDraft {
  return editDraftFromState(liveInitialState(gathering, fmt, t));
}

function renderAudience(savedGuestList?: SavedGuestList) {
  const onChange = vi.fn<(patch: Partial<GatheringDetailsDraft>) => void>();
  const audience = (
    <EditDetailsAudience
      draft={draftWithoutGuestList()}
      openedWithCapacity=""
      savedCommunitySlug="queer-runners"
      onChange={onChange}
    />
  );
  render(
    <TestProviders>
      {savedGuestList ? (
        <SavedGuestListContext.Provider value={savedGuestList}>
          {audience}
        </SavedGuestListContext.Provider>
      ) : (
        audience
      )}
    </TestProviders>,
  );
  return onChange;
}

describe("EditDetailsAudience guest list safety", () => {
  it("reads the saved guests from the opener when the draft holds no guest list", () => {
    renderAudience({ status: "ready", guests: [joined], onRetry: vi.fn() });
    expect(screen.getByRole("list", { name: "Guest rows" })).toHaveTextContent(
      "Trans & Non-Binary Hub",
    );
  });

  it("leaves the guests untouched when the lead changes before the saved list answers", () => {
    const onChange = renderAudience({
      status: "loading",
      guests: [],
      onRetry: vi.fn(),
    });
    expect(screen.queryByRole("list", { name: "Guest rows" })).toBeNull();
    fireEvent.change(screen.getByRole("combobox", { name: "Lead community" }), {
      target: { value: "trans-hub" },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ communitySlug: "trans-hub" }),
    );
    expect(onChange.mock.calls[0]?.[0]).not.toHaveProperty("guestCommunities");
  });

  it("drops the guest that becomes the lead once the saved list has answered", () => {
    const onChange = renderAudience({
      status: "ready",
      guests: [joined, invited],
      onRetry: vi.fn(),
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Lead community" }), {
      target: { value: "trans-hub" },
    });
    expect(onChange.mock.calls[0]?.[0]?.guestCommunities).toEqual([invited]);
  });

  it("goes back to no guest list of its own when an edit returns to the saved rows", () => {
    const onChange = renderAudience({
      status: "ready",
      guests: [joined],
      onRetry: vi.fn(),
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Hand back the same rows" }),
    );
    expect(onChange).toHaveBeenCalledWith({ guestCommunities: undefined });
  });

  it("locks the field when no opener provides the saved list", () => {
    renderAudience();
    expect(screen.queryByRole("list", { name: "Guest rows" })).toBeNull();
    expect(
      screen.getByRole("searchbox", { name: "Guest communities" }),
    ).toBeDisabled();
  });

  it("offers a retry when the saved list failed to load", () => {
    const onRetry = vi.fn();
    renderAudience({ status: "failed", guests: [], onRetry });
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
