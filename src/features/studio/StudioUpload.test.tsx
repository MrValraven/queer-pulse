import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioUploadPage } from "./StudioUploadPage";
import { SplitsTable } from "./StudioUploadSplitsTable";

/**
 * The upload flow runs the same steps in demo and live: Release, Tracks,
 * Publish. In demo the mutations resolve locally (studioDemoMutations), so
 * the whole flow is exercised here without a network.
 */
beforeEach(() => {
  window.localStorage.clear();
});

describe("StudioUploadPage steps", () => {
  it("holds the member on the release step until the release has a title", async () => {
    render(
      <TestProviders initialEntries={["/studio/upload"]}>
        <StudioUploadPage />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /save and continue/i }),
    );
    expect(
      await screen.findByText(/give the release a title/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /release/i, current: "step" }),
    ).toBeInTheDocument();
  });

  it("creates the draft on leaving the release step and moves to tracks", async () => {
    render(
      <TestProviders initialEntries={["/studio/upload"]}>
        <StudioUploadPage />
      </TestProviders>,
    );
    fireEvent.change(await screen.findByLabelText(/release title/i), {
      target: { value: "Cartas ao mar" },
    });
    expect(screen.getByRole("radio", { name: /Mariana Sol/ })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: /Late Bloomers/ }),
    ).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    expect(
      await screen.findByRole("button", { name: /choose audio files/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /tracks/i, current: "step" }),
    ).toBeInTheDocument();
  });

  it("opens a published release's track list with the drop zone and keeps Publish closed", async () => {
    render(
      <TestProviders
        initialEntries={[
          "/studio/upload?release=demo-release-cidade-dos-santos",
        ]}
      >
        <StudioUploadPage />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /save and continue/i }),
    );
    expect(
      await screen.findByRole("button", { name: /choose audio files/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /unpublish to change tracks/i }),
    ).not.toBeInTheDocument();
    const publishStep = within(
      screen.getByRole("list", { name: /upload steps/i }),
    ).getByRole("button", { name: /publish/i });
    expect(publishStep).toBeDisabled();
    expect(publishStep).not.toHaveAttribute("aria-current");
  });

  it("asks before removing a published release's track, then opens the version note panel", async () => {
    render(
      <TestProviders
        initialEntries={[
          "/studio/upload?release=demo-release-cidade-dos-santos",
        ]}
      >
        <StudioUploadPage />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /save and continue/i }),
    );
    const removeFirst = await screen.findByRole("button", {
      name: /remove track 1,/i,
    });
    expect(screen.queryByLabelText("Version note")).not.toBeInTheDocument();
    fireEvent.click(removeFirst);
    fireEvent.click(
      await screen.findByRole("button", { name: "Remove track" }),
    );
    expect(await screen.findByLabelText("Version note")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "You changed the tracks" }),
    ).toBeInTheDocument();
  });

  it("holds the release step on a buy link without https until it is cleared", async () => {
    render(
      <TestProviders initialEntries={["/studio/upload"]}>
        <StudioUploadPage />
      </TestProviders>,
    );
    fireEvent.change(await screen.findByLabelText(/release title/i), {
      target: { value: "Cartas ao mar" },
    });
    const buyLink = screen.getByLabelText(/buy link/i);
    fireEvent.change(buyLink, { target: { value: "http://shop.example" } });
    fireEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    expect(
      await screen.findByText("Use a full link starting with https://"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /release/i, current: "step" }),
    ).toBeInTheDocument();
    fireEvent.change(buyLink, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    expect(
      await screen.findByRole("button", { name: /choose audio files/i }),
    ).toBeInTheDocument();
  });

  it("shows staff's reason and nothing to edit for a taken-down release", async () => {
    render(
      <TestProviders
        initialEntries={[
          "/studio/upload?release=demo-release-taken-down-bairro",
        ]}
      >
        <StudioUploadPage />
      </TestProviders>,
    );
    expect(
      await screen.findByText("This release was taken down"),
    ).toBeInTheDocument();
    expect(screen.getByText(/check the sample/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/release title/i)).not.toBeInTheDocument();
  });
});

describe("SplitsTable invite form", () => {
  it("gates the Invite button until a handle is entered", async () => {
    render(
      <TestProviders>
        <SplitsTable collaborators={[]} onAdd={() => {}} />
      </TestProviders>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /add collaborator/i }),
    );

    const handleField = await screen.findByLabelText(/qp handle or email/i);
    expect(screen.getByRole("button", { name: /^invite$/i })).toBeDisabled();

    fireEvent.change(handleField, { target: { value: "@novavoz" } });
    expect(screen.getByRole("button", { name: /^invite$/i })).toBeEnabled();
  });

  it("invites a collaborator, calling onAdd with the handle and confirming with a toast", async () => {
    const onAdd = vi.fn();
    render(
      <TestProviders>
        <SplitsTable collaborators={[]} onAdd={onAdd} />
      </TestProviders>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /add collaborator/i }),
    );
    fireEvent.change(await screen.findByLabelText(/qp handle or email/i), {
      target: { value: "@novavoz" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^invite$/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("@novavoz");
    expect(
      await screen.findByText("Invited @novavoz to the splits"),
    ).toBeInTheDocument();
  });
});
