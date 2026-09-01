import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ApiError } from "../../../shared/api/client";
import { useEnforcementRefusal } from "./enforcementTargetError";

/**
 * What a moderator actually reads after an action is refused.
 *
 * These run through the real i18n provider rather than asserting on keys, so
 * they catch the failure that matters: a refusal falling back to the generic
 * "couldn't reach the safety service", which on a deliberate refusal is false
 * twice over. `admin` is a lazy namespace, so every assertion is `findBy`.
 */

const FALLBACK = "GENERIC OUTAGE COPY";

function RefusalProbe({ error }: { error: unknown }) {
  const describeRefusal = useEnforcementRefusal();
  return <p>{describeRefusal(error, FALLBACK)}</p>;
}

function refusalError(status: number, code: string, target: string) {
  return new ApiError(status, "Server sentence.", {
    statusCode: status,
    code,
    target,
    message: "Server sentence.",
  });
}

function renderRefusal(error: unknown) {
  render(
    <TestProviders>
      <RefusalProbe error={error} />
    </TestProviders>,
  );
}

const UNRESOLVED = "ENFORCEMENT_TARGET_UNRESOLVED";
const PROTECTED = "ENFORCEMENT_TARGET_PROTECTED";

describe("useEnforcementRefusal", () => {
  it("explains that nobody is behind the reported content", async () => {
    renderRefusal(refusalError(400, UNRESOLVED, "no_account"));
    expect(
      await screen.findByText(/no account behind what was reported/i),
    ).toBeInTheDocument();
  });

  // The reconciliation the drawer cannot offer: it names whoever posted
  // first, because it has to name somebody, so the refusal has to account for
  // that rather than leaving a moderator to square two contradictory facts.
  // "Posted first" rather than "asked" (PRD-47d): the same refusal answers a
  // review and its reply, where the first poster is a reviewer, not an asker.
  it("reconciles the drawer naming the first poster when two people wrote it", async () => {
    renderRefusal(refusalError(400, UNRESOLVED, "ambiguous_authors"));
    const line = await screen.findByText(/two different people wrote them/i);
    expect(line).toHaveTextContent(/drawer names whoever posted first/i);
  });

  it("explains the house account is never a moderation target", async () => {
    renderRefusal(refusalError(403, PROTECTED, "house_account"));
    expect(
      await screen.findByText(/traces back to the house account/i),
    ).toBeInTheDocument();
  });

  it("sends a staff-account refusal to an admin", async () => {
    renderRefusal(refusalError(403, PROTECTED, "staff_account"));
    expect(
      await screen.findByText(/raise it with an admin/i),
    ).toBeInTheDocument();
  });

  // Every one of the four must correct the optimistic success toast that has
  // already claimed the action landed, and none may imply the moderator did
  // anything wrong.
  it.each([
    [400, UNRESOLVED, "no_account"],
    [400, UNRESOLVED, "ambiguous_authors"],
    [403, PROTECTED, "house_account"],
    [403, PROTECTED, "staff_account"],
  ])(
    "opens by correcting the optimistic toast (%s %s)",
    async (status, code, target) => {
      renderRefusal(refusalError(status, code, target));
      expect(await screen.findByText(/didn't go through/i)).toBeInTheDocument();
      expect(screen.queryByText(FALLBACK)).not.toBeInTheDocument();
    },
  );

  it("falls back to the server's sentence for a target it does not know", async () => {
    renderRefusal(refusalError(400, UNRESOLVED, "some_future_case"));
    expect(await screen.findByText("Server sentence.")).toBeInTheDocument();
  });

  it("keeps the generic outage copy for a genuine failure", async () => {
    renderRefusal(new ApiError(503, "Service Unavailable", {}));
    expect(await screen.findByText(FALLBACK)).toBeInTheDocument();
  });
});
