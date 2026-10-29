import { QueryClient } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { ApiError } from "../../../shared/api/client";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import type { StudioAccessRequestState } from "../api/useStudioAccess";
import { StudioLandingCta } from "./StudioLandingCta";

const mocks: {
  requestState: StudioAccessRequestState;
  request: Mock<(variables: { wantsToRelease: boolean }) => Promise<unknown>>;
  cancel: Mock<() => Promise<void>>;
} = vi.hoisted(() => ({
  requestState: {
    isKnown: true,
    hasPendingRequest: false,
    wantsToRelease: false,
  },
  request: vi.fn(),
  cancel: vi.fn(),
}));

vi.mock("../api/useStudioAccess", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/useStudioAccess")>()),
  useStudioAccessRequestState: () => mocks.requestState,
}));
vi.mock("../api/useStudioAccessRequest", async () => {
  const { useMutation } = await import("@tanstack/react-query");
  return {
    useRequestStudioAccess: () =>
      useMutation({
        mutationFn: (variables: { wantsToRelease: boolean }) =>
          mocks.request(variables),
      }),
    useCancelStudioAccessRequest: () =>
      useMutation({ mutationFn: () => mocks.cancel() }),
  };
});

const REQUEST_BUTTON = "Request Studio access";
const MAKES_MUSIC = "I make music and want to release it on Studio";

function apiErrorWithCode(status: number, code: string | null) {
  return new ApiError(status, "Request refused", code ? { code } : {});
}

/** Renders with one query client, so `rerenderWith` keeps the cache and the
 *  component's own state across an audience change. */
function renderCta(element: ReactElement, isSignedIn: boolean) {
  if (!isSignedIn) localStorage.setItem(AUTH_STORAGE_KEY, "false");
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <TestProviders queryClient={queryClient}>{element}</TestProviders>,
  );
  return {
    rerenderWith: (next: ReactElement) =>
      view.rerender(
        <TestProviders queryClient={queryClient}>{next}</TestProviders>,
      ),
  };
}

function renderSignedOut(element: ReactElement) {
  return renderCta(element, false);
}

function renderMember(
  element: ReactElement,
  requestState: Partial<StudioAccessRequestState> = {},
) {
  mocks.requestState = { ...mocks.requestState, ...requestState };
  return renderCta(element, true);
}

beforeEach(() => {
  mocks.requestState = {
    isKnown: true,
    hasPendingRequest: false,
    wantsToRelease: false,
  };
  mocks.request.mockReset();
  mocks.cancel.mockReset();
  mocks.request.mockResolvedValue({
    hasPendingRequest: true,
    wantsToRelease: true,
    requestedAt: "2026-10-28T12:00:00.000Z",
  });
  mocks.cancel.mockResolvedValue(undefined);
});

afterEach(() => {
  localStorage.clear();
});

describe("StudioLandingCta signed out", () => {
  it("the invite link carries the audience's source", async () => {
    const { rerenderWith } = renderSignedOut(
      <StudioLandingCta placement="hero" audience="listener" />,
    );
    expect(
      await screen.findByRole("link", { name: "Request an invite" }),
    ).toHaveAttribute("href", "/auth/request-invite?from=studio_landing");
    rerenderWith(<StudioLandingCta placement="hero" audience="artist" />);
    expect(
      await screen.findByRole("link", { name: "Apply as an artist" }),
    ).toHaveAttribute("href", "/auth/request-invite?from=studio_artist");
    expect(screen.queryByRole("button", { name: REQUEST_BUTTON })).toBeNull();
  });

  it("the For artists and closing placements keep the invite links", async () => {
    const { rerenderWith } = renderSignedOut(
      <StudioLandingCta placement="artists" audience="artist" />,
    );
    expect(
      await screen.findByRole("link", { name: "Apply as an artist" }),
    ).toHaveAttribute("href", "/auth/request-invite?from=studio_artist");
    rerenderWith(<StudioLandingCta placement="closing" audience="listener" />);
    expect(
      await screen.findByRole("link", { name: "Request an invite" }),
    ).toHaveAttribute("href", "/auth/request-invite?from=studio_landing");
  });
});

/** The server's answer lands in the request state, as the real hooks write
 *  it into the GET /studio/me read. */
function landOnTheList() {
  mocks.request.mockImplementation((variables) => {
    mocks.requestState = {
      isKnown: true,
      hasPendingRequest: true,
      wantsToRelease: variables.wantsToRelease,
    };
    return Promise.resolve({ hasPendingRequest: true, ...variables });
  });
}

