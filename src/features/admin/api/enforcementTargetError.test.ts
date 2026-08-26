import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  classifyEnforcementError,
  summarizeBulkFailures,
  type EnforcementTarget,
} from "./enforcementTargetError";

/**
 * The moderation queue used to answer every failed action with "Couldn't reach
 * the safety service", which on a deterministic refusal is false twice over:
 * the service answered, and it answered on purpose. These lock in that the
 * four typed refusals are recognised structurally, off `code`/`target`, and
 * that nothing here reads the English prose.
 */

const UNRESOLVED = "ENFORCEMENT_TARGET_UNRESOLVED";
const PROTECTED = "ENFORCEMENT_TARGET_PROTECTED";

function refusal(
  status: number,
  code: string,
  target: string,
  message = "A moderator-facing sentence.",
) {
  return new ApiError(status, message, {
    statusCode: status,
    error: status === 403 ? "Forbidden" : "Bad Request",
    code,
    target,
    message,
  });
}

describe("classifyEnforcementError", () => {
  const cases: [string, number, string, EnforcementTarget][] = [
    ["nobody behind the reported content", 400, UNRESOLVED, "no_account"],
    [
      "a question and an answer by two people",
      400,
      UNRESOLVED,
      "ambiguous_authors",
    ],
    ["the house account", 403, PROTECTED, "house_account"],
    ["a staff account", 403, PROTECTED, "staff_account"],
  ];

  it.each(cases)(
    "recognises %s as a deliberate refusal",
    (_label, status, code, target) => {
      expect(classifyEnforcementError(refusal(status, code, target))).toEqual({
        kind: "refused",
        target,
        message: "A moderator-facing sentence.",
      });
    },
  );

  it("hands back the server's own sentence, trimmed, to show verbatim", () => {
    const error = refusal(
      400,
      UNRESOLVED,
      "no_account",
      "  Nobody to act on.  ",
    );
    const result = classifyEnforcementError(error);
    expect(result).toMatchObject({ message: "Nobody to act on." });
  });

  // Forward compatibility: a target this build has never heard of must still
  // read as a refusal, so the moderator gets the server's explanation and the
  // surface still declines to offer a retry that would be refused identically.
  it("still classifies a refusal when the target is one it does not know", () => {
    expect(
      classifyEnforcementError(refusal(400, UNRESOLVED, "some_future_case")),
    ).toEqual({
      kind: "refused",
      target: null,
      message: "A moderator-facing sentence.",
    });
  });

  it("treats an error with no code as an ordinary failure", () => {
    expect(
      classifyEnforcementError(
        new ApiError(400, "Bad Request", { statusCode: 400 }),
      ),
    ).toEqual({ kind: "failure" });
  });

  it("treats an unrelated typed code as an ordinary failure", () => {
    expect(
      classifyEnforcementError(
        new ApiError(429, "Slow down", { code: "REPORT_FLOOD_CAP" }),
      ),
    ).toEqual({ kind: "failure" });
  });

  it("treats a network error as an ordinary failure", () => {
    expect(classifyEnforcementError(new Error("network down"))).toEqual({
      kind: "failure",
    });
    expect(classifyEnforcementError(undefined)).toEqual({ kind: "failure" });
  });

  // The prose is a fallback, never the test. A refusal whose message happens
  // to read like an outage is still a refusal, and an outage whose message
  // happens to mention an account is still an outage.
  it("does not read the message text to decide", () => {
    expect(
      classifyEnforcementError(
        refusal(400, UNRESOLVED, "no_account", "Couldn't reach anything."),
      ),
    ).toMatchObject({ kind: "refused", target: "no_account" });
    expect(
      classifyEnforcementError(
        new ApiError(500, "there is no account behind this", {}),
      ),
    ).toEqual({ kind: "failure" });
  });
});

/**
 * The bulk endpoint partitions instead of throwing, and a refused report lands
 * in `failed[]` carrying the message string ALONE: no `code`, no `target`. So
 * the reasons are rendered as sent, and these lock in that they are passed
 * through untouched rather than mapped back to a case by matching the prose.
 */
describe("summarizeBulkFailures", () => {
  it("passes one reason through exactly as the server sent it", () => {
    expect(
      summarizeBulkFailures([{ reason: "There's no account behind this." }]),
    ).toBe("There's no account behind this.");
  });

  it("says a shared reason once for a whole batch refused the same way", () => {
    expect(
      summarizeBulkFailures([
        { reason: "Two people wrote this." },
        { reason: "Two people wrote this." },
        { reason: "Two people wrote this." },
      ]),
    ).toBe("Two people wrote this.");
  });

  it("joins distinct reasons and caps them, because a toast is not a report", () => {
    expect(
      summarizeBulkFailures([
        { reason: "No account." },
        { reason: "Two authors." },
        { reason: "Staff account." },
      ]),
    ).toBe("No account.; Two authors.");
  });

  it("returns nothing at all for a clean sweep", () => {
    expect(summarizeBulkFailures([])).toBe("");
  });
});
