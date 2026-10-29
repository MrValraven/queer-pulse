import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import type {
  StudioWelcomeDTO,
  StudioWelcomeUpdateDTO,
} from "./api/studio.types";
import {
  STUDIO_TASTE_STORAGE_KEY,
  STUDIO_WELCOME_SEEN_STORAGE_KEY,
} from "./studioFirstRunConstants";
import {
  writeStudioTaste,
  writeStudioWelcomeSeen,
} from "./studioFirstRunTaste";
import { StudioFirstRun } from "./StudioFirstRun";
import { resetStudioWelcomeMigrationForTests } from "./useStudioWelcomeMigration";

const SHEET_LABEL = vi.hoisted(() => "finish");
const harness = vi.hoisted(() => ({
  demoMode: false,
  hasAccess: true,
  memberId: "member-1",
}));
const showToast = vi.hoisted(() => vi.fn());
const getStudioWelcome = vi.hoisted(() =>
  vi.fn<() => Promise<StudioWelcomeDTO>>(),
);
const putStudioWelcome = vi.hoisted(() =>
  vi.fn<(update: StudioWelcomeUpdateDTO) => Promise<StudioWelcomeDTO>>(),
);

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: harness.demoMode }),
}));
vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => ({ user: { id: harness.memberId } }),
}));
vi.mock("../../app/providers/useConsent", () => ({
  useConsent: () => ({ status: "set" }),
}));
vi.mock("./api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: harness.hasAccess ? "granted" : "denied",
    hasAccess: harness.hasAccess,
    isPending: false,
    uploadablePersonas: [],
  }),
}));
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("./api/studioWelcome.api", () => ({
  getStudioWelcome: () => getStudioWelcome(),
  putStudioWelcome: (update: StudioWelcomeUpdateDTO) =>
    putStudioWelcome(update),
}));
// The sheet is a lazy chunk; a stand-in with one finish button keeps this
// test on the decision and the save.
vi.mock("./StudioFirstRunSheet", () => ({
  StudioFirstRunSheet: (props: {
    onClose: (
      picks: { genres: string[]; moods: string[] },
      isFinished: boolean,
    ) => void;
  }) => (
    <button
      type="button"
      data-testid="first-run-sheet"
      onClick={() =>
        props.onClose({ genres: ["fado"], moods: ["tender"] }, true)
      }
    >
      {SHEET_LABEL}
    </button>
  ),
}));

const NOT_SEEN: StudioWelcomeDTO = {
  hasSeenWelcome: false,
  welcomeSeenAt: null,
  genres: [],
  moods: [],
};
const SEEN: StudioWelcomeDTO = {
  hasSeenWelcome: true,
  welcomeSeenAt: "2026-10-01T10:00:00.000Z",
  genres: ["fado"],
  moods: [],
};

let memberCounter = 0;

function renderWelcome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <StudioFirstRun />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

