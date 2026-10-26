import { StrictMode, type ReactNode } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import {
  closeReauthDialog,
  forgetReauthChallenge,
  openReauthDialog,
  readLiveReauthChallenge,
} from "./api/reauthDialogStore";
import { ReauthCodeDialog } from "./ReauthCodeDialog";

const harness = vi.hoisted(() => ({
  hasGoogle: true,
  codeRequests: vi.fn(),
  // When set, every code request is refused with this error.
  requestFailure: null as Error | null,
  // The dialog alone reads as live, so its Google branch shows while every
  // provider and mock answer stays in demo.
  isLive: false,
}));

vi.mock("./useReauthCodeFlow", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./useReauthCodeFlow")>();
  return {
    ...actual,
    useReauthCodeFlow: (
      ...args: Parameters<typeof actual.useReauthCodeFlow>
    ) => {
      const flow = actual.useReauthCodeFlow(...args);
      return harness.isLive ? { ...flow, isDemo: false } : flow;
    },
  };
});

// Counts every reauth code request where it enters the mutation, so a test
// sees each call the dialog makes, demo answer or not.
vi.mock("../auth/api/useEmailCode", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../auth/api/useEmailCode")>();
  return {
    ...actual,
    useRequestReauthCode: () => {
      const real = actual.useRequestReauthCode();
      return {
        ...real,
        mutateAsync: (...args: Parameters<typeof real.mutateAsync>) => {
          harness.codeRequests(...args);
          if (harness.requestFailure !== null) {
            return Promise.reject(harness.requestFailure);
          }
          return real.mutateAsync(...args);
        },
      };
    },
  };
});

vi.mock("../../app/providers/authContext", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../app/providers/authContext")>();
  return {
    ...actual,
    useAuth: () => {
      const real = actual.useAuth();
      return real.user
        ? { ...real, user: { ...real.user, hasGoogle: harness.hasGoogle } }
        : real;
    },
  };
});

const SENT_TO_SENTENCE =
  "We sent a code to you@queerpulse.test. It works for 10 minutes.";

/** Demo answers wait 400ms, so the slower steps get a longer window. */
const DEMO_WAIT = { timeout: 3000 };

function renderDialog(
  wrap: (dialog: ReactNode) => ReactNode = (dialog) => dialog,
) {
  return render(<TestProviders>{wrap(<ReauthCodeDialog />)}</TestProviders>);
}

function findSentTo() {
  return screen.findByText(
    (_, element) =>
      element?.tagName === "P" && element.textContent === SENT_TO_SENTENCE,
    undefined,
    DEMO_WAIT,
  );
}

function enterCode(code: string) {
  const [firstBox] = screen.getAllByRole<HTMLInputElement>("textbox");
  if (!firstBox) throw new Error("the code boxes are missing");
  fireEvent.change(firstBox, { target: { value: code } });
}

function resetHarness() {
  harness.hasGoogle = true;
  harness.requestFailure = null;
  harness.isLive = false;
  sessionStorage.clear();
  harness.codeRequests.mockClear();
  forgetReauthChallenge();
}

function closeDialog() {
  act(() => closeReauthDialog());
}

describe("ReauthCodeDialog", () => {
  beforeEach(resetHarness);
  afterEach(closeDialog);

  it("emails a code to the account address on open", async () => {
    renderDialog();
    act(() => openReauthDialog());
    expect(await findSentTo()).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Confirm it's you" }),
    ).toBeInTheDocument();
  });

  it("requests one code under StrictMode", async () => {
    renderDialog((dialog) => <StrictMode>{dialog}</StrictMode>);
    act(() => openReauthDialog());
    await findSentTo();
    expect(harness.codeRequests).toHaveBeenCalledTimes(1);
  });

  it("shows the code boxes on a reopen inside the cooldown without asking again", async () => {
    renderDialog();
    act(() => openReauthDialog());
    await findSentTo();
    act(() => closeReauthDialog());
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }, DEMO_WAIT);

    act(() => openReauthDialog());
    expect(await findSentTo()).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
    expect(harness.codeRequests).toHaveBeenCalledTimes(1);
  });

  it("a verified code clears the kept challenge", async () => {
    renderDialog();
    act(() => openReauthDialog());
    await findSentTo();
    expect(readLiveReauthChallenge("demo")).not.toBeNull();
    enterCode("123456");
    await waitFor(() => {
      expect(sessionStorage.getItem("qp_reauth_token")).toBe(
        "demo-reauth-code",
      );
    }, DEMO_WAIT);
    expect(readLiveReauthChallenge("demo")).toBeNull();
  });

  it("a late verify leaves a dialog opened after it open", async () => {
    const firstConfirmed = vi.fn();
    renderDialog();
    act(() => openReauthDialog({ onConfirmed: firstConfirmed }));
    await findSentTo();
    enterCode("123456");
    // Open again while the first check is still waiting on its answer.
    act(() => openReauthDialog());
    await waitFor(() => {
      expect(sessionStorage.getItem("qp_reauth_token")).toBe(
        "demo-reauth-code",
      );
    }, DEMO_WAIT);
    await waitFor(() => {
      expect(screen.getAllByRole("dialog")).toHaveLength(1);
    }, DEMO_WAIT);
    // Longer than a closing dialog's exit, so a wrongly closed one is gone.
    await act(
      () => new Promise<void>((resolve) => window.setTimeout(resolve, 600)),
    );
    expect(firstConfirmed).not.toHaveBeenCalled();
    const secondDialog = screen.getByRole("dialog", {
      name: "Confirm it's you",
    });
    expect(secondDialog).not.toHaveAttribute("inert");
  });

  it("a good code caches the token, confirms and closes", async () => {
    const onConfirmed = vi.fn();
    renderDialog();
    act(() => openReauthDialog({ onConfirmed }));
    await findSentTo();
    enterCode("123456");
    await waitFor(() => {
      expect(sessionStorage.getItem("qp_reauth_token")).toBe(
        "demo-reauth-code",
      );
    }, DEMO_WAIT);
    expect(onConfirmed).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }, DEMO_WAIT);
  });

  it("000000 shows the incorrect-code reason and stays open", async () => {
    const onConfirmed = vi.fn();
    renderDialog();
    act(() => openReauthDialog({ onConfirmed }));
    await findSentTo();
    enterCode("000000");
    expect(
      await screen.findByText(
        "That code is incorrect. You have 4 tries left.",
        undefined,
        DEMO_WAIT,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(sessionStorage.getItem("qp_reauth_token")).toBeNull();
    expect(onConfirmed).not.toHaveBeenCalled();
  });
});

