import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { AdminMarketingVideosPage } from "./AdminMarketingVideosPage";

// AdminShell pulls in the full admin chrome (live nav badges, the auth-backed
// role switcher) that this test has no reason to exercise.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function renderPage() {
  return render(
    <I18nProvider>
      <MemoryRouter>
        <AdminMarketingVideosPage />
      </MemoryRouter>
    </I18nProvider>,
  );
}

describe("AdminMarketingVideosPage", () => {
  it("lists every film with a still, its length and both actions", async () => {
    renderPage();
    const cinematic = within(
      await screen.findByRole("article", { name: "Cinematic" }),
    );
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(cinematic.getByText(/1:05 · 1080p/)).toBeInTheDocument();
    expect(cinematic.getByTitle("Cinematic, still frame")).toHaveAttribute(
      "src",
      "/marketing-videos/cinematic.html?t=52",
    );
    expect(cinematic.getByRole("button", { name: "Preview" })).toBeEnabled();
    expect(
      cinematic.getByRole("button", { name: "Render video" }),
    ).toBeEnabled();
  });

  it("flags the film that renders with motion blur", async () => {
    renderPage();
    const pro = within(await screen.findByRole("article", { name: "Pro" }));
    expect(pro.getByText(/Motion blur/)).toBeInTheDocument();
    const upbeat = within(screen.getByRole("article", { name: "Upbeat" }));
    expect(upbeat.queryByText(/Motion blur/)).not.toBeInTheDocument();
  });

  it("explains that rendering needs Chrome or Edge when this browser can't", async () => {
    // jsdom has no screen capture, so it stands in for Safari or a phone.
    renderPage();
    await userEvent.click(
      within(await screen.findByRole("article", { name: "Upbeat" })).getByRole(
        "button",
        { name: "Render video" },
      ),
    );
    const studio = screen.getByRole("dialog", { name: "Upbeat to video" });
    expect(within(studio).getByRole("alert")).toHaveTextContent(
      "Rendering needs Chrome or Edge on a computer.",
    );
    expect(
      within(studio).queryByRole("button", { name: "Start rendering" }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      within(studio).getByRole("button", { name: "Close" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a preview with transport controls", async () => {
    renderPage();
    await userEvent.click(
      within(await screen.findByRole("article", { name: "Pro" })).getByRole(
        "button",
        {
          name: "Preview",
        },
      ),
    );
    const preview = screen.getByRole("dialog");
    expect(within(preview).getByTitle("Pro, playing")).toHaveAttribute(
      "src",
      "/marketing-videos/pro.html",
    );
    // Disabled until the film inside the frame reports it is ready.
    expect(
      within(preview).getByRole("button", { name: "Play" }),
    ).toBeDisabled();
    expect(
      within(preview).getByRole("slider", { name: "Position in the film" }),
    ).toBeInTheDocument();
  });
});
