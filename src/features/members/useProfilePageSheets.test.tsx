import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "../../test/TestProviders";
import { createControlledProfileEdit } from "../../test/ControlledProfileEdit";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfilePageSheets } from "./useProfilePageSheets";

const HIDE_LABEL = "Hide me for 24h";
const STILL_VISIBLE_COPY =
  "We couldn't save that. Your profile is still visible to other members. Try again in a moment.";
const HIDDEN_COPY = "Your profile is hidden for the next 24h.";
const VISIBLE_AGAIN_COPY = "Your profile is visible again.";

/** Stands in for `ProfileSettingsMenu`'s "Hide me for 24h" row: one control
 *  that hands the hook the committed `hiddenUntil` and nothing else. Renders
 *  its label through `t()`, like the real menu item, rather than a literal
 *  string: the toast copy is built once at the moment `t()` is called, so a
 *  test that clicks before the `members` namespace has loaded would otherwise
 *  bake the untranslated key into the toast instead of the real copy. */
function SelfHideToggle({
  currentHiddenUntil,
}: {
  currentHiddenUntil: string | null;
}) {
  const sheets = useProfilePageSheets();
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => sheets.toggleHidden(currentHiddenUntil)}
    >
      {t("members:profile.rail.hideMe24h")}
    </button>
  );
}

function renderSelfHide(currentHiddenUntil: string | null = null) {
  const { handle, ControlledProfileEdit } = createControlledProfileEdit();
  render(
    <TestProviders>
      <ControlledProfileEdit initialDraft={{ hiddenUntil: null }}>
        <SelfHideToggle currentHiddenUntil={currentHiddenUntil} />
      </ControlledProfileEdit>
    </TestProviders>,
  );
  return handle;
}

/** The `members` namespace loads lazily, so the button's translated label only
 *  resolves a render or two in. */
const findHideButton = () => screen.findByRole("button", { name: HIDE_LABEL });

const clickButton = (name: string) =>
  userEvent.click(screen.getByRole("button", { name }));

describe("useProfilePageSheets", () => {
  it("persists nothing when save is rebuilt while the draft has not taken the patch", async () => {
    const handle = renderSelfHide();
    const hideButton = await findHideButton();

    // The draft commit is held back, so the very next render is one where
    // `save` has a new identity for a reason unrelated to this toggle: what
    // every one of the ~30 lazy i18n namespace loads does to `t`, and so to
    // `save`. Fired synchronously, with no macrotask in between, so the
    // rebuild lands in the window the toggle actually opens in the app.
    await clickButton("hold draft patches");
    fireEvent.click(hideButton);
    fireEvent.click(screen.getByRole("button", { name: "rebuild save" }));

    // Persisting here would have PATCHed a draft with no `hiddenUntil` in it,
    // leaving the member reading as hidden with nothing actually stored.
    expect(handle.saveCalls).toEqual([]);
    expect(handle.latestDraft.hiddenUntil).toBeNull();
  });

  it("persists the 24h hide once the draft carries it", async () => {
    const handle = renderSelfHide();

    await userEvent.click(await findHideButton());

    await waitFor(() => expect(handle.saveCalls).toHaveLength(1));
    const hiddenUntil = handle.saveCalls[0]?.draft.hiddenUntil;
    expect(hiddenUntil).toBeTruthy();
    expect(new Date(String(hiddenUntil)).getTime()).toBeGreaterThan(Date.now());
    // A hide that actually stored gets its own confirmation, the same as the
    // "Who sees what" switches do, rather than leaving the member to infer it
    // worked from the menu label alone.
    expect(await screen.findByText(HIDDEN_COPY)).toBeInTheDocument();
  });

  it("unhides a member who is currently hidden", async () => {
    const inOneHour = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const handle = renderSelfHide(inOneHour);

    await userEvent.click(await findHideButton());

    await waitFor(() => expect(handle.saveCalls).toHaveLength(1));
    expect(handle.saveCalls[0]?.draft.hiddenUntil).toBeNull();
    expect(await screen.findByText(VISIBLE_AGAIN_COPY)).toBeInTheDocument();
  });

  it("puts the previous value back when the save fails, and tells the member they are still visible", async () => {
    const handle = renderSelfHide();
    handle.setSaveResult(false);

    await userEvent.click(await findHideButton());

    await waitFor(() => expect(handle.saveCalls).toHaveLength(1));
    // The hide really was staged and attempted, so the assertion below is a
    // revert rather than a patch that never landed.
    expect(handle.saveCalls[0]?.draft.hiddenUntil).toBeTruthy();
    // The failed hide must not sit in the SHARED draft: the next save from any
    // other surface would ship it, hiding a member who was never hidden.
    await waitFor(() => expect(handle.latestDraft.hiddenUntil).toBeNull());
    // The toggle must never let the member believe the hide worked when it
    // did not: the fact that matters is that they are still visible.
    expect(await screen.findByText(STILL_VISIBLE_COPY)).toBeInTheDocument();
  });

  it("tells the member they are still visible when the patch never reaches the draft", async () => {
    const handle = renderSelfHide();
    const hideButton = await findHideButton();

    // Same interleaving as the "persists nothing" test above, but this time
    // nothing ever calls `save` at all: the patch is dropped before the
    // effect that starts it can fire, which is the `onPatchLost` path rather
    // than a failed `onFailed`. From the member's point of view the outcome
    // is identical: they asked to be hidden and nothing happened.
    await clickButton("hold draft patches");
    fireEvent.click(hideButton);
    fireEvent.click(screen.getByRole("button", { name: "rebuild save" }));

    expect(handle.saveCalls).toEqual([]);
    expect(handle.latestDraft.hiddenUntil).toBeNull();
    expect(await screen.findByText(STILL_VISIBLE_COPY)).toBeInTheDocument();
  });
});
