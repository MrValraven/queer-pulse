import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { ManagedListingItem } from "../../marketing/listBusiness/api/managedListings.api";
import { AdminMusicEventNewPage } from "./AdminMusicEventNewPage";

const managedTour: ManagedListingItem = {
  id: "listing-uuid-1",
  ref: "QPL-2026-0101",
  slug: "lisboa-arco-iris-walks",
  name: "Lisboa Arco-Íris Walks",
  kind: "mobile",
  meetingPoint: null,
};

vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// The signed-in staff member hosts with a community and runs a business, so
// every field missing below is the house scope's doing.
vi.mock("../../gatherings/useHostableCommunities", () => ({
  useHostableCommunities: () => ({
    options: [{ slug: "queer-runners", name: "Queer Runners" }],
    isResolving: false,
  }),
  useDropUnhostableCommunity: () => undefined,
}));
vi.mock("../../marketing/listBusiness/api/useManagedListings", () => ({
  useManagedListings: () => ({ items: [managedTour], isResolving: false }),
}));

function renderNewPage() {
  return render(
    <TestProviders initialEntries={["/admin/music-events/new"]}>
      <Routes>
        <Route
          path="/admin/music-events/new"
          element={<AdminMusicEventNewPage />}
        />
      </Routes>
    </TestProviders>,
  );
}

describe("AdminMusicEventNewPage", () => {
  it("opens the wizard on Music with house fields hidden", async () => {
    renderNewPage();

    expect(
      await screen.findByRole("heading", { name: "Create a music event" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to music events" }),
    ).toHaveAttribute("href", "/admin/music-events");
    expect((await screen.findAllByText("Club night")).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.queryByText("Run by one of your businesses"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Host it with a community"),
    ).not.toBeInTheDocument();
  });
});
