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

    const sendButton = await screen.findByRole("button", {
      name: "Send invite",
    });
    expect(sendButton).toBeDisabled();
  });

  it("sends the invite with the picked candidate's slug once role + commitment are set", async () => {
    const onSent = renderModal();

    fireEvent.click(await screen.findByText("Sofia Reyes"));

    // Clicked by its visible trigger text. FormField's `<label htmlFor>` names
    // the trigger button after the field label, so the placeholder reaches the
    // test as content rather than as the button's accessible name.
    fireEvent.click(await screen.findByText("Choose a role"));
    fireEvent.click(await screen.findByRole("option", { name: "Greeter" }));

    fireEvent.click(await screen.findByText("Choose a commitment"));
    fireEvent.click(
      await screen.findByRole("option", { name: "Just the day of" }),
    );

    fireEvent.click(await screen.findByRole("button", { name: "Send invite" }));

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
