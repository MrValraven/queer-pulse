import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestProviders } from "../../test/TestProviders";
import { PublicProfileModal } from "./PublicProfileModal";
import type { PublicEligibility } from "./publicFigure";

function renderWithEligibility(eligibility: PublicEligibility) {
  return render(
    <TestProviders publicProfile={{ eligibility, enabled: false }}>
      <PublicProfileModal onClose={() => {}} />
    </TestProviders>,
  );
}

const lockedGatesUnmet: PublicEligibility = {
  gates: [
    {
      key: "verified",
      labelKey: "members:profile.hero.verifiedBadge",
      hintKey: "members:publicProfile.eligibility.verified.hint",
      met: false,
    },
    {
      key: "tenure",
      labelKey: "members:publicProfile.eligibility.tenure.label",
      hintKey: "members:publicProfile.eligibility.tenure.hint",
      met: false,
      remainingKey: "members:publicProfile.eligibility.tenure.remaining",
      remainingCount: 60,
    },
  ],
  score: {
    total: 10,
    target: 100,
    families: [
      {
        key: "contribution",
        labelKey: "members:publicProfile.eligibility.family.contribution.label",
        points: 10,
        cap: 50,
      },
      {
        key: "trust",
        labelKey: "members:publicProfile.eligibility.family.trust.label",
        points: 0,
        cap: 35,
      },
      {
        key: "participation",
        labelKey:
          "members:publicProfile.eligibility.family.participation.label",
        points: 0,
        cap: 30,
      },
    ],
  },
  standingOk: true,
  eligible: false,
  nextActions: [
    {
      family: "gate",
      labelKey: "members:publicProfile.eligibility.action.verify",
      points: 0,
    },
  ],
};

const unlocked: PublicEligibility = { ...lockedGatesUnmet, eligible: true };

describe("PublicProfileModal", () => {
  it("shows the tracker with gate rows when locked", async () => {
    renderWithEligibility(lockedGatesUnmet);
    expect(
      await screen.findByText(/first, the essentials/i),
    ).toBeInTheDocument();
  });

  it("shows the unlocked switch when eligible", async () => {
    renderWithEligibility(unlocked);
    expect(
      await screen.findByText(/show a public profile/i),
    ).toBeInTheDocument();
  });

  it("shows the checking state while live eligibility loads", async () => {
    render(
      <TestProviders
        publicProfile={{
          eligibility: lockedGatesUnmet,
          enabled: false,
          eligibilityStatus: "loading",
        }}
      >
        <PublicProfileModal onClose={() => {}} />
      </TestProviders>,
    );
    expect(await screen.findByText(/where you are/i)).toBeInTheDocument();
  });

  it("shows the error state with a retry when eligibility fails to load", async () => {
    render(
      <TestProviders
        publicProfile={{
          eligibility: lockedGatesUnmet,
          enabled: false,
          eligibilityStatus: "error",
        }}
      >
        <PublicProfileModal onClose={() => {}} />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/couldn't check just now/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });
});