beforeEach(() => {
  memberCounter += 1;
  harness.demoMode = false;
  harness.hasAccess = true;
  harness.memberId = `member-${memberCounter}`;
  showToast.mockClear();
  getStudioWelcome.mockReset();
  putStudioWelcome.mockReset();
  putStudioWelcome.mockResolvedValue(SEEN);
  resetStudioWelcomeMigrationForTests();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("the Studio welcome on an account", () => {
  it("does not open when the account has already seen it", async () => {
    getStudioWelcome.mockResolvedValue(SEEN);
    renderWelcome();
    await waitFor(() => expect(getStudioWelcome).toHaveBeenCalled());
    await settle();
    expect(screen.queryByTestId("first-run-sheet")).toBeNull();
  });

  it("opens on the first visit of an account that has not seen it", async () => {
    getStudioWelcome.mockResolvedValue(NOT_SEEN);
    renderWelcome();
    expect(await screen.findByTestId("first-run-sheet")).toBeInTheDocument();
  });

  it("stays shut when the account cannot be read", async () => {
    getStudioWelcome.mockRejectedValue(new ApiError(500, "boom"));
    renderWelcome();
    await waitFor(() => expect(getStudioWelcome).toHaveBeenCalled());
    await settle();
    expect(screen.queryByTestId("first-run-sheet")).toBeNull();
    expect(showToast).not.toHaveBeenCalled();
  });

  it("saves the seen flag and the picks to the account when closed", async () => {
    getStudioWelcome.mockResolvedValue(NOT_SEEN);
    renderWelcome();
    await userEvent.click(await screen.findByTestId("first-run-sheet"));
    await waitFor(() =>
      expect(putStudioWelcome).toHaveBeenCalledWith({
        hasSeenWelcome: true,
        genres: ["fado"],
        moods: ["tender"],
      }),
    );
    await waitFor(() =>
      expect(screen.queryByTestId("first-run-sheet")).toBeNull(),
    );
    expect(window.localStorage.getItem(STUDIO_WELCOME_SEEN_STORAGE_KEY)).toBe(
      null,
    );
  });

  it("names the reason when the save is refused and does not reopen", async () => {
    getStudioWelcome.mockResolvedValue(NOT_SEEN);
    putStudioWelcome.mockRejectedValue(new ApiError(500, "boom"));
    renderWelcome();
    await userEvent.click(await screen.findByTestId("first-run-sheet"));
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        "studio:errors.save.server",
        "error",
      ),
    );
    await settle();
    expect(screen.queryByTestId("first-run-sheet")).toBeNull();
  });
});

describe("a welcome finished on this device before it moved to the account", () => {
  it("uploads the device copy, removes it and does not open", async () => {
    getStudioWelcome.mockResolvedValue(NOT_SEEN);
    writeStudioWelcomeSeen(harness.memberId);
    writeStudioTaste(harness.memberId, { genres: ["fado"], moods: ["tender"] });
    renderWelcome();
    await waitFor(() =>
      expect(putStudioWelcome).toHaveBeenCalledWith({
        hasSeenWelcome: true,
        genres: ["fado"],
        moods: ["tender"],
      }),
    );
    await waitFor(() =>
      expect(window.localStorage.getItem(STUDIO_TASTE_STORAGE_KEY)).toBeNull(),
    );
    expect(window.localStorage.getItem(STUDIO_WELCOME_SEEN_STORAGE_KEY)).toBe(
      null,
    );
    expect(screen.queryByTestId("first-run-sheet")).toBeNull();
    expect(putStudioWelcome).toHaveBeenCalledTimes(1);
  });

  it("keeps the device copy and tries once when the upload is refused", async () => {
    getStudioWelcome.mockResolvedValue(NOT_SEEN);
    putStudioWelcome.mockRejectedValue(new ApiError(500, "boom"));
    writeStudioWelcomeSeen(harness.memberId);
    renderWelcome();
    await waitFor(() => expect(putStudioWelcome).toHaveBeenCalled());
    await settle();
    expect(
      window.localStorage.getItem(STUDIO_WELCOME_SEEN_STORAGE_KEY),
    ).not.toBe(null);
    expect(screen.queryByTestId("first-run-sheet")).toBeNull();
    expect(showToast).not.toHaveBeenCalled();
    expect(putStudioWelcome).toHaveBeenCalledTimes(1);
  });

  it("removes a leftover device copy when the account already has the welcome", async () => {
    getStudioWelcome.mockResolvedValue(SEEN);
    writeStudioWelcomeSeen(harness.memberId);
    renderWelcome();
    await waitFor(() =>
      expect(
        window.localStorage.getItem(STUDIO_WELCOME_SEEN_STORAGE_KEY),
      ).toBeNull(),
    );
    expect(putStudioWelcome).not.toHaveBeenCalled();
  });
});

describe("the demo", () => {
  it("never calls the account", async () => {
    harness.demoMode = true;
    renderWelcome();
    await settle();
    expect(getStudioWelcome).not.toHaveBeenCalled();
    expect(putStudioWelcome).not.toHaveBeenCalled();
  });
});
