import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../app/providers/MotionProvider";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { CommunityDetailPage } from "./CommunityDetailPage";
import { editCommunityFieldId } from "./editCommunityFocusField";

// The demo viewer is a mod of this flagship (the membership SEED), and the
// demo editable fields carry no cover, so the checklist has an open cover row.
const STEWARDED_FLAGSHIP_PATH = "/community/queer-runners";
// A public flagship outside the membership SEED, so the demo viewer is a visitor.
const UNJOINED_FLAGSHIP_PATH = "/community/rainbow-arts";

const SETUP_CHECKLIST_REGION_NAME = /Finish setting up/;

beforeAll(() => {
  // jsdom has no layout engine, so the edit modal's scroll to its field needs
  // a stub to call.
  Element.prototype.scrollIntoView = vi.fn();
});

function DetailPageTree() {
  return (
    <MotionProvider>
      <Routes>
        <Route path="/community/:slug" element={<CommunityDetailPage />} />
      </Routes>
    </MotionProvider>
  );
}

function renderDetailPage(path: string) {
  return render(
    <TestProviders initialEntries={[path]}>
      <DetailPageTree />
    </TestProviders>,
  );
}

async function findSetupChecklist(): Promise<HTMLElement> {
  return screen.findByRole("region", { name: SETUP_CHECKLIST_REGION_NAME });
}

describe("CommunityDetailPage setup checklist", () => {
  it("shows the setup checklist to the demo mod of a flagship", async () => {
    renderDetailPage(STEWARDED_FLAGSHIP_PATH);
    await awaitCatalog("communities");

    const checklist = await findSetupChecklist();
    expect(
      within(checklist).getByRole("button", { name: /Add a cover image/ }),
    ).toBeInTheDocument();
  });

  it("shows no checklist on a flagship the demo viewer has not joined", async () => {
    renderDetailPage(UNJOINED_FLAGSHIP_PATH);
    await awaitCatalog("communities");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Rainbow Arts Collective",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: SETUP_CHECKLIST_REGION_NAME }),
    ).toBeNull();
  });

  it("opens Edit community focused on the cover from Add a cover image", async () => {
    const user = userEvent.setup();
    renderDetailPage(STEWARDED_FLAGSHIP_PATH);
    await awaitCatalog("communities");

    const checklist = await findSetupChecklist();
    await user.click(
      within(checklist).getByRole("button", { name: /Add a cover image/ }),
    );

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await waitFor(() => {
      const coverField = document.getElementById(editCommunityFieldId("cover"));
      expect(coverField).not.toBeNull();
      expect(coverField?.contains(document.activeElement)).toBe(true);
    });
  });

  it("hides the checklist after Dismiss checklist and keeps it hidden after a rerender in the same session", async () => {
    const user = userEvent.setup();
    const { rerender } = renderDetailPage(STEWARDED_FLAGSHIP_PATH);
    await awaitCatalog("communities");

    const checklist = await findSetupChecklist();
    await user.click(
      within(checklist).getByRole("button", { name: "Dismiss checklist" }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: SETUP_CHECKLIST_REGION_NAME }),
      ).toBeNull();
    });

    rerender(
      <TestProviders initialEntries={[STEWARDED_FLAGSHIP_PATH]}>
        <DetailPageTree />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Queer Runners Lisboa",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: SETUP_CHECKLIST_REGION_NAME }),
    ).toBeNull();
  });
});
