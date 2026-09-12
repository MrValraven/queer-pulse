import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "../../../test/TestProviders";
import {
  useProfileData,
  useProfileEdit,
  type ProfileDraft,
} from "../../../app/providers/useProfile";
import { UpdateNowModal } from "./UpdateNowModal";

// The network boundary only: `mutateAsync` stands in for the real
// `PATCH /profiles/me`, resolving `undefined` (demo mode's own real return
// value) by default so the REAL `ProfileProvider` / `useProfileDraftState` /
// `mergeSavedProfile` pipeline runs underneath. That pipeline is exactly
// what was untested before (a mock of `useUpdateProfile` alone couldn't see
// that a "successful" save never touched what the app actually renders).
const mutateAsync = vi.fn().mockResolvedValue(undefined);
let isPending = false;
vi.mock("../api/useUpdateProfile", () => ({
  useUpdateProfile: () => ({
    mutateAsync,
    get isPending() {
      return isPending;
    },
  }),
}));

const STATUS_SEED =
  "Building things for the web, writing poetry, and organising events for the queer and non-monogamy communities in Lisbon.";

/** A promise this test controls the settling of, to hold a save genuinely
 *  in flight (mid network round trip) across a Cancel click. */
function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Mounts against the REAL committed profile/draft from `ProfileProvider`
 *  (the demo persona, "tiago"), and surfaces the fields a test needs to read
 *  without opening the modal back up: the committed status/open-to, and the
 *  shared draft's own status (to see past a revert, whether or not the modal
 *  is still open). `initialModalOpen: false` lets a test set up session state
 *  BEFORE the modal ever mounts. */
