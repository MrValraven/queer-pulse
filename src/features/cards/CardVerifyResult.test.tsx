import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardVerifyResult } from "./CardVerifyResult";
import type { CardVerificationDTO } from "./api/cards.api";
import { TestProviders } from "../../test/TestProviders";

/**
 * SEC-22. The server sends no holder, issuer, role or pronouns for a card that
 * is not good right now. This page prints nothing in their place. A fallback
 * name, an empty issuer line or a "Role: Member" the server never said would
 * all be wrong.
 */

const active: CardVerificationDTO = {
  status: "active",
  issuerName: "Lisboa Queer Collective",
  holderName: "Rita Valente",
  role: "member",
  serial: "LQC-7K4M2",
  memberSince: "2026-02-14T10:00:00Z",
  hasPhoto: false,
  holderPronouns: "she/her",
  holderPhotoUrl: null,
  photoStyle: "color",
};

const revoked: CardVerificationDTO = {
  ...active,
  status: "revoked",
  issuerName: "",
  holderName: null,
  role: "",
  hasPhoto: false,
  holderPronouns: null,
};

function renderResult(verification: CardVerificationDTO) {
  return render(
    <TestProviders>
      <CardVerifyResult verification={verification} />
    </TestProviders>,
  );
}

describe("CardVerifyResult", () => {
  it("prints the holder, issuer and role for a card that is good", async () => {
    renderResult(active);
    expect(await screen.findByText("Rita Valente")).toBeInTheDocument();
    expect(screen.getByText("Lisboa Queer Collective")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("she/her")).toBeInTheDocument();
  });

  it("prints no role label and no fallback name for a revoked card", async () => {
    renderResult(revoked);
    // The serial row proves the lazy `cards` namespace has resolved.
    expect(await screen.findByText("LQC-7K4M2")).toBeInTheDocument();
    expect(screen.queryByText("Role")).not.toBeInTheDocument();
    expect(screen.queryByText("Member")).not.toBeInTheDocument();
    expect(screen.queryByText("A member")).not.toBeInTheDocument();
  });
});
