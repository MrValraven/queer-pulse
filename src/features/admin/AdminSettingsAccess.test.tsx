import { render, screen, fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminSettingsAccess } from "./AdminSettingsAccess";
import type { PlatformSettingsDTO } from "./api/platformSettings.api";

// The component calls useUpdatePlatformSettings() itself (it isn't passed in
// as a prop), so the mutation boundary is mocked here rather than through
// demo/live network plumbing — this gives full control over exactly when
// onError fires, which is what several of these tests hinge on.
const mutate = vi.fn();
vi.mock("./api/usePlatformSettings", () => ({
  useUpdatePlatformSettings: () => ({ mutate }),
}));

const baseSettings: PlatformSettingsDTO = {
  registrationEnabled: true,
  joinRequestsEnabled: true,
  lockdownEnabled: false,
  lockdownAllowsModerators: false,
  lockdownMessage: null,
  registrationClosedMessage: null,
  updatedAt: "2026-07-18T09:14:00.000Z",
  updatedBy: null,
};

function renderAccess(settings: PlatformSettingsDTO = baseSettings) {
  return render(
    <TestProviders>
      <AdminSettingsAccess settings={settings} isLoading={false} isError={false} />
    </TestProviders>,
  );
}

beforeEach(() => {
  mutate.mockReset();
});

