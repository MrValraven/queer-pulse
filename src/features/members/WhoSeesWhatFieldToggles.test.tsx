import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "../../test/TestProviders";
import { createControlledProfileEdit } from "../../test/ControlledProfileEdit";
import { WhoSeesWhatFieldToggles } from "./WhoSeesWhatFieldToggles";

const SAVE_ERROR_COPY = "Couldn't save that. Please try again.";

function renderToggles() {
  const { handle, ControlledProfileEdit } = createControlledProfileEdit();
  render(
    <TestProviders>
      <ControlledProfileEdit initialDraft={{ photoVisible: true }}>
        <WhoSeesWhatFieldToggles />
      </ControlledProfileEdit>
    </TestProviders>,
  );
  return handle;
}

/** The `members` namespace loads lazily, so the switch names only resolve a
 *  render or two in. */
const findPhotoSwitch = () => screen.findByRole("switch", { name: "Photo" });

const clickButton = (name: string) =>
  userEvent.click(screen.getByRole("button", { name }));

describe("WhoSeesWhatFieldToggles", () => {
  it("persists nothing when save is rebuilt while the draft has not taken the patch", async () => {
    const handle = renderToggles();
    const photoSwitch = await findPhotoSwitch();

    // The draft commit is held back, so the very next render is one where
    // `save` has a new identity for a reason unrelated to this switch: what
    // every one of the ~30 lazy i18n namespace loads does to `t`, and so to
    // `save`. Fired synchronously, with no macrotask in between, so the
    // rebuild lands in the window the switch actually opens in the app.
    await clickButton("hold draft patches");
    fireEvent.click(photoSwitch);
    fireEvent.click(screen.getByRole("button", { name: "rebuild save" }));

    // Persisting here would have PATCHed a draft still holding the OLD
    // visibility, while the sheet showed the member their new choice.
    expect(handle.saveCalls).toEqual([]);
    expect(handle.latestDraft.photoVisible).toBe(true);
    // Nothing was stored and nothing will be, so say so rather than leaving
    // the member believing a privacy setting moved.
    expect(await screen.findByText(SAVE_ERROR_COPY)).toBeInTheDocument();
  });

  it("persists the flipped switch once the draft carries it", async () => {
    const handle = renderToggles();

    await userEvent.click(await findPhotoSwitch());

    await waitFor(() => expect(handle.saveCalls).toHaveLength(1));
    expect(handle.saveCalls[0]?.draft.photoVisible).toBe(false);
    expect(await screen.findByText("Saved.")).toBeInTheDocument();
  });

  it("puts the previous value back when the save fails", async () => {
    const handle = renderToggles();
    const photoSwitch = await findPhotoSwitch();
    handle.setSaveResult(false);

    await userEvent.click(photoSwitch);

    await waitFor(() => expect(handle.saveCalls).toHaveLength(1));
    // The flip really was staged and attempted, so the assertions below are a
    // revert rather than a patch that never landed.
    expect(handle.saveCalls[0]?.draft.photoVisible).toBe(false);
    await waitFor(() => expect(handle.latestDraft.photoVisible).toBe(true));
    expect(photoSwitch).toHaveAttribute("aria-checked", "true");
    expect(await screen.findByText(SAVE_ERROR_COPY)).toBeInTheDocument();
  });
});
