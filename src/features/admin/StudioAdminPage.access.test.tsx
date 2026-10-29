import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { TestProviders } from "../../test/TestProviders";
import { StudioAdminPage } from "./StudioAdminPage";

vi.mock("../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const holder: { hasStaffTier: boolean } = vi.hoisted(() => ({
  hasStaffTier: true,
}));

const requestOptions: Array<{ isEnabled?: boolean }> = vi.hoisted(() => []);

const accessPageReads: { count: number } = vi.hoisted(() => ({ count: 0 }));

vi.mock("./useStudioAdminViewer", () => ({
  useStudioAdminViewer: () => ({ hasStaffTier: holder.hasStaffTier }),
}));

vi.mock("./api/useStudioAdminAccessRequests", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioAdminAccessRequests")>();
  return {
    ...original,
    useAdminStudioAccessRequests: (options?: { isEnabled?: boolean }) => {
      requestOptions.push(options ?? {});
      return original.useAdminStudioAccessRequests(options);
    },
  };
});

vi.mock("./StudioAdminAccessRequests.data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./StudioAdminAccessRequests.data")>();
  return {
    ...original,
    demoAccessRequestPage: (
      ...args: Parameters<typeof original.demoAccessRequestPage>
    ) => {
      accessPageReads.count += 1;
      return original.demoAccessRequestPage(...args);
    },
  };
});

function renderPage() {
  render(
    <TestProviders initialEntries={["/admin/studio"]}>
      <StudioAdminPage />
    </TestProviders>,
  );
}

function tabNames(tabs: readonly HTMLElement[]) {
  return tabs.map((tab) => tab.textContent?.replace(/\d+$/, ""));
}

beforeEach(() => {
  holder.hasStaffTier = true;
  requestOptions.length = 0;
  accessPageReads.count = 0;
});

describe("Studio console tabs by viewer (demo)", () => {
  it("shows a curator only Shelves, Scenes and Artists", async () => {
    holder.hasStaffTier = false;
    renderPage();
    const tabs = await screen.findAllByRole("tab");
    expect(tabNames(tabs)).toEqual(["Shelves", "Scenes", "Artists"]);
    expect(
      await screen.findByText(
        "Set the featured release, keep the shelves in order, run the scenes and pick the Artist of the month and New stars on Studio home",
      ),
    ).toBeInTheDocument();
  });

  it("never reads the Waiting count for a curator", async () => {
    holder.hasStaffTier = false;
    renderPage();
    await screen.findAllByRole("tab");
    expect(requestOptions.length).toBeGreaterThan(0);
    requestOptions.forEach((options) => expect(options.isEnabled).toBe(false));
    expect(accessPageReads.count).toBe(0);
  });

  it("shows staff all six tabs", async () => {
    renderPage();
    const tabs = await screen.findAllByRole("tab");
    expect(tabNames(tabs)).toEqual([
      "Shelves",
      "Scenes",
      "Artists",
      "Studio page",
      "Founding artists",
      "Waiting for Studio",
    ]);
    await waitFor(() => expect(accessPageReads.count).toBeGreaterThan(0));
  });

  it("opens the Artists tab", async () => {
    renderPage();
    fireEvent.click(await screen.findByRole("tab", { name: "Artists" }));
    expect(await screen.findByRole("tabpanel")).toHaveAccessibleName("Artists");
    expect(
      await screen.findByRole("heading", { name: "Artist of the month" }),
    ).toBeInTheDocument();
  });
});