describe("StudioLandingCta for a member without Studio access", () => {
  it("ticks I make music for the artist audience and posts the wish", async () => {
    renderMember(<StudioLandingCta placement="hero" audience="artist" />);
    expect(
      await screen.findByRole("button", { name: MAKES_MUSIC }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: REQUEST_BUTTON }));
    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith({ wantsToRelease: true }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Request sent. You're on the list",
    );
    expect(
      screen.queryByRole("link", { name: "Request an invite" }),
    ).toBeNull();
  });

  it("leaves I make music unticked for the listener audience", async () => {
    renderMember(<StudioLandingCta placement="hero" audience="listener" />);
    expect(
      await screen.findByRole("button", { name: MAKES_MUSIC }),
    ).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: REQUEST_BUTTON }));
    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith({ wantsToRelease: false }),
    );
  });

  it("follows the audience until the member ticks the box themselves", async () => {
    const { rerenderWith } = renderMember(
      <StudioLandingCta placement="hero" audience="listener" />,
    );
    const makesMusic = await screen.findByRole("button", { name: MAKES_MUSIC });
    expect(makesMusic).toHaveAttribute("aria-pressed", "false");
    rerenderWith(<StudioLandingCta placement="hero" audience="artist" />);
    expect(screen.getByRole("button", { name: MAKES_MUSIC })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: MAKES_MUSIC }));
    rerenderWith(<StudioLandingCta placement="hero" audience="listener" />);
    rerenderWith(<StudioLandingCta placement="hero" audience="artist" />);
    expect(screen.getByRole("button", { name: MAKES_MUSIC })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows the artist line on the list and cancels", async () => {
    renderMember(<StudioLandingCta placement="hero" audience="listener" />, {
      hasPendingRequest: true,
      wantsToRelease: true,
    });
    expect(await screen.findByText("You're on the list")).toBeInTheDocument();
    expect(
      screen.getByText(/our team looks at your request first/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: REQUEST_BUTTON })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cancel request" }));
    await waitFor(() => expect(mocks.cancel).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Request cancelled",
    );
  });

  it("shows the listener line on the list for a listener request", async () => {
    renderMember(<StudioLandingCta placement="hero" audience="artist" />, {
      hasPendingRequest: true,
      wantsToRelease: false,
    });
    expect(
      await screen.findByText(
        "You get a notification when Studio opens for you.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/our team looks at your request first/),
    ).toBeNull();
  });

  it("names the reason a request failed", async () => {
    mocks.request.mockRejectedValue(apiErrorWithCode(503, null));
    renderMember(<StudioLandingCta placement="hero" audience="listener" />);
    fireEvent.click(
      await screen.findByRole("button", { name: REQUEST_BUTTON }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't send your request. Our server couldn't save this. This one is on us, so try again in a moment",
    );
  });

  it("names the reason a cancel failed", async () => {
    mocks.cancel.mockRejectedValue(apiErrorWithCode(503, null));
    renderMember(<StudioLandingCta placement="hero" audience="listener" />, {
      hasPendingRequest: true,
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Cancel request" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /^We couldn't cancel your request\. Our server couldn't save this/,
    );
  });

  it("shows no failure line for a request that already exists", async () => {
    mocks.request.mockRejectedValue(
      apiErrorWithCode(409, "studio_access_request_exists"),
    );
    renderMember(<StudioLandingCta placement="hero" audience="listener" />);
    fireEvent.click(
      await screen.findByRole("button", { name: REQUEST_BUTTON }),
    );
    await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a quiet checking line while the access read is pending, and no invite link", async () => {
    renderMember(<StudioLandingCta placement="hero" audience="listener" />, {
      isKnown: false,
    });
    expect(
      await screen.findByText("Checking your Studio access"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Request an invite" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: REQUEST_BUTTON })).toBeNull();
  });

  it("moves focus to the on-list title after sending", async () => {
    landOnTheList();
    renderMember(<StudioLandingCta placement="hero" audience="listener" />);
    fireEvent.click(
      await screen.findByRole("button", { name: REQUEST_BUTTON }),
    );
    await waitFor(() =>
      expect(screen.getByText("You're on the list")).toHaveFocus(),
    );
  });

  it("moves focus to Request Studio access after cancelling", async () => {
    mocks.cancel.mockImplementation(() => {
      mocks.requestState = {
        isKnown: true,
        hasPendingRequest: false,
        wantsToRelease: false,
      };
      return Promise.resolve();
    });
    renderMember(<StudioLandingCta placement="hero" audience="listener" />, {
      hasPendingRequest: true,
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Cancel request" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: REQUEST_BUTTON }),
      ).toHaveFocus(),
    );
  });
});

describe("StudioLandingCta compact member variant", () => {
  it("For artists shows the button alone and asks as an artist", async () => {
    landOnTheList();
    renderMember(<StudioLandingCta placement="artists" audience="listener" />);
    fireEvent.click(
      await screen.findByRole("button", { name: REQUEST_BUTTON }),
    );
    expect(screen.queryByRole("button", { name: MAKES_MUSIC })).toBeNull();
    expect(
      screen.queryByText(/Our team opens Studio to members in waves/),
    ).toBeNull();
    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith({ wantsToRelease: true }),
    );
    await waitFor(() =>
      expect(screen.getByText("You're on the list")).toHaveFocus(),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Request sent. You're on the list",
    );
  });

  it("the closing posts the audience", async () => {
    renderMember(<StudioLandingCta placement="closing" audience="listener" />);
    fireEvent.click(
      await screen.findByRole("button", { name: REQUEST_BUTTON }),
    );
    await waitFor(() =>
      expect(mocks.request).toHaveBeenCalledWith({ wantsToRelease: false }),
    );
  });

  it("on the list shows one line and no Cancel request", async () => {
    renderMember(<StudioLandingCta placement="closing" audience="artist" />, {
      hasPendingRequest: true,
      wantsToRelease: true,
    });
    expect(await screen.findByText("You're on the list")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel request" })).toBeNull();
    expect(
      screen.queryByText(/our team looks at your request first/),
    ).toBeNull();
  });
});