describe("AdminSettingsAccess", () => {
  // The `admin:` namespace loads as its own async chunk, so a control's
  // translated accessible name is only queryable one render after mount —
  // await the first lookup via findBy (the raw key is on screen until then);
  // once resolved the namespace is resident, so later sync queries are fine.
  it("toggling registration fires the mutation with exactly one key", async () => {
    renderAccess();
    const toggle = await screen.findByRole("switch", {
      name: "New account registration",
    });
    fireEvent.click(toggle);
    expect(mutate).toHaveBeenCalledTimes(1);
    // Second arg is the { onError } options object the component always
    // passes — assert the payload precisely without also pinning that shape.
    expect(mutate.mock.calls[0]![0]).toEqual({ registrationEnabled: false });
  });

  it("does not mutate when lockdown is toggled — it opens the confirm modal instead", async () => {
    renderAccess();
    fireEvent.click(
      await screen.findByRole("switch", { name: "Platform lockdown" }),
    );
    expect(mutate).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Lock the platform?" }),
    ).toBeInTheDocument();
  });

  it("cancelling the confirm modal leaves the lockdown switch exactly where it was", async () => {
    renderAccess();
    const toggle = await screen.findByRole("switch", {
      name: "Platform lockdown",
    });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // The switch reads straight off the `settings` prop — since it was never
    // given an optimistic local flip, it can only ever show server truth.
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("confirming lockdown fires the mutation with lockdownEnabled: true", async () => {
    renderAccess();
    fireEvent.click(
      await screen.findByRole("switch", { name: "Platform lockdown" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Lock the platform" }));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0]![0]).toEqual({ lockdownEnabled: true });
  });

  it("selecting a preset fills the textarea and does not save on its own", async () => {
    renderAccess();
    const textarea = await screen.findByPlaceholderText(
      "What members will see while the platform is locked.",
    );
    expect(textarea).toHaveValue("");

    fireEvent.click(screen.getByRole("button", { name: "Scheduled maintenance" }));

    expect(textarea).toHaveValue(
      "QueerPulse is down for planned maintenance. We’ll be back shortly — thanks for your patience.",
    );
    // Filling is not committing: blur/save only happens via onCommit (blur) or
    // the lockdown confirm flow, neither of which this test triggers.
    expect(mutate).not.toHaveBeenCalled();
  });

  it("keeps a free-text edit made after selecting a preset (preset is a seed, not a binding)", async () => {
    renderAccess();
    const textarea = await screen.findByPlaceholderText(
      "What members will see while the platform is locked.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Scheduled maintenance" }));
    fireEvent.change(textarea, { target: { value: "Custom wording, edited by hand" } });

    expect(textarea).toHaveValue("Custom wording, edited by hand");
  });

  it("confirming lockdown with a preset-filled message sends exactly that text, previewed in the modal", async () => {
    renderAccess();
    const textarea = await screen.findByPlaceholderText(
      "What members will see while the platform is locked.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Scheduled maintenance" }));
    const presetText =
      "QueerPulse is down for planned maintenance. We’ll be back shortly — thanks for your patience.";
    expect(textarea).toHaveValue(presetText);

    fireEvent.click(screen.getByRole("switch", { name: "Platform lockdown" }));
    // The modal previews exactly the text that will be sent — this is the
    // "value sent must equal value previewed" contract the review flagged as
    // unexercised (a comparison flip, or sending settings.lockdownMessage
    // instead of the draft, would still show the right preview here but send
    // the wrong payload below). Scoped to the dialog: React keeps a
    // controlled textarea's child text node in sync with its value, so an
    // unscoped getByText would also match the textarea itself and throw on
    // "found multiple elements" before ever checking the preview.
    expect(
      within(screen.getByRole("dialog")).getByText(presetText).tagName,
    ).toBe("BLOCKQUOTE");

    fireEvent.click(screen.getByRole("button", { name: "Lock the platform" }));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0]![0]).toEqual({
      lockdownEnabled: true,
      lockdownMessage: presetText,
    });
  });

  it("confirming lockdown with the message cleared sends lockdownMessage: null, not the stale server value", async () => {
    renderAccess({ ...baseSettings, lockdownMessage: "Old" });
    const textarea = await screen.findByPlaceholderText(
      "What members will see while the platform is locked.",
    );
    expect(textarea).toHaveValue("Old");

    fireEvent.change(textarea, { target: { value: "" } });
    fireEvent.click(screen.getByRole("switch", { name: "Platform lockdown" }));
    fireEvent.click(screen.getByRole("button", { name: "Lock the platform" }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0]![0]).toEqual({
      lockdownEnabled: true,
      lockdownMessage: null,
    });
  });

  it("keeps a half-typed message across an identity-only settings refetch (FIX 1 regression)", async () => {
    // Every mutation invalidates the settings query, and invalidateQueries
    // refetches active observers regardless of staleTime — so a live refetch
    // hands back a brand-new object even when every field is unchanged. If
    // the re-seed effect ever goes back to depending on the `settings` object
    // identity instead of its primitive fields, this new-but-equal object
    // would wipe the in-progress edit below.
    const { rerender } = renderAccess();
    const textarea = await screen.findByPlaceholderText(
      "What members will see while the platform is locked.",
    );

    fireEvent.change(textarea, { target: { value: "Half-typed explanation" } });
    expect(textarea).toHaveValue("Half-typed explanation");

    const refetched: PlatformSettingsDTO = { ...baseSettings };
    expect(refetched).not.toBe(baseSettings); // new identity, same field values
    rerender(
      <TestProviders>
        <AdminSettingsAccess
          settings={refetched}
          isLoading={false}
          isError={false}
        />
      </TestProviders>,
    );

    expect(textarea).toHaveValue("Half-typed explanation");
  });

  it("shows the error toast and never renders the toggle as flipped when the mutation fails", async () => {
    // onError fires on a later microtask, not inside the synchronous mutate()
    // call — this mirrors real react-query timing and means a test assertion
    // taken immediately after the click can catch a stray optimistic flip if
    // one were ever added.
    mutate.mockImplementation(
      (_input: unknown, opts: { onError: (error: Error) => void }) => {
        void Promise.resolve().then(() =>
          opts.onError(new Error("network down")),
        );
      },
    );
    renderAccess();
    const toggle = await screen.findByRole("switch", {
      name: "New account registration",
    });
    expect(toggle).toHaveAttribute("aria-checked", "true");

    fireEvent.click(toggle);
    // Still true immediately: no optimistic local state exists for this switch.
    expect(toggle).toHaveAttribute("aria-checked", "true");

    expect(
      await screen.findByText("Couldn’t save that. Nothing was changed."),
    ).toBeInTheDocument();
    // And true after the failure too — the prop-driven switch never drifted
    // from server truth at any point in the sequence.
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });
});
