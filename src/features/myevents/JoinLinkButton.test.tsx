import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { eventKeys } from "../gatherings/api/eventKeys";
import { JoinLinkButton } from "./JoinLinkButton";
import type { MyEvent } from "./myEvents.types";

const ROOM_URL = "https://room.example/abc";

interface JoinLinkMocks {
  toast: ReturnType<typeof vi.fn>;
  getEvent: ReturnType<typeof vi.fn>;
}

const mocks = vi.hoisted<JoinLinkMocks>(() => ({
  toast: vi.fn(),
  getEvent: vi.fn(),
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("./MyEventsContext", () => ({
  useMyEvents: () => ({ toast: mocks.toast }),
}));
vi.mock("../gatherings/api/events.api", () => ({
  getEvent: mocks.getEvent,
}));
vi.mock("../gatherings/api/events.adapters", () => ({
  detailToGathering: () => ({ onlineUrl: ROOM_URL }),
}));

const EVENT = { id: "e1", slug: "online-night" } as MyEvent;

function renderButton(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <JoinLinkButton ev={EVENT} className="" />
    </QueryClientProvider>,
  );
}

describe("JoinLinkButton", () => {
  let openSpy: MockInstance<typeof window.open>;

  beforeEach(() => {
    mocks.toast.mockReset();
    mocks.getEvent.mockReset().mockResolvedValue({});
    openSpy = vi.spyOn(window, "open").mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens a warmed link inside the click with noopener and noreferrer", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(eventKeys.detail(EVENT.slug, false), {
      gathering: { onlineUrl: ROOM_URL },
    });
    renderButton(queryClient);

    fireEvent.click(screen.getByRole("button"));

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(
      ROOM_URL,
      "_blank",
      "noopener,noreferrer",
    );
    expect(mocks.getEvent).not.toHaveBeenCalled();
  });

  it("turns a cold click into a real link and opens no window after the fetch", async () => {
    renderButton(new QueryClient());

    fireEvent.click(screen.getByRole("button"));
    const link = await screen.findByRole("link");

    expect(openSpy).not.toHaveBeenCalled();
    expect(link.getAttribute("href")).toBe(ROOM_URL);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(document.activeElement).toBe(link);
    expect(mocks.toast).toHaveBeenCalledWith(
      "myevents:card.joinLinkReadyToast",
    );
  });

  it("drops the ready link when the cached detail changes its link", async () => {
    const queryClient = new QueryClient();
    renderButton(queryClient);

    fireEvent.click(screen.getByRole("button"));
    await screen.findByRole("link");
    act(() => {
      queryClient.setQueryData(eventKeys.detail(EVENT.slug, false), {
        gathering: { onlineUrl: "https://room.example/moved" },
      });
    });

    // React Query tells its observers on a setTimeout(0), after this act.
    await waitFor(() => expect(screen.queryByRole("link")).toBeNull());
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("fetches nothing for a pointer that only passes over the button", () => {
    vi.useFakeTimers();
    try {
      renderButton(new QueryClient());
      const button = screen.getByRole("button");

      fireEvent.pointerEnter(button);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      fireEvent.pointerLeave(button);
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mocks.getEvent).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("warms the link once the pointer rests on the button", () => {
    vi.useFakeTimers();
    try {
      renderButton(new QueryClient());

      fireEvent.pointerEnter(screen.getByRole("button"));
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(mocks.getEvent).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
