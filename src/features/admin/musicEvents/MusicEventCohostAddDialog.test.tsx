import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { TestProviders } from "../../../test/TestProviders";
import { MusicEventCohostAddDialog } from "./MusicEventCohostAddDialog";

const mocks: {
  mutateAsync: ReturnType<typeof vi.fn>;
  connectionViews: Array<{
    slug: string;
    name: string;
    photo: string | undefined;
    pron: string;
  }>;
} = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  connectionViews: [
    { slug: "sofia", name: "Sofia Reyes", photo: undefined, pron: "she/her" },
  ],
}));

vi.mock("../../connect/api/useConnectionsList", () => ({
  useConnectionsList: () => ({ views: mocks.connectionViews }),
}));
vi.mock("./api/useAddMusicEventCohost", () => ({
  useAddMusicEventCohost: () => ({
    mutateAsync: mocks.mutateAsync,
    isPending: false,
  }),
}));

afterEach(() => {
  mocks.mutateAsync.mockReset();
});

async function renderAndPickSofia() {
  const onAdded = vi.fn();
  render(
    <TestProviders>
      <MusicEventCohostAddDialog
        slug="night-one"
        excludeSlugs={[]}
        onAdded={onAdded}
        onClose={vi.fn()}
      />
    </TestProviders>,
  );
  fireEvent.click(await screen.findByText("Sofia Reyes"));
  // The admin catalog loads lazily, so wait for its translated title.
  await screen.findByText("Add Sofia Reyes as a cohost?");
  return onAdded;
}

describe("MusicEventCohostAddDialog", () => {
  it("adds the picked member directly", async () => {
    mocks.mutateAsync.mockResolvedValue({ ok: true });
    const onAdded = await renderAndPickSofia();

    fireEvent.click(screen.getByRole("button", { name: "Add cohost" }));

    await waitFor(() =>
      expect(mocks.mutateAsync).toHaveBeenCalledWith({ memberSlug: "sofia" }),
    );
    await waitFor(() =>
      expect(onAdded).toHaveBeenCalledWith(
        expect.objectContaining({ slug: "sofia" }),
      ),
    );
  });

  it("names a staff cohost refusal", async () => {
    mocks.mutateAsync.mockRejectedValue(
      new ApiError(403, "Forbidden", {
        code: "music_event_cohost_is_staff_tier",
      }),
    );
    const onAdded = await renderAndPickSofia();

    fireEvent.click(screen.getByRole("button", { name: "Add cohost" }));

    const alertLine = await screen.findByRole("alert");
    expect(alertLine).toHaveTextContent(
      "Staff can't cohost a QueerPulse music event. Moderators and admins stay off the cohost list",
    );
    expect(onAdded).not.toHaveBeenCalled();
    expect(
      screen.getByText("Add Sofia Reyes as a cohost?"),
    ).toBeInTheDocument();
  });

  it("names the holder refusal and the self refusal", async () => {
    mocks.mutateAsync.mockRejectedValueOnce(
      new ApiError(403, "Forbidden", {
        code: "music_event_cohost_holds_grant",
      }),
    );
    await renderAndPickSofia();
    fireEvent.click(screen.getByRole("button", { name: "Add cohost" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Staff can't cohost a QueerPulse music event",
    );

    // A coded refusal switches Add cohost off, so the next try starts from
    // "Pick someone else".
    expect(screen.getByRole("button", { name: "Add cohost" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Pick someone else" }));
    fireEvent.click(await screen.findByText("Sofia Reyes"));
    mocks.mutateAsync.mockRejectedValueOnce(
      new ApiError(403, "Forbidden", { code: "music_event_cohost_is_you" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Add cohost" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "You run this event for QueerPulse, so you can't cohost it too",
      ),
    );
  });

  it("names the failure when the server gives no coded reason", async () => {
    mocks.mutateAsync.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const onAdded = await renderAndPickSofia();

    fireEvent.click(screen.getByRole("button", { name: "Add cohost" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't add Sofia Reyes as a cohost",
    );
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("keeps the refusal on screen while the next try runs", async () => {
    mocks.mutateAsync.mockRejectedValueOnce(new ApiError(500, "Server error"));
    await renderAndPickSofia();
    fireEvent.click(screen.getByRole("button", { name: "Add cohost" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't add Sofia Reyes as a cohost",
    );

    mocks.mutateAsync.mockReturnValueOnce(new Promise(() => {}));
    fireEvent.click(screen.getByRole("button", { name: "Add cohost" }));
    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't add Sofia Reyes as a cohost",
    );
  });

  it("words the pick step for an add with no invite", async () => {
    render(
      <TestProviders>
        <MusicEventCohostAddDialog
          slug="night-one"
          excludeSlugs={[]}
          onAdded={vi.fn()}
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByText(
        "Pick a member to run this event with QueerPulse. They join the cohost list straight away.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/asked to accept/i)).not.toBeInTheDocument();
  });
});
