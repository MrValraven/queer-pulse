import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { routes } from "../../../../../app/routeMap";
import { ApiError } from "../../../../../shared/api/client";
import type {
  VjEventCard,
  VjEventCardDTO,
  VjPackEventDTO,
} from "../../../../../shared/contracts/vj";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalog } from "../../../../../test/awaitCatalog";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { VJ_SOCKET_REASON_KEY } from "../../../vjErrors";
import type { VjRun } from "../../useVjCommandRunner";
import { VjEventCardSheet } from "./VjEventCardSheet";

const queryMock = vi.hoisted(() => ({
  data: undefined as VjPackEventDTO | undefined,
  error: null as Error | null,
  calls: [] as Array<{ packId: string | null; isEnabled?: boolean }>,
}));

vi.mock("../../../api/useVjPackEvent", () => ({
  useVjPackEvent: (
    packId: string | null,
    options?: { isEnabled?: boolean },
  ) => {
    queryMock.calls.push({ packId, isEnabled: options?.isEnabled });
    return {
      data: queryMock.data,
      error: queryMock.error,
      isPending: queryMock.data === undefined && queryMock.error === null,
    };
  },
}));

const PACK_ID = "pack-1";
const HIDDEN_CARD: VjEventCard = { isVisible: false, kind: "qr" };
const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 7,
  isNoop: false,
  applyAt: null,
};

function makeCard(overrides: Partial<VjEventCardDTO> = {}): VjEventCardDTO {
  return {
    eventId: "event-1",
    title: "Sunday tea dance",
    startAt: "2026-11-15T17:00:00.000Z",
    endAt: null,
    timezone: "Europe/Lisbon",
    area: "Intendente",
    isOnline: false,
    publicUrl: "https://queerpulse.test/events/sunday-tea-dance",
    ...overrides,
  };
}

function packEventOf(
  card: VjEventCardDTO | null,
  unavailableReason: VjPackEventDTO["unavailableReason"] = null,
): VjPackEventDTO {
  return { packId: PACK_ID, card, unavailableReason };
}

/** A fake runner: a mock to assert on, typed as the runner's generic `run`. */
function createRun(
  outcome: VjCommandOutcome = OK_OUTCOME,
): VjRun & Mock<() => Promise<VjCommandOutcome>> {
  return vi.fn(() => Promise.resolve(outcome)) as unknown as VjRun &
    Mock<() => Promise<VjCommandOutcome>>;
}

async function renderSheet(
  run: VjRun,
  options: { eventCard?: VjEventCard; activePackId?: string | null } = {},
) {
  const renderedView = render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjEventCardSheet
          eventCard={options.eventCard ?? HIDDEN_CARD}
          activePackId={
            options.activePackId === undefined ? PACK_ID : options.activePackId
          }
          run={run}
          isBlocked={false}
          onClose={() => {}}
        />
      </LazyMotion>
    </TestProviders>,
  );
  await awaitCatalog("vj");
  return renderedView;
}

/** Clicks, then lets the command's promise settle inside act. */
async function clickAndSettle(element: HTMLElement) {
  fireEvent.click(element);
  await act(() => Promise.resolve());
}

describe("VjEventCardSheet", () => {
  beforeEach(() => {
    queryMock.data = packEventOf(makeCard());
    queryMock.error = null;
    queryMock.calls = [];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("says the pack has no event linked and links the library", async () => {
    queryMock.data = packEventOf(null);
    await renderSheet(createRun());
    expect(
      screen.getByText(
        "This pack has no event linked. Link one in the VJ library",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open the VJ library" }),
    ).toHaveAttribute("href", routes.adminVj);
    expect(
      screen.queryByRole("button", { name: "Show the event QR code" }),
    ).not.toBeInTheDocument();
  });

  it("names a cancelled event", async () => {
    queryMock.data = packEventOf(null, "cancelled");
    await renderSheet(createRun());
    expect(
      screen.getByText(
        "The linked event was cancelled. Link another one in the VJ library",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open the VJ library" }),
    ).toBeInTheDocument();
  });

  it("asks for a pack while none is active and leaves the query off", async () => {
    await renderSheet(createRun(), { activePackId: null });
    expect(
      screen.getByText("Pick a pack to see its event"),
    ).toBeInTheDocument();
    expect(queryMock.calls.at(-1)).toEqual({
      packId: null,
      isEnabled: false,
    });
  });

  it("shows the event title and date", async () => {
    await renderSheet(createRun());
    expect(screen.getByText("Linked event")).toBeInTheDocument();
    expect(screen.getByText("Sunday tea dance")).toBeInTheDocument();
    expect(screen.getByText("Intendente")).toBeInTheDocument();
    // 17:00 UTC is 17:00 in Lisbon in November: the line uses the event's zone.
    const expectedDate = new Intl.DateTimeFormat("en", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Europe/Lisbon",
    }).format(new Date("2026-11-15T17:00:00.000Z"));
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it("Show the event QR code sends kind qr", async () => {
    const run = createRun();
    await renderSheet(run);
    await clickAndSettle(
      screen.getByRole("button", { name: "Show the event QR code" }),
    );
    expect(run).toHaveBeenCalledWith("setEventCard", {
      isVisible: true,
      kind: "qr",
    });
  });

  it("presses the kind the screens show", async () => {
    await renderSheet(createRun(), {
      eventCard: { isVisible: true, kind: "nextEvent" },
    });
    expect(
      screen.getByRole("button", { name: "Show the next event card" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Show the event QR code" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("Hide event card sends isVisible false", async () => {
    const run = createRun();
    await renderSheet(run, { eventCard: { isVisible: true, kind: "qr" } });
    await clickAndSettle(
      screen.getByRole("button", { name: "Hide event card" }),
    );
    expect(run).toHaveBeenCalledWith("setEventCard", { isVisible: false });
  });

  it("a no-event refusal names its reason", async () => {
    const run = createRun({
      ok: false,
      code: "vj_event_card_no_event",
      errorKey: VJ_SOCKET_REASON_KEY.vj_event_card_no_event,
    });
    await renderSheet(run);
    await clickAndSettle(
      screen.getByRole("button", { name: "Show the next event card" }),
    );
    expect(
      await within(screen.getByRole("dialog")).findByRole("alert"),
    ).toHaveTextContent("Link this pack to an event in the library first");
  });

  it("a load failure names its reason", async () => {
    queryMock.data = undefined;
    queryMock.error = new ApiError(404, "Not Found", {
      code: "VJ_PACK_NOT_FOUND",
    });
    await renderSheet(createRun());
    expect(
      within(screen.getByRole("dialog")).getByRole("alert"),
    ).toHaveTextContent("This pack was deleted, maybe in another tab");
  });
});
