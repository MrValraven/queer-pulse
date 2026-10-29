import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Route logging through a mock so we can assert "logs always" without touching
// the real Sentry bridge / console.
vi.mock("../observability/logger", () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
}));

import { ApiError } from "./client";
import { logError } from "../observability/logger";
import {
  codedReasonFor,
  handleMutationError,
  handleQueryError,
  setQueryErrorDemoMode,
  setQueryErrorToastEmitter,
} from "./errorHandling";
import { setErrorReasonLocale } from "./errorMessage";

const query = { queryKey: ["jobs"] };
const mutation = { options: { mutationKey: ["applyToJob"] } };

let emit: ReturnType<typeof vi.fn>;

beforeEach(() => {
  emit = vi.fn();
  setQueryErrorToastEmitter(emit);
  setQueryErrorDemoMode(false);
});

afterEach(() => {
  setQueryErrorToastEmitter(null);
  setQueryErrorDemoMode(false);
  vi.mocked(logError).mockClear();
});

describe("handleQueryError", () => {
  it("logs every failure, with the query key as context", () => {
    handleQueryError(new ApiError(500, "boom"), query);
    expect(logError).toHaveBeenCalledWith(expect.any(ApiError), {
      queryKey: ["jobs"],
    });
  });

  it("toasts an unexpected 5xx", () => {
    handleQueryError(new ApiError(503, "down"), query);
    expect(emit).toHaveBeenCalledWith(
      {
        title: "Something went wrong on our end",
        detail: "Please try again in a moment.",
      },
      "error",
      6000,
    );
  });

  it("stays silent for a <500 ApiError (pages own those states)", () => {
    handleQueryError(new ApiError(404, "nope"), query);
    handleQueryError(new ApiError(401, "unauth"), query);
    handleQueryError(new ApiError(403, "forbidden"), query);
    expect(emit).not.toHaveBeenCalled();
  });

  it("files no monitoring event for a withdrawn Studio release and still logs a bare 410", () => {
    handleQueryError(
      new ApiError(410, "This release was withdrawn.", {
        statusCode: 410,
        code: "studio_release_withdrawn",
        message: "This release was withdrawn.",
        error: "Gone",
      }),
      query,
    );
    expect(logError).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    handleQueryError(
      new ApiError(410, "Gone", { code: "SOMETHING_ELSE" }),
      query,
    );
    expect(logError).toHaveBeenCalledOnce();
  });

  it("files no monitoring event for a withheld Studio track", () => {
    handleQueryError(
      new ApiError(410, "This track is unavailable.", {
        statusCode: 410,
        code: "studio_track_withheld",
        message: "This track is unavailable.",
        error: "Gone",
      }),
      query,
    );
    expect(logError).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it("stays silent for a PLATFORM_LOCKED 503 (the lock provider owns that screen)", () => {
    // ToastProvider sits ABOVE PlatformLockProvider, so its viewport renders
    // over the maintenance screen. Without this carve-out a lockdown starting
    // mid-session stacks red server-error toasts on top of the calm
    // explanation that exists precisely to replace them.
    handleQueryError(
      new ApiError(503, "Locked", {
        code: "PLATFORM_LOCKED",
        message: "Back soon.",
      }),
      query,
    );
    expect(emit).not.toHaveBeenCalled();
    // Still logged — silence is a presentation decision, not an observability one.
    expect(logError).toHaveBeenCalledOnce();
  });

  it("still toasts a plain 503 that is not a platform lockdown", () => {
    handleQueryError(
      new ApiError(503, "down", { code: "SOMETHING_ELSE" }),
      query,
    );
    expect(emit).toHaveBeenCalledWith(
      {
        title: "Something went wrong on our end",
        detail: "Please try again in a moment.",
      },
      "error",
      6000,
    );
  });

  it("respects meta.silentError (a fail-soft query must not toast)", () => {
    handleQueryError(new ApiError(500, "boom"), {
      queryKey: ["platform-status", false],
      meta: { silentError: true },
    });
    expect(emit).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledOnce();
  });

  it("toasts a generic message for a non-Api (network) error", () => {
    handleQueryError(new TypeError("Failed to fetch"), query);
    expect(emit).toHaveBeenCalledWith(
      { title: "Something went wrong", detail: "Please try again." },
      "error",
      6000,
    );
  });

  it("names the lost connection for a network error while offline", () => {
    const onLineSpy = vi
      .spyOn(navigator, "onLine", "get")
      .mockReturnValue(false);
    handleQueryError(new TypeError("Failed to fetch"), query);
    expect(emit).toHaveBeenCalledWith(
      {
        title: "You're offline",
        detail: "Check your connection and try again.",
      },
      "error",
      6000,
    );
    onLineSpy.mockRestore();
  });

  it("is silent in demo mode even for a 5xx", () => {
    setQueryErrorDemoMode(true);
    handleQueryError(new ApiError(500, "boom"), query);
    expect(emit).not.toHaveBeenCalled();
    // …but it still logs.
    expect(logError).toHaveBeenCalledOnce();
  });

  it("no-ops safely when no emitter is wired", () => {
    setQueryErrorToastEmitter(null);
    expect(() =>
      handleQueryError(new ApiError(500, "boom"), query),
    ).not.toThrow();
  });
});

describe("handleMutationError", () => {
  it("logs with the mutation key", () => {
    handleMutationError(
      new ApiError(500, "boom"),
      undefined,
      undefined,
      mutation,
    );
    expect(logError).toHaveBeenCalledWith(expect.any(ApiError), {
      mutationKey: ["applyToJob"],
    });
  });

  it("always surfaces a failed write — a 403 becomes an access message", () => {
    handleMutationError(
      new ApiError(403, "forbidden"),
      undefined,
      undefined,
      mutation,
    );
    expect(emit).toHaveBeenCalledWith(
      { title: "You don't have access to that" },
      "error",
      6000,
    );
  });

  it("stays silent for a 401 (auth refresh owns it)", () => {
    handleMutationError(
      new ApiError(401, "unauth"),
      undefined,
      undefined,
      mutation,
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it("stays silent for a PLATFORM_LOCKED 503 (the lock provider owns that screen)", () => {
    handleMutationError(
      new ApiError(503, "Locked", { code: "PLATFORM_LOCKED", message: null }),
      undefined,
      undefined,
      mutation,
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it("is silent in demo mode", () => {
    setQueryErrorDemoMode(true);
    handleMutationError(
      new ApiError(500, "boom"),
      undefined,
      undefined,
      mutation,
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it("surfaces a specific 4xx reason to the mutation toast", () => {
    handleMutationError(
      new ApiError(409, "That name is taken"),
      undefined,
      undefined,
      { options: {} },
    );
    expect(emit).toHaveBeenCalledWith(
      { title: "That didn't go through", detail: "That name is taken." },
      "error",
      6000,
    );
  });

  it("falls back to the generic 4xx string for a bare status word", () => {
    handleMutationError(
      new ApiError(400, "Bad Request"),
      undefined,
      undefined,
      { options: {} },
    );
    expect(emit).toHaveBeenCalledWith(
      { title: "Something went wrong" },
      "error",
      6000,
    );
  });

  it("surfaces a specific 403 reason instead of the access generic", () => {
    handleMutationError(
      new ApiError(403, "You are blocked from this community"),
      undefined,
      undefined,
      { options: {} },
    );
    expect(emit).toHaveBeenCalledWith(
      {
        title: "That didn't go through",
        detail: "You are blocked from this community.",
      },
      "error",
      6000,
    );
  });

  it("names the appeal for a moderation restriction", () => {
    handleMutationError(
      new ApiError(403, "Your account is restricted.", {
        code: "ACCOUNT_RESTRICTED",
      }),
      undefined,
      undefined,
      { options: {} },
    );
    expect(emit).toHaveBeenCalledWith(
      {
        title: "A moderation restriction is in effect",
        detail: "You can appeal it from Safety, under Appeal a decision.",
      },
      "error",
      6000,
    );
  });
});

describe("handleMutationError with an email-code refusal", () => {
  it("keeps a refused code out of error monitoring", () => {
    handleMutationError(
      new ApiError(400, "x", { reason: "code_incorrect", attemptsLeft: 4 }),
      undefined,
      undefined,
      mutation,
    );
    expect(logError).not.toHaveBeenCalled();
  });

  it("keeps a signup refusal out of error monitoring", () => {
    handleMutationError(
      new ApiError(403, "x", { reason: "invite_required" }),
      undefined,
      undefined,
      mutation,
    );
    expect(logError).not.toHaveBeenCalled();
  });

  it("still logs an error whose reason is outside both lists", () => {
    handleMutationError(
      new ApiError(400, "x", { reason: "something_else" }),
      undefined,
      undefined,
      mutation,
    );
    expect(logError).toHaveBeenCalledOnce();
  });
});

// PRD-467: the mutation toast speaks the member's language for a 4xx whose
// backend sentence is English only.
describe("handleMutationError with a coded refusal", () => {
  it("names the Live game tab when an event edit would strand adults rounds", () => {
    handleMutationError(
      new ApiError(409, "Quiz has adults rounds", {
        code: "quizshow_quiz_has_adults_rounds",
      }),
      undefined,
      undefined,
      { options: {} },
    );
    expect(emit).toHaveBeenCalledWith(
      {
        title: "That didn't go through",
        detail:
          "This event's live game has adults rounds. Change their label in the Live game tab first, then turn off 18+.",
      },
      "error",
      6000,
    );
  });
});

describe("handleMutationError with a non-English locale", () => {
  afterEach(() => {
    setErrorReasonLocale(null);
  });

  it("shows the translated status reason for a server sentence", () => {
    setErrorReasonLocale({
      translate: (key) => `[${key}]`,
      getLanguage: () => "pt",
    });
    handleMutationError(
      new ApiError(409, "That name is taken"),
      undefined,
      undefined,
      { options: {} },
    );
    expect(emit).toHaveBeenCalledWith(
      {
        title: "That didn't go through",
        detail: "[shared:apiError.reasonConflict].",
      },
      "error",
      6000,
    );
  });
});

describe("music event coded refusals", () => {
  it("names an unbookable performer in the write toast", () => {
    handleMutationError(
      new ApiError(403, "x", {
        code: "music_event_performer_not_studio_artist",
      }),
      undefined,
      undefined,
      { options: {} },
    );
    expect(emit).toHaveBeenCalledWith(
      {
        title: "That didn't go through",
        detail: "Only Studio artists can be booked.",
      },
      "error",
      6000,
    );
  });

  it("resolves each music event code through codedReasonFor", () => {
    const expectedLineByCode: Array<[string, string]> = [
      ["music_event_not_found", "This event isn't hosted by QueerPulse"],
      ["house_event_family_locked", "A QueerPulse music event stays in Music"],
      [
        "music_event_community_unavailable",
        "A QueerPulse music event can't be for one community only",
      ],
      [
        "music_event_performer_not_studio_artist",
        "Only Studio artists can be booked",
      ],
      [
        "music_event_cohost_is_you",
        "You run this event for QueerPulse, so you can't cohost it too",
      ],
      [
        "music_event_cohost_holds_grant",
        "Staff can't cohost a QueerPulse music event. This member is a music manager and producer",
      ],
      [
        "music_event_cohost_is_staff_tier",
        "Staff can't cohost a QueerPulse music event. Moderators and admins stay off the cohost list",
      ],
      [
        "music_event_cohost_not_active",
        "Cohosts must be active members, and this account isn't active",
      ],
      ["music_event_member_not_found", "No member has this profile address"],
      [
        "music_event_invite_request_not_found",
        "This invite request isn't on this event",
      ],
    ];
    for (const [code, line] of expectedLineByCode) {
      expect(codedReasonFor(new ApiError(404, "x", { code }))).toBe(line);
    }
  });

  it("returns null for an uncoded error", () => {
    expect(codedReasonFor(new ApiError(403, "Forbidden"))).toBeNull();
  });
});