function Harness({ initialModalOpen = true }: { initialModalOpen?: boolean }) {
  const { profile } = useProfileData();
  const { draft } = useProfileEdit();
  const [isOpen, setIsOpen] = useState(initialModalOpen);
  return (
    <>
      <p data-testid="committed-now">{profile.now}</p>
      <p data-testid="committed-open-to">
        {profile.openTo.map((entry) => JSON.stringify(entry)).join(" | ")}
      </p>
      <p data-testid="draft-now">{draft.now}</p>
      {!isOpen && (
        <button type="button" onClick={() => setIsOpen(true)}>
          open modal
        </button>
      )}
      {isOpen && (
        <UpdateNowModal profile={profile} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}

/** Stands in for "some OTHER surface patches and saves the shared session"
 *  (another tab, a different edit sheet, another unrelated field on this
 *  same modal's session). Deliberately two separate buttons/clicks rather
 *  than one handler: `save` is a `useCallback` closed over the draft at
 *  render time, so calling it in the same tick as `updateDraft` would ship
 *  the pre-patch draft, the same trap `UpdateNowModal`'s own effect works
 *  around. Two separate `userEvent.click`s each flush a render in between,
 *  so by the second click `save` has already picked up the patch. */
function SessionPatcher({ patch }: { patch: Partial<ProfileDraft> }) {
  const { updateDraft, save } = useProfileEdit();
  return (
    <>
      <button type="button" onClick={() => updateDraft(patch)}>
        patch session
      </button>
      <button type="button" onClick={() => void save()}>
        save session
      </button>
    </>
  );
}

function renderHarness(options?: {
  initialModalOpen?: boolean;
  patcher?: Partial<ProfileDraft>;
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  render(
    <TestProviders queryClient={queryClient}>
      <Harness initialModalOpen={options?.initialModalOpen ?? true} />
      {options?.patcher && <SessionPatcher patch={options.patcher} />}
    </TestProviders>,
  );
  return { invalidateQueries };
}

const findStatusField = () =>
  screen.findByLabelText("What you are in the middle of");

describe("UpdateNowModal", () => {
  beforeEach(() => {
    mutateAsync.mockClear();
    mutateAsync.mockResolvedValue(undefined);
    isPending = false;
  });

  it("opens with the member's current status and chips", async () => {
    renderHarness();
    expect(await screen.findByDisplayValue(STATUS_SEED)).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Collaborating" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("commits a new status onto the profile every screen reads, even in demo mode", async () => {
    renderHarness();
    const statusField = await findStatusField();
    await userEvent.clear(statusField);
    await userEvent.type(statusField, "A brand new status");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(
      () =>
        expect(screen.getByTestId("committed-now")).toHaveTextContent(
          "A brand new status",
        ),
      { timeout: 3000 },
    );
  });

  it("invalidates the insights query after a save", async () => {
    const { invalidateQueries } = renderHarness();
    const statusField = await findStatusField();
    await userEvent.type(statusField, " Updated.");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(
      () =>
        expect(invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["nowInsights"],
        }),
      { timeout: 3000 },
    );
  });

  it("does not clobber a concurrent change to a field it left untouched", async () => {
    renderHarness({
      patcher: { openTo: [{ kind: "custom", label: "Changed elsewhere" }] },
    });
    const statusField = await findStatusField();

    // Something else changes the open-to chips while the modal is open.
    await userEvent.click(
      screen.getByRole("button", { name: "patch session" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "save session" }));
    await waitFor(
      () =>
        expect(screen.getByTestId("committed-open-to")).toHaveTextContent(
          "Changed elsewhere",
        ),
      { timeout: 3000 },
    );

    // The still-open modal only touches the status.
    await userEvent.clear(statusField);
    await userEvent.type(statusField, "Only the status changed");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(
      () =>
        expect(screen.getByTestId("committed-now")).toHaveTextContent(
          "Only the status changed",
        ),
      { timeout: 3000 },
    );
    // The concurrent open-to change survives: the modal never resent its own
    // stale seed for a field the member never touched here.
    expect(screen.getByTestId("committed-open-to")).toHaveTextContent(
      "Changed elsewhere",
    );
  });

  it("closes without saving on cancel", async () => {
    renderHarness();
    await findStatusField();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("disables save while the mutation is pending", async () => {
    isPending = true;
    renderHarness();
    expect(await screen.findByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("keeps the modal open, skips invalidation, and shows the failure when the save is rejected", async () => {
    mutateAsync.mockRejectedValueOnce(new Error("network down"));
    const { invalidateQueries } = renderHarness();
    const statusField = await findStatusField();
    await userEvent.clear(statusField);
    await userEvent.type(statusField, "A status that fails to save");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    // Two "alert" nodes exist at this point: the toast provider's own empty
    // live region, and the modal's error message. Assert the specific one.
    expect(
      await screen.findByText(
        "We couldn't save your profile. Please try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ["nowInsights"],
    });
    // The committed profile never moved either: the rejected save changed
    // nothing for either the network mock or the local merge to commit.
    expect(screen.getByTestId("committed-now")).not.toHaveTextContent(
      "A status that fails to save",
    );
  });

  it("reverts the shared draft on a rejected save, so the abandoned text does not leak into the next save", async () => {
    mutateAsync.mockRejectedValueOnce(new Error("network down"));
    renderHarness({ patcher: { role: "Some other field" } });
    const statusField = await findStatusField();
    await userEvent.clear(statusField);
    await userEvent.type(statusField, "Abandoned after a failed save");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("We couldn't save your profile. Please try again.");

    // The shared draft itself is back to what it was before this save.
    await waitFor(() =>
      expect(screen.getByTestId("draft-now")).toHaveTextContent(STATUS_SEED),
    );

    // A completely unrelated save from another surface, sharing the same
    // session, must not ship the abandoned status.
    await userEvent.click(
      screen.getByRole("button", { name: "patch session" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "save session" }));
    await waitFor(() =>
      expect(screen.getByTestId("committed-now")).toHaveTextContent(
        STATUS_SEED,
      ),
    );
    expect(screen.getByTestId("committed-now")).not.toHaveTextContent(
      "Abandoned after a failed save",
    );
  });

  it("leaves an in-flight save alone on unmount, so a later success is not silently undone", async () => {
    const deferred = createDeferred<undefined>();
    mutateAsync.mockImplementationOnce(() => deferred.promise);
    renderHarness();
    const statusField = await findStatusField();
    await userEvent.clear(statusField);
    await userEvent.type(statusField, "Saved after the modal closed");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    // Dismiss while the PATCH is still out. This save already started, so
    // the unmount cleanup must NOT revert it back to `STATUS_SEED`.
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("draft-now")).toHaveTextContent(
      "Saved after the modal closed",
    );

    // The network answers after the member is already gone: the save must
    // still land, or a change they successfully made was silently thrown away.
    deferred.resolve(undefined);
    await waitFor(() =>
      expect(screen.getByTestId("committed-now")).toHaveTextContent(
        "Saved after the modal closed",
      ),
    );
  });

  it("reverts the shared draft once an in-flight save is rejected, even after the modal has closed", async () => {
    const deferred = createDeferred<undefined>();
    mutateAsync.mockImplementationOnce(() => deferred.promise);
    renderHarness();
    const statusField = await findStatusField();
    await userEvent.clear(statusField);
    await userEvent.type(statusField, "Abandoned, still in flight");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("draft-now")).toHaveTextContent(
      "Abandoned, still in flight",
    );

    // The network answers "no" after the member is already gone: the IIFE's
    // own failure branch reverts the shared draft, same as it would have had
    // the modal still been open.
    deferred.reject(new Error("network down"));
    await waitFor(() =>
      expect(screen.getByTestId("draft-now")).toHaveTextContent(STATUS_SEED),
    );
  });

  it("does not show a failure from an earlier unrelated save when the modal opens", async () => {
    mutateAsync.mockRejectedValueOnce(new Error("network down"));
    renderHarness({
      initialModalOpen: false,
      patcher: { role: "Some other field" },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "patch session" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "save session" }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());

    await userEvent.click(screen.getByRole("button", { name: "open modal" }));
    await findStatusField();
    // A generic `role="alert"` query would also match the toast provider's
    // own always-present empty live region, so assert the specific copy.
    expect(
      screen.queryByText("We couldn't save your profile. Please try again."),
    ).not.toBeInTheDocument();
  });
});
