import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CommissionInterestModal } from "./CommissionInterestModal";
import { COMMISSIONS } from "./culture.data";

/**
 * `CommissionInterestModal` maps its one form field into the real
 * `POST /commissions/interest` payload and defers the sending/success UI to the
 * mutation's own state. We mock `useCreateCommissionInterest` at the hook
 * boundary (the governance-sections precedent) so we can drive `isSuccess`
 * deterministically and assert the exact payload — including the message trim
 * and the "blank → omit" rule — without standing up a backend or leaning on the
 * demo path's 1s timer. Field label / button copy comes from the lazy `culture`
 * catalog, so those queries use `findBy*`.
 */

const mutate = vi.fn();
let mutationState: { mutate: typeof mutate; isPending: boolean; isSuccess: boolean };

vi.mock("./api/useCreateCommissionInterest", () => ({
  useCreateCommissionInterest: () => mutationState,
}));

const commission = COMMISSIONS[0]!;

beforeEach(() => {
  mutate.mockReset();
  mutationState = { mutate, isPending: false, isSuccess: false };
});

describe("CommissionInterestModal form → payload", () => {
  it("submits the trimmed message alongside the commission + recipient details", async () => {
    render(
      <TestProviders>
        <CommissionInterestModal
          commission={commission}
          onClose={() => {}}
          onSent={() => {}}
        />
      </TestProviders>,
    );

    const textarea = await screen.findByLabelText("Your message (optional)");
    fireEvent.change(textarea, { target: { value: "  Would love to collaborate  " } });
    fireEvent.click(await screen.findByRole("button", { name: "Send interest" }));

    expect(mutate).toHaveBeenCalledWith(
      {
        commissionTitle: commission.title,
        commissionCategory: commission.category,
        recipientName: commission.who.name,
        message: "Would love to collaborate",
      },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it("omits the message when the field is left blank", async () => {
    render(
      <TestProviders>
        <CommissionInterestModal
          commission={commission}
          onClose={() => {}}
          onSent={() => {}}
        />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Send interest" }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ message: undefined }),
      expect.anything(),
    );
  });
});

describe("CommissionInterestModal success state", () => {
  it("shows the plum success panel and fires onSent + onClose on dismiss", async () => {
    mutationState = { mutate, isPending: false, isSuccess: true };
    const onSent = vi.fn();
    const onClose = vi.fn();
    render(
      <TestProviders>
        <CommissionInterestModal
          commission={commission}
          onClose={onClose}
          onSent={onSent}
        />
      </TestProviders>,
    );

    // The Done button only exists once the success panel has rendered.
    fireEvent.click(await screen.findByRole("button", { name: "Done" }));
    expect(onSent).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
