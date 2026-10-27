import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { routes } from "../../../app/routeMap";
import { UtilitiesHubPage } from "./UtilitiesHubPage";

vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("UtilitiesHubPage", () => {
  it("links the PDF pages card to the PDF tool", async () => {
    render(
      <I18nProvider>
        <MemoryRouter>
          <UtilitiesHubPage />
        </MemoryRouter>
      </I18nProvider>,
    );
    const link = await screen.findByRole("link", { name: /PDF pages/ });
    expect(link).toHaveAttribute("href", routes.adminUtilitiesPdf);
  });
});
