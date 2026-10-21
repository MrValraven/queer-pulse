import { act, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { StudioNotifyMeButton } from "./StudioNotifyMeButton";

const mutate = vi.fn();
const showToast = vi.fn();
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));
let isPending = false;
vi.mock("./api/useStudioArtistToolsMutations", () => ({
  useStudioReleaseReminder: () => ({ mutate, isPending }),
}));

describe("StudioNotifyMeButton", () => {
  it("is a toggle with one name, and asks to be told", async () => {
    render(
      <TestProviders>
        <StudioNotifyMeButton
          releaseId="r1"
          releaseTitle="Maré alta"
          isSet={false}
        />
      </TestProviders>,
    );
    const toggle = await screen.findByRole("button", {
      name: "Notify me when Maré alta is out",
    });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toHaveTextContent("Notify me");
    fireEvent.click(toggle);
    expect(mutate).toHaveBeenCalledWith(
      { releaseId: "r1", isSet: true },
      expect.anything(),
    );
  });

  it("reads We'll tell you once set, and turns it off", async () => {
    mutate.mockClear();
    render(
      <TestProviders>
        <StudioNotifyMeButton releaseId="r1" releaseTitle="Maré alta" isSet />
      </TestProviders>,
    );
    const toggle = await screen.findByRole("button", {
      name: "Notify me when Maré alta is out",
    });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveTextContent("Notify me");
    expect(screen.getByRole("status")).toHaveTextContent("We'll tell you");
    fireEvent.click(toggle);
    expect(mutate).toHaveBeenCalledWith(
      { releaseId: "r1", isSet: false },
      expect.anything(),
    );
  });

  it("ignores presses while a change is saving", async () => {
    mutate.mockClear();
    isPending = true;
    render(
      <TestProviders>
        <StudioNotifyMeButton
          releaseId="r1"
          releaseTitle="Maré alta"
          isSet={false}
        />
      </TestProviders>,
    );
    const toggle = await screen.findByRole("button", {
      name: "Notify me when Maré alta is out",
    });
    expect(toggle).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(toggle);
    expect(mutate).not.toHaveBeenCalled();
    isPending = false;
  });

  it("says what happened after a save, and toasts a failure", async () => {
    mutate.mockClear();
    showToast.mockClear();
    render(
      <TestProviders>
        <StudioNotifyMeButton
          releaseId="r1"
          releaseTitle="Maré alta"
          isSet={false}
        />
      </TestProviders>,
    );
    const toggle = await screen.findByRole("button", {
      name: "Notify me when Maré alta is out",
    });
    fireEvent.click(toggle);
    const options = (mutate.mock.calls as unknown[][]).at(0)?.at(1) as
      { onSuccess: (nowSet: boolean) => void; onError: () => void } | undefined;
    if (!options) throw new Error("mutate was not called with options");
    act(() => options.onSuccess(true));
    expect(screen.getByRole("status")).toHaveTextContent("We'll tell you");
    expect(toggle).toHaveTextContent("Notify me");
    act(() => options.onError());
    expect(showToast).toHaveBeenCalledWith(
      "We couldn't save that. Try again",
      "error",
    );
  });

  it("reads the release and the artist lists again after a 404", async () => {
    mutate.mockClear();
    showToast.mockClear();
    const invalidate = vi
      .spyOn(QueryClient.prototype, "invalidateQueries")
      .mockResolvedValue();
    render(
      <TestProviders>
        <StudioNotifyMeButton
          releaseId="r1"
          releaseTitle="Maré alta"
          isSet={false}
        />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Notify me when Maré alta is out",
      }),
    );
    const options = (mutate.mock.calls as unknown[][]).at(0)?.at(1) as
      { onError: (error: unknown) => void } | undefined;
    if (!options) throw new Error("mutate was not called with options");
    act(() => options.onError(new Error("network")));
    expect(invalidate).not.toHaveBeenCalled();
    act(() => options.onError(new ApiError(404, "Not found")));
    expect(showToast).toHaveBeenCalledTimes(2);
    expect(showToast).toHaveBeenLastCalledWith(
      "This release is no longer available",
      "error",
    );
    const keys = invalidate.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(expect.arrayContaining(["studio", "release"]));
    expect(keys).toContainEqual(["studio", "artist", expect.any(Boolean)]);
    invalidate.mockRestore();
  });
});
