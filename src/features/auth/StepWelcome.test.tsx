import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StepWelcome } from "./StepWelcome";
import { rememberInviteWelcome, clearInviteWelcome } from "./api/pendingInvite";

/**
 * Ambassador build, Task F2. The onboarding welcome card's meta line (`vcRole`,
 * under the inviter's name) names the inviter as a QueerPulse Ambassador when
 * `GET /invites/:code` says so, and otherwise keeps its existing behavior
 * (member-since date, or a bare "invited you" when there's no date either).
 *
 * `StepWelcome` reads its inviter from `readInviteWelcome()`, which is a thin
 * sessionStorage wrapper (`pendingInvite.ts`). Priming that storage with
 * `rememberInviteWelcome()` before render exercises the real read path rather
 * than a mocked module.
 *
 * `auth` is a lazy i18n namespace, so labels resolve one render after mount
 * (findBy*), the same pattern `AgeAttestation.test.tsx` uses.
 */
function renderStepWelcome() {
  return render(
    <TestProviders>
      <StepWelcome
        stepLabel="Step 3 of 3"
        onNext={() => {}}
        onBack={() => {}}
      />
    </TestProviders>,
  );
}

describe("StepWelcome inviter meta line", () => {
  afterEach(() => {
    clearInviteWelcome();
  });

  it("names the inviter as a QueerPulse Ambassador when isAmbassador is true", async () => {
    rememberInviteWelcome({
      vouch: "Glad you're here.",
      inviter: {
        name: "Inês Carvalho",
        firstName: "Inês",
        initials: "IC",
        since: "2024",
        isAmbassador: true,
      },
    });
    renderStepWelcome();

    expect(await screen.findByText("Inês Carvalho")).toBeInTheDocument();
    expect(
      await screen.findByText("QueerPulse Ambassador"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Member since/)).not.toBeInTheDocument();
  });

  it("keeps the existing member-since line when isAmbassador is absent", async () => {
    rememberInviteWelcome({
      vouch: "Glad you're here.",
      inviter: {
        name: "Inês Carvalho",
        firstName: "Inês",
        initials: "IC",
        since: "2024",
      },
    });
    renderStepWelcome();

    expect(await screen.findByText("Member since 2024")).toBeInTheDocument();
    expect(screen.queryByText("QueerPulse Ambassador")).not.toBeInTheDocument();
  });

  it("keeps the existing member-since line when isAmbassador is explicitly false", async () => {
    rememberInviteWelcome({
      vouch: "Glad you're here.",
      inviter: {
        name: "Inês Carvalho",
        firstName: "Inês",
        initials: "IC",
        since: "2024",
        isAmbassador: false,
      },
    });
    renderStepWelcome();

    expect(await screen.findByText("Member since 2024")).toBeInTheDocument();
    expect(screen.queryByText("QueerPulse Ambassador")).not.toBeInTheDocument();
  });
});
