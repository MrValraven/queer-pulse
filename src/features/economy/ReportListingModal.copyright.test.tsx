import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { copyrightClaimRouteFor } from "./reportCopyrightRouteFor";
import { ReportListingModal } from "./ReportListingModal";

const mutate = vi.fn();
vi.mock("../safety/api/useCreateReport", () => ({
  useCreateReport: () => ({ mutate, isPending: false }),
}));

beforeEach(() => mutate.mockReset());

function renderModal(
  subjectType: "studio_track" | "studio_release" | "housing",
) {
  return render(
    <TestProviders>
      <ReportListingModal
        subjectType={subjectType}
        subjectId="subject-1"
        subjectName="Vela acesa"
        onClose={() => {}}
      />
    </TestProviders>,
  );
}

const claimLinkHrefs = () =>
  screen
    .queryAllByRole("link")
    .map((link) => link.getAttribute("href"))
    .filter((href) => href?.startsWith("/studio/claims/new"));

describe("copyrightClaimRouteFor", () => {
  it("routes a Studio track and a Studio release, and nothing else", () => {
    expect(copyrightClaimRouteFor("studio_track", "t1")).toBe(
      "/studio/claims/new?track=t1",
    );
    expect(copyrightClaimRouteFor("studio_release", "r1")).toBe(
      "/studio/claims/new?release=r1",
    );
    expect(copyrightClaimRouteFor("housing", "h1")).toBeNull();
  });
});

describe("ReportListingModal, copyright on Studio (spec 4.2)", () => {
  it("swaps the submit for the claim form link on a track", () => {
    renderModal("studio_track");
    fireEvent.click(screen.getByDisplayValue("copyright"));
    expect(claimLinkHrefs()).toEqual(["/studio/claims/new?track=subject-1"]);
    fireEvent.click(screen.getAllByRole("link").at(-1) as HTMLElement);
    expect(mutate).not.toHaveBeenCalled();
  });

  it("asks a release report which track, through the release link", () => {
    renderModal("studio_release");
    fireEvent.click(screen.getByDisplayValue("copyright"));
    expect(claimLinkHrefs()).toEqual(["/studio/claims/new?release=subject-1"]);
  });

  it("brings the submit back when another reason is picked", () => {
    renderModal("studio_track");
    fireEvent.click(screen.getByDisplayValue("copyright"));
    fireEvent.click(screen.getByDisplayValue("spam"));
    expect(claimLinkHrefs()).toEqual([]);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Same promo posted on every track" },
    });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1] as HTMLElement);
    expect(mutate).toHaveBeenCalledTimes(1);
  });
});
