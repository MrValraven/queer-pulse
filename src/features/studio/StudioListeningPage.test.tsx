import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  demoPutStudioPlayback,
  resetDemoPlayback,
} from "./api/studioDemoPlayback";
import { resetDemoYourListening } from "./api/studioDemoYourListening";
import { StudioListeningPage } from "./StudioListeningPage";

const mocks: { isEmptyListener: boolean } = vi.hoisted(() => ({
  isEmptyListener: false,
}));

// The two reads behind the welcome state. The real hooks always run, so the
// hook order stays the same; an empty listener swaps in loaded empty answers.
vi.mock("./api/useStudioListening", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioListening")>();
  const loadedState = {
    isLoading: false,
    isError: false,
    isRetrying: false,
    isNotFound: false,
    isWithdrawn: false,
    isTrackWithheld: false,
    retry: () => {},
  };
  return {
    ...original,
    useStudioListeningRecent: () => {
      const recent = original.useStudioListeningRecent();
      if (!mocks.isEmptyListener) return recent;
      return {
        items: [],
        loadState: loadedState,
        hasMore: false,
        isFetchingNextPage: false,
        isFetchNextPageError: false,
        fetchNextPage: () => {},
      };
    },
    useStudioListeningSupporting: () => {
      const supporting = original.useStudioListeningSupporting();
      if (!mocks.isEmptyListener) return supporting;
      return { items: [], loadState: loadedState };
    },
  };
});

function mockEmptyListener() {
  mocks.isEmptyListener = true;
}

function renderPage(path = "/studio/listening") {
  render(
    <TestProviders initialEntries={[path]}>
      <StudioListeningPage />
    </TestProviders>,
  );
}

beforeEach(() => {
  mocks.isEmptyListener = false;
  resetDemoYourListening();
  resetDemoPlayback();
});

describe("StudioListeningPage (demo)", () => {
  it("opens with the heading, the switch on and Clear", async () => {
    renderPage();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Your listening" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Only you can see this page")).toBeInTheDocument();
    expect(
      await screen.findByRole("switch", { name: "Listening history" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("button", { name: "Clear listening history" }),
    ).toBeInTheDocument();
  });

  it("shows the paused banner while paused and turns history back on from it", async () => {
    renderPage();
    fireEvent.click(
      await screen.findByRole("switch", { name: "Listening history" }),
    );
    expect(
      await screen.findByText(/^History is paused\. New plays stay out/),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Turn history back on" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("switch", { name: "Listening history" }),
      ).toHaveAttribute("aria-checked", "true"),
    );
  });

  it("clears the history after the confirm dialog and keeps the artists you support", async () => {
    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: "Clear listening history" }),
    );
    fireEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Clear listening history",
      }),
    );
    expect(
      await screen.findByText("Play a track for 30 seconds and it lands here"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Artists you support" }),
    ).toBeInTheDocument();
  });

  it("welcomes a new listener with the empty state", async () => {
    mockEmptyListener();
    renderPage();
    expect(
      await screen.findByRole("heading", {
        name: "Your listening starts here",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open Studio home" }),
    ).toHaveAttribute("href", "/studio");
  });

  it("tells a new listener with history paused how to turn it back on", async () => {
    mockEmptyListener();
    demoPutStudioPlayback({ isListeningHistoryOn: false });
    renderPage();
    expect(
      await screen.findByText(
        "Your listening history is paused. Turn it back on and your top artists and tracks start to fill in",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your listening starts here" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/^Play a track for 30 seconds/),
    ).not.toBeInTheDocument();
  });

  it("reads the range from the address", async () => {
    renderPage("/studio/listening?range=12m");
    expect(
      await screen.findByRole("button", { name: "12 months" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
