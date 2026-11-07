import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LazyMotion, domMax } from "motion/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VjPackDTO } from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import { useVjPacks } from "../api/useVjPacks";
import { createVjDemoChannelHub } from "../demo/vjDemoChannel";
import { VJ_DEMO_EVENT_IDS } from "../demo/vjDemoEvents.data";
import { vjRefusal } from "../demo/vjDemoRefusals";
import {
  configureVjDemoStore,
  demoGetVjPackEvent,
  demoGetVjPacks,
  demoSetVjPackEvent,
  resetVjDemoLibrary,
} from "../demo/vjDemoStore";
import { VjPackEventLink } from "./VjPackEventLink";

vi.mock("../demo/vjDemoStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../demo/vjDemoStore")>();
  return {
    ...actual,
    demoGetVjPackEvent: vi.fn(actual.demoGetVjPackEvent),
    demoSetVjPackEvent: vi.fn(actual.demoSetVjPackEvent),
  };
});

const PORTFOLIO_NIGHT = "Portfolio Night: Designers & Photographers";
const ENDED_EVENT_ID = "00000000-0000-4000-8000-00000000ee09";
const ENDED_EVENT_TITLE = "Last Friday dance";

class MemoryStorage implements Storage {
  private readonly entries = new Map<string, string>();
  get length(): number {
    return this.entries.size;
  }
  clear(): void {
    this.entries.clear();
  }
  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.entries.delete(key);
  }
  setItem(key: string, value: string): void {
    this.entries.set(key, value);
  }
}

function renderWithProviders(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <TestProviders queryClient={queryClient}>
      <LazyMotion features={domMax}>{children}</LazyMotion>
    </TestProviders>,
  );
}

function seededPackNamed(name: string): VjPackDTO {
  const pack = demoGetVjPacks().items.find(
    (candidate) => candidate.name === name,
  );
  if (pack === undefined) throw new Error(`No seeded pack named ${name}`);
  return pack;
}

/** Reads the packs the way the page does, so a write reaches the line. */
function PackEventHarness({ packName }: { packName: string }) {
  const packsQuery = useVjPacks();
  const pack = packsQuery.data?.find(
    (candidate) => candidate.name === packName,
  );
  if (pack === undefined) return null;
  return <VjPackEventLink pack={pack} />;
}

/** Opens the picker and answers its group. */
async function openPicker(
  user: ReturnType<typeof userEvent.setup>,
  openerName: string,
) {
  await user.click(await screen.findByRole("button", { name: openerName }));
  return screen.findByRole("group", { name: "Upcoming event" });
}

describe("VjPackEventLink (demo)", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
    vi.mocked(demoGetVjPackEvent).mockClear();
    vi.mocked(demoSetVjPackEvent).mockClear();
  });

  it("says no event is linked", async () => {
    renderWithProviders(<PackEventHarness packName="Peak hour" />);

    expect(await screen.findByText("No event linked")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Link event" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      screen.queryByRole("button", { name: "Unlink event" }),
    ).not.toBeInTheDocument();
  });

  it("links an upcoming event from the picker", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PackEventHarness packName="Peak hour" />);
    const picker = await openPicker(user, "Link event");
    const submit = within(picker).getByRole("button", { name: "Link event" });
    expect(submit).toHaveAttribute("aria-disabled", "true");

    await user.click(
      within(picker).getByRole("button", { name: "Upcoming event" }),
    );
    await user.click(
      await screen.findByRole("option", { name: new RegExp(PORTFOLIO_NIGHT) }),
    );
    expect(submit).not.toHaveAttribute("aria-disabled");
    await user.click(submit);

    expect(
      await screen.findByText(`Peak hour now links to ${PORTFOLIO_NIGHT}`),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(new RegExp(`^Event: ${PORTFOLIO_NIGHT}, `)),
    ).toBeInTheDocument();
    expect(seededPackNamed("Peak hour").event?.id).toBe(
      VJ_DEMO_EVENT_IDS.portfolioNight,
    );
    expect(
      await screen.findByRole("button", { name: "Change event" }),
    ).toHaveFocus();
  });

  it("unlinks the event", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PackEventHarness packName="Warm-up" />);

    await user.click(
      await screen.findByRole("button", { name: "Unlink event" }),
    );

    expect(
      await screen.findByText("Warm-up has no event linked now"),
    ).toBeInTheDocument();
    expect(await screen.findByText("No event linked")).toBeInTheDocument();
    expect(vi.mocked(demoSetVjPackEvent)).toHaveBeenCalledWith(
      seededPackNamed("Warm-up").id,
      { eventId: null },
    );
    expect(seededPackNamed("Warm-up").event).toBeNull();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Unlink event" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("names VJ_EVENT_NOT_LINKABLE inside the picker", async () => {
    vi.mocked(demoSetVjPackEvent).mockImplementationOnce(() => {
      throw vjRefusal("VJ_EVENT_NOT_LINKABLE");
    });
    const user = userEvent.setup();
    renderWithProviders(<PackEventHarness packName="Peak hour" />);
    const picker = await openPicker(user, "Link event");

    await user.click(
      within(picker).getByRole("button", { name: "Upcoming event" }),
    );
    await user.click(
      await screen.findByRole("option", { name: new RegExp(PORTFOLIO_NIGHT) }),
    );
    await user.click(
      within(picker).getByRole("button", { name: "Link event" }),
    );

    const reasonText = await within(picker).findByText(
      "Only published public and members events can show on the projector",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(seededPackNamed("Peak hour").event).toBeNull();
  });

  it("warns when the linked event was cancelled", async () => {
    const warmUp = seededPackNamed("Warm-up");
    if (warmUp.event === null) throw new Error("Warm-up links no event");
    vi.mocked(demoGetVjPackEvent).mockImplementationOnce((packId) => ({
      packId,
      card: null,
      unavailableReason: "cancelled",
    }));
    renderWithProviders(
      <VjPackEventLink
        pack={{ ...warmUp, event: { ...warmUp.event, isAvailable: false } }}
      />,
    );

    const warning = await screen.findByText(
      "This event was cancelled, so the projector hides its card",
    );
    expect(warning.closest('[role="status"]')).not.toBeNull();
    expect(vi.mocked(demoGetVjPackEvent)).toHaveBeenCalledWith(warmUp.id);
  });

  it("keeps an ended linked event in the choices", async () => {
    const peakHour = seededPackNamed("Peak hour");
    const user = userEvent.setup();
    renderWithProviders(
      <VjPackEventLink
        pack={{
          ...peakHour,
          event: {
            id: ENDED_EVENT_ID,
            title: ENDED_EVENT_TITLE,
            startAt: "2026-10-30T22:00:00.000Z",
            isAvailable: true,
          },
        }}
      />,
    );
    const picker = await openPicker(user, "Change event");
    // The current link is chosen already, so there is nothing to send.
    expect(
      within(picker).getByRole("button", { name: "Link event" }),
    ).toHaveAttribute("aria-disabled", "true");

    await user.click(
      within(picker).getByRole("button", { name: "Upcoming event" }),
    );
    const options = await screen.findAllByRole("option");
    expect(options[0]).toHaveTextContent(ENDED_EVENT_TITLE);
    expect(options.length).toBeGreaterThan(1);
    expect(
      options.some((option) => option.textContent?.includes(PORTFOLIO_NIGHT)),
    ).toBe(true);
  });
});
