import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { gatheringDetails } from "./data";
import { GatheringHeroRunBy } from "./GatheringRunBy";

function renderLine(gathering = gatheringDetails["queer-history-walk"]!) {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <GatheringHeroRunBy gathering={gathering} />
      </I18nProvider>
    </MemoryRouter>,
  );
}

describe("GatheringHeroRunBy", () => {
  it("names the business and links to its listing", async () => {
    renderLine();
    const link = await screen.findByRole("link", {
      name: "Lisboa Arco-Íris Walks",
    });
    expect(link.getAttribute("href")).toBe(
      "/local/directory/lisboa-arco-iris-walks",
    );
    expect(screen.getByText(/Run by/)).toBeInTheDocument();
  });

  it("shows to a guest as it does to the host, so Preview as guest has it", async () => {
    renderLine({
      ...gatheringDetails["queer-history-walk"]!,
      viewerIsOrganizer: false,
    });
    expect(
      await screen.findByRole("link", { name: "Lisboa Arco-Íris Walks" }),
    ).toBeInTheDocument();
  });

  it("renders nothing without a business", () => {
    const { container } = renderLine({
      ...gatheringDetails["queer-history-walk"]!,
      runByListing: null,
    });
    expect(container).toBeEmptyDOMElement();
  });
});
