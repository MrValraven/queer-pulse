import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type { ModReport } from "./adminModeration.data";
import type { AdminPersonaPostDTO } from "./api/adminPersonaPosts.api";
import { AdminPersonaPostActions } from "./AdminPersonaPostActions";

const { getPost, removePost } = vi.hoisted(() => ({
  getPost: vi.fn<(postId: string) => Promise<AdminPersonaPostDTO>>(),
  removePost: vi.fn<
    (postId: string, reason: string, reportId?: string) => Promise<void>
  >(() => Promise.resolve()),
}));

vi.mock("./api/adminPersonaPosts.api", () => ({
  getStaffPersonaPost: (postId: string) => getPost(postId),
  removeReportedPersonaPost: (
    postId: string,
    reason: string,
    reportId?: string,
  ) => removePost(postId, reason, reportId),
}));
vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: false }),
}));

const STAFF_POST: AdminPersonaPostDTO = {
  id: "post-1",
  body: "Back at the Friday night in Anjos this week",
  linkUrl: "https://www.example.org/friday",
  imageUrl: "https://images.example.org/friday.jpg",
  createdAt: "2026-10-12T21:00:00.000Z",
  editedAt: null,
  persona: { id: "sp-diogo-nightform", name: "NIGHTFORM", handle: "nightform" },
};

const report = {
  id: "r-post",
  subjectType: "persona_post",
  subjectId: "post-1",
  title: "NIGHTFORM",
  reportedName: "NIGHTFORM",
} as unknown as ModReport;

const renderPanel = () =>
  render(
    <TestProviders>
      <AdminPersonaPostActions report={report} />
    </TestProviders>,
  );

describe("AdminPersonaPostActions", () => {
  beforeEach(() => {
    getPost.mockReset();
    removePost.mockClear();
    getPost.mockResolvedValue(STAFF_POST);
  });

  it("shows the reported post from the staff read", async () => {
    renderPanel();
    expect(
      await screen.findByText("Back at the Friday night in Anjos this week"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("An update posted by NIGHTFORM"),
    ).toBeInTheDocument();
    expect(screen.getByText("example.org")).toBeInTheDocument();
    const photo = screen.getByRole("img", {
      name: "Photo in the update by NIGHTFORM",
    });
    expect(photo).toHaveAttribute("width", "240");
    expect(photo).toHaveAttribute("height", "180");
  });

  it("asks for a reason, removes the post for the open report and says so", async () => {
    renderPanel();
    fireEvent.click(
      await screen.findByRole("button", { name: "Remove update" }),
    );
    await screen.findByRole("dialog");
    const confirm = screen
      .getAllByRole("button", { name: "Remove update" })
      .at(-1)!;
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Names a member without consent" },
    });
    fireEvent.click(confirm);
    await waitFor(() =>
      expect(removePost).toHaveBeenCalledWith(
        "post-1",
        "Names a member without consent",
        "r-post",
      ),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      await screen.findByText(
        "Update removed. The persona's followers no longer see it",
      ),
    ).toBeInTheDocument();
    // The post is marked gone in place, so the panel never reads it again.
    expect(getPost).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Remove update" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("closes the dialog and reads the post as gone when Remove finds it already gone", async () => {
    removePost.mockRejectedValueOnce(
      new ApiError(404, "Persona post not found"),
    );
    renderPanel();
    fireEvent.click(
      await screen.findByRole("button", { name: "Remove update" }),
    );
    await screen.findByRole("dialog");
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Spam links" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Remove update" }).at(-1)!,
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    const status = await screen.findByText(
      "This update is gone, nothing left to remove",
    );
    await waitFor(() => expect(status).toHaveFocus());
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Remove update" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("reads an update that is already gone as gone, with no Remove update", async () => {
    getPost.mockRejectedValue(new ApiError(404, "Persona post not found"));
    renderPanel();
    expect(
      await screen.findByText("This update is gone, nothing left to remove"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove update" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("We couldn't load the reported update"),
    ).not.toBeInTheDocument();
  });

  it("offers Load the update again when the read fails and focuses the heading once it loads", async () => {
    getPost.mockRejectedValue(new ApiError(500, "Server error"));
    renderPanel();
    expect(
      await screen.findByText("We couldn't load the reported update"),
    ).toBeInTheDocument();
    getPost.mockResolvedValue(STAFF_POST);
    fireEvent.click(
      screen.getByRole("button", { name: "Load the update again" }),
    );
    expect(
      await screen.findByText("Back at the Friday night in Anjos this week"),
    ).toBeInTheDocument();
    // The Retry button left with the failure line, so focus sits on the
    // panel's heading.
    await waitFor(() =>
      expect(screen.getByText("Reported update")).toHaveFocus(),
    );
    expect(
      screen.queryByRole("button", { name: "Load the update again" }),
    ).not.toBeInTheDocument();
  });
});
