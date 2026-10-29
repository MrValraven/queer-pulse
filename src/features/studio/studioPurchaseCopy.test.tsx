import type { ReactElement } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrivacyPage } from "../marketing/PrivacyPage";
import { TestProviders } from "../../test/TestProviders";
import { StudioAboutPage } from "./StudioAboutPage";
import { StudioHelpPage } from "./StudioHelpPage";
import { StudioTermsPage } from "./StudioTermsPage";

const showcase = vi.hoisted(() => ({ isOn: false }));
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => showcase.isOn,
}));

function renderAt(path: string, page: ReactElement) {
  render(<TestProviders initialEntries={[path]}>{page}</TestProviders>);
}

beforeEach(() => {
  showcase.isOn = false;
});

describe("Studio purchase copy: Help", () => {
  it("shows the Buying and selling section with both questions", async () => {
    renderAt("/studio/help", <StudioHelpPage />);
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "Buying and selling",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "How do I buy music on Studio?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "How do I sell my music?" }),
    ).toBeInTheDocument();
  });

  it("links the buying answer to Your purchases and the selling answer to settings", async () => {
    renderAt("/studio/help", <StudioHelpPage />);
    fireEvent.click(
      await screen.findByRole("button", {
        name: "How do I buy music on Studio?",
      }),
    );
    expect(
      await screen.findByRole("link", { name: "Your purchases" }),
    ).toHaveAttribute("href", "/studio/library?tab=purchases");
    fireEvent.click(
      screen.getByRole("button", { name: "How do I sell my music?" }),
    );
    expect(
      await screen.findByRole("link", { name: "Studio settings" }),
    ).toHaveAttribute("href", "/studio/settings");
  });

  it("lists Buying and selling among the category cards", async () => {
    renderAt("/studio/help", <StudioHelpPage />);
    expect(
      await screen.findByRole("button", { name: /^Buying and selling/ }),
    ).toBeInTheDocument();
  });

  it("renders the buying section once beside the showcase money section in the demo", async () => {
    showcase.isOn = true;
    renderAt("/studio/help", <StudioHelpPage />);
    await screen.findByRole("button", {
      name: "Where does my money actually go?",
    });
    expect(
      screen.getAllByRole("heading", { level: 2, name: "Money and tips" }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("heading", { level: 2, name: "Buying and selling" }),
    ).toHaveLength(1);
    expect(document.querySelectorAll("#help-buying")).toHaveLength(1);
    expect(document.querySelectorAll("#help-money")).toHaveLength(1);
  });
});

describe("Studio purchase copy: Terms, privacy and About", () => {
  it("adds the selling section after the takedown section", async () => {
    renderAt("/studio/terms", <StudioTermsPage />);
    const takedown = await screen.findByText("04: takedowns and disputes");
    const selling = screen.getByText("05: buying and selling music");
    expect(
      takedown.compareDocumentPosition(selling) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const sellingSection = selling.closest("section");
    expect(sellingSection).not.toBeNull();
    expect(
      within(sellingSection as HTMLElement).getByText(
        /QueerPulse is not a party to the sale/,
      ),
    ).toBeInTheDocument();
  });

  it("lists music bought or sold on Studio in the privacy policy activity list", async () => {
    renderAt("/policies/privacy", <PrivacyPage />);
    expect(
      await screen.findByText("Music you buy or sell on Studio"),
    ).toBeInTheDocument();
  });

  it("no longer calls Studio listen-only on the About page", async () => {
    renderAt("/studio/about", <StudioAboutPage />);
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByText(/listen-only/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/artists can sell their music to you directly/i),
    ).toBeInTheDocument();
  });
});
