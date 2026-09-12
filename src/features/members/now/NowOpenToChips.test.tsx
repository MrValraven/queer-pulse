import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { NowOpenToChips } from "./NowOpenToChips";
import type { MemberProfile } from "../data/memberProfiles";
import type { NowInsights } from "../api/nowInsights.api";

const contact = vi.fn();
vi.mock("../../connect/useMemberContact", () => ({
  useMemberContact: () => ({ connected: false, contact }),
}));

const profile = {
  slug: "joao-ribeiro",
  first: "João",
  last: "Ribeiro",
  now: "Programming the autumn season.",
  openTo: [
    { kind: "preset", id: "collaborating" },
    { kind: "preset", id: "casualMeetups" },
    { kind: "custom", label: "a riso afternoon" },
  ],
} as unknown as MemberProfile;

const insights: NowInsights = {
  windowDays: 90,
  hellos: 5,
  replies: 4,
  nowUpdatedAt: null,
  history: [],
  perChip: [
    {
      reason: "open:collaborating",
      count: 4,
      lastHelloAt: "2026-08-29T10:12:00.000Z",
    },
    {
      reason: "open:casualMeetups",
      count: 0,
      lastHelloAt: "2026-05-02T09:05:00.000Z",
    },
    {
      reason: "custom:a riso afternoon",
      count: 1,
      lastHelloAt: "2026-09-01T14:20:00.000Z",
    },
  ],
};

function renderChips(
  isSelf: boolean,
  chipInsights: NowInsights | null = insights,
) {
  return render(
    <I18nProvider>
      <NowOpenToChips
        profile={profile}
        isSelf={isSelf}
        insights={chipInsights}
      />
    </I18nProvider>,
  );
}

beforeEach(() => {
  vi.setSystemTime(new Date("2026-09-12T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("NowOpenToChips", () => {
  it("shows a count on each chip for the owner", async () => {
    renderChips(true);
    expect(await screen.findByText("4")).toBeVisible();
    expect(screen.getByText("1")).toBeVisible();
  });

  it("labels the count for screen readers", async () => {
    renderChips(true);
    expect(await screen.findByText("4 hellos")).toBeInTheDocument();
    // The visible numeral must be hidden from the accessibility tree itself,
    // or a screen reader reads both: "Collaborating, 4, 4 hellos".
    expect(screen.getByText("4")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows no counts to a visitor", async () => {
    renderChips(false);
    // A positive anchor first: without it, this test would also pass against
    // a component that rendered nothing at all.
    await screen.findByRole("button", { name: "Collaborating" });
    expect(screen.queryByText("4")).toBeNull();
    expect(screen.queryByText("1")).toBeNull();
  });

  it("nudges on a chip with no hellos in the window and an old last hello", async () => {
    renderChips(true);
    expect(
      await screen.findByText("No hellos in 4 months, swap it?"),
    ).toBeVisible();
  });

  it("does not nudge a visitor", async () => {
    renderChips(false);
    // Wait for the members catalog to resolve so an absent nudge is a real
    // absence, not just a translation chunk that hasn't loaded yet.
    await screen.findByRole("button", { name: "Collaborating" });
    expect(screen.queryByText(/swap it\?/)).toBeNull();
  });

  it("does not nudge a chip that has hellos", async () => {
    renderChips(true);
    // The collaborating chip (count 4) and the custom chip (count 1) never
    // carry the nudge; only casualMeetups (count 0) does, so exactly one
    // nudge should exist across the whole row.
    await screen.findByText("No hellos in 4 months, swap it?");
    expect(screen.queryAllByText(/swap it\?/)).toHaveLength(1);
  });

  it("shows the never copy for a chip with no hellos and no history", async () => {
    const noHistoryInsights: NowInsights = {
      ...insights,
      perChip: [
        {
          reason: "open:collaborating",
          count: 4,
          lastHelloAt: "2026-08-29T10:12:00.000Z",
        },
        { reason: "open:casualMeetups", count: 0, lastHelloAt: null },
        {
          reason: "custom:a riso afternoon",
          count: 1,
          lastHelloAt: "2026-09-01T14:20:00.000Z",
        },
      ],
    };
    renderChips(true, noHistoryInsights);
    expect(await screen.findByText("No hellos yet, swap it?")).toBeVisible();
  });

  it("treats a door absent from perChip as zero hellos forever", async () => {
    // The backend's GROUP BY never emits a row for a reason with no hellos
    // EVER, so this is the real shape a door nobody has ever used arrives in:
    // present in `openTo`, absent from `perChip` entirely (never a
    // hand-written `{ count: 0, lastHelloAt: null }` entry, which the server
    // can't send since MAX(created_at) inside an emitted group can't be null).
    const profileWithUnusedDoor = {
      ...profile,
      openTo: [...profile.openTo, { kind: "preset", id: "mentoring" }],
    } as unknown as MemberProfile;
    render(
      <I18nProvider>
        <NowOpenToChips
          profile={profileWithUnusedDoor}
          isSelf={true}
          insights={insights}
        />
      </I18nProvider>,
    );
    // The fixture already carries an unrelated zero-count chip
    // (casualMeetups, stale by months rather than by absence), so every
    // assertion below is scoped to the mentoring chip's own group rather than
    // matching "0" or the never-copy anywhere on the page.
    const mentoringChip = await screen.findByText("Mentoring");
    expect(mentoringChip.className).toMatch(/chipUnused/);
    const mentoringGroup = mentoringChip.closest("div")!;
    expect(within(mentoringGroup).getByText("0")).toBeVisible();
    expect(within(mentoringGroup).getByText("0 hellos")).toBeInTheDocument();
    expect(
      within(mentoringGroup).getByText("No hellos yet, swap it?"),
    ).toBeVisible();
  });

  it("keeps a visitor's chips as buttons that contact with the reason", async () => {
    renderChips(false);
    const customButton = await screen.findByRole("button", {
      name: "a riso afternoon",
    });
    await userEvent.click(customButton);
    expect(contact).toHaveBeenCalledWith(
      { slug: "joao-ribeiro", name: "João Ribeiro" },
      "custom:a riso afternoon",
    );
  });

  it("renders custom entries in italic, presets not", async () => {
    renderChips(true);
    const customLabel = await screen.findByText("a riso afternoon");
    expect(customLabel.className).toMatch(/chipCustom/);
    const presetLabel = await screen.findByText("Collaborating");
    expect(presetLabel.className).not.toMatch(/chipCustom/);
  });
});
