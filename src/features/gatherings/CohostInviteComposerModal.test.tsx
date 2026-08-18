import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CohostInviteComposerModal } from "./CohostInviteComposerModal";

const { mutate, connectionViews } = vi.hoisted(() => ({
  mutate: vi.fn(),
  connectionViews: [
    { slug: "sofia", name: "Sofia Reyes", photo: undefined, pron: "she/her" },
  ],
}));

vi.mock("../connect/api/useConnectionsList", () => ({
  useConnectionsList: () => ({ views: connectionViews }),
}));
vi.mock("./api/useEventMutations", () => ({
  useSendCohostInvite: () => ({ mutate, isPending: false }),
}));

afterEach(() => {
  mutate.mockReset();
});

function renderModal(onSent = vi.fn()) {
  render(
    <TestProviders>
      <CohostInviteComposerModal
        slug="pride-picnic"
        excludeSlugs={[]}
        onSent={onSent}
        onClose={vi.fn()}
      />
    </TestProviders>,
  );
  return onSent;
}

describe("CohostInviteComposerModal", () => {
  it("picks a candidate, then requires role + commitment before sending", async () => {
    renderModal();

    const candidateRow = await screen.findByText("Sofia Reyes");
    fireEvent.click(candidateRow);

    // The addModal.* catalog keys land in Task 12; until then the Select
    // trigger's accessible name is the raw translation key it was given as
    // a placeholder (`t()`'s missing-key fallback).
    const sendButton = await screen.findByRole("button", {
      name: "gatherings:cohost.addModal.sendCta",
    });
    expect(sendButton).toBeDisabled();
  });

  it("sends the invite with the picked candidate's slug once role + commitment are set", async () => {
    const onSent = renderModal();

    fireEvent.click(await screen.findByText("Sofia Reyes"));

    fireEvent.click(
      await screen.findByRole("button", {
        name: "gatherings:cohost.addModal.roleLabel",
      }),
    );
    fireEvent.click(await screen.findByRole("option", { name: "Greeter" }));

    fireEvent.click(
      await screen.findByRole("button", {
        name: "gatherings:cohost.addModal.commitmentLabel",
      }),
    );
    fireEvent.click(
      await screen.findByRole("option", { name: "Just the day of" }),
    );

    fireEvent.click(
      await screen.findByRole("button", {
        name: "gatherings:cohost.addModal.sendCta",
      }),
    );

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          inviteeSlug: "sofia",
          role: "greeter",
          commitment: "light",
        }),
      ),
    );
    expect(onSent).toHaveBeenCalledWith("Sofia Reyes");
  });
});