describe("ReauthCodeDialog alternatives, focus and refusals", () => {
  beforeEach(resetHarness);
  afterEach(closeDialog);

  it("offers Google only when the account has it", async () => {
    harness.isLive = true;
    harness.hasGoogle = false;
    renderDialog();
    act(() => openReauthDialog());
    await findSentTo();
    expect(
      screen.queryByRole("button", { name: "Confirm with Google instead" }),
    ).not.toBeInTheDocument();
  });

  it("offers no Google in demo, where its round trip cannot run", async () => {
    renderDialog();
    act(() => openReauthDialog());
    await findSentTo();
    expect(
      screen.queryByRole("button", { name: "Confirm with Google instead" }),
    ).not.toBeInTheDocument();
  });

  it("offers Google to an account that has it", async () => {
    harness.isLive = true;
    renderDialog();
    act(() => openReauthDialog());
    expect(
      await screen.findByRole("button", {
        name: "Confirm with Google instead",
      }),
    ).toBeInTheDocument();
  });

  it("opens a reopen with a kept code on its first box", async () => {
    renderDialog();
    act(() => openReauthDialog());
    await findSentTo();
    act(() => closeReauthDialog());
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }, DEMO_WAIT);

    act(() => openReauthDialog());
    await findSentTo();
    const [firstBox] = screen.getAllByRole("textbox");
    await waitFor(() => {
      expect(document.activeElement).toBe(firstBox);
    }, DEMO_WAIT);
  });

  it("a code opened without onConfirmed says to press the button again", async () => {
    renderDialog();
    act(() => openReauthDialog());
    await findSentTo();
    enterCode("123456");
    expect(
      await screen.findByText(
        "Confirmed it's you. Press the same button again to finish.",
        undefined,
        DEMO_WAIT,
      ),
    ).toBeInTheDocument();
  });

  it("a code opened with onConfirmed leaves the outcome to its caller", async () => {
    const onConfirmed = vi.fn();
    renderDialog();
    act(() => openReauthDialog({ onConfirmed }));
    await findSentTo();
    enterCode("123456");
    await waitFor(() => {
      expect(onConfirmed).toHaveBeenCalledTimes(1);
    }, DEMO_WAIT);
    expect(screen.queryByText(/Confirmed it's you/)).not.toBeInTheDocument();
  });

  it("a timed refusal before any code offers Send a code once the time comes", async () => {
    harness.requestFailure = new ApiError(429, "Too many requests", {
      reason: "network_busy",
      retryAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
    renderDialog();
    act(() => openReauthDialog());
    const sendCode = await screen.findByRole(
      "button",
      { name: "Send a code" },
      DEMO_WAIT,
    );
    expect(sendCode).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Send a new code" }),
    ).not.toBeInTheDocument();
  });

  it("an untimed refusal before any code offers Send a code at once", async () => {
    harness.requestFailure = new ApiError(503, "Service unavailable", {
      reason: "email_send_failed",
    });
    renderDialog();
    act(() => openReauthDialog());
    const sendCode = await screen.findByRole(
      "button",
      { name: "Send a code" },
      DEMO_WAIT,
    );
    expect(sendCode).toBeEnabled();
  });
});
