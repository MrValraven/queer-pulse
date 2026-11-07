import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import {
  UNPUBLISH_FLOW_PIECE_TITLE,
  makePublishedPiece,
} from "./unpublishFlowFixtures";
import { UnpublishFlowHarness } from "./unpublishFlowHarness";

/**
 * The confirm in front of the desk's unpublish: both the row's More menu and
 * the board card's buttons raise the same dialog, and nothing is sent until
 * its confirm button is pressed. Live mode, with the sender stubbed.
 */

const apiMocks = vi.hoisted(() => ({
  unpublishPiece: vi.fn(),
  publishPiece: vi.fn(),
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: false }),
}));

vi.mock("../api/useMagazineWriters", () => ({
  useMagazineWriters: () => ({ writers: [], isLoading: false, isError: false }),
}));

vi.mock("../api/piecePublish.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/piecePublish.api")>()),
  unpublishPiece: apiMocks.unpublishPiece,
  publishPiece: apiMocks.publishPiece,
}));

async function renderFlow(surface: "row" | "board") {
  render(
    <TestProviders>
      <UnpublishFlowHarness piece={makePublishedPiece()} surface={surface} />
    </TestProviders>,
  );
  await awaitCatalog("magazine");
}

/** Raises the dialog from whichever surface is rendered. */
async function raiseDialog(surface: "row" | "board", buttonName: string) {
  if (surface === "row") {
    fireEvent.click(
      await screen.findByRole("button", {
        name: `More actions for ${UNPUBLISH_FLOW_PIECE_TITLE}`,
      }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: buttonName }));
  } else {
    fireEvent.click(await screen.findByRole("button", { name: buttonName }));
  }
  return screen.findByRole("dialog");
}

beforeEach(() => {
  // jsdom does not implement scrolling; the Modal's scroll lock calls it.
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  apiMocks.unpublishPiece.mockReset().mockResolvedValue({});
  apiMocks.publishPiece.mockReset();
});

describe.each(["row", "board"] as const)(
  "unpublish confirm from the %s",
  (surface) => {
    it("opens a dialog that names the piece and the destination without sending anything", async () => {
      await renderFlow(surface);

      const dialog = await raiseDialog(surface, "Unpublish to draft");

      expect(dialog).toHaveTextContent(
        `Unpublish “${UNPUBLISH_FLOW_PIECE_TITLE}”?`,
      );
      expect(dialog).toHaveTextContent("It goes back to draft.");
      expect(dialog).toHaveTextContent(
        /a link someone already shared stops working/,
      );
      expect(apiMocks.unpublishPiece).not.toHaveBeenCalled();
    });

    it("names the review destination and sends the in_review stage only after confirm", async () => {
      await renderFlow(surface);

      const dialog = await raiseDialog(surface, "Unpublish to review");
      expect(dialog).toHaveTextContent("It goes back to review.");
      expect(apiMocks.unpublishPiece).not.toHaveBeenCalled();

      // The dialog's own confirm shares its label with the control that raised it.
      const confirm = screen
        .getAllByRole("button", { name: "Unpublish to review" })
        .at(-1) as HTMLElement;
      fireEvent.click(confirm);

      await waitFor(() =>
        expect(apiMocks.unpublishPiece).toHaveBeenCalledWith(
          "piece-1",
          "in_review",
        ),
      );
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("closes on Cancel and never sends the request", async () => {
      await renderFlow(surface);

      await raiseDialog(surface, "Unpublish to draft");
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(apiMocks.unpublishPiece).not.toHaveBeenCalled();
    });

    it("closes on Escape and never sends the request", async () => {
      await renderFlow(surface);

      await raiseDialog(surface, "Unpublish to draft");
      fireEvent.keyDown(document.body, { key: "Escape" });

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(apiMocks.unpublishPiece).not.toHaveBeenCalled();
    });

    it("keeps the confirm busy while the request is out and closes when it fails", async () => {
      let rejectRequest: (reason: Error) => void = () => undefined;
      apiMocks.unpublishPiece.mockReturnValue(
        new Promise((_resolve, reject) => {
          rejectRequest = reject;
        }),
      );
      await renderFlow(surface);

      await raiseDialog(surface, "Unpublish to draft");
      const confirm = screen
        .getAllByRole("button", { name: "Unpublish to draft" })
        .at(-1) as HTMLElement;
      fireEvent.click(confirm);

      await waitFor(() => expect(confirm).toBeDisabled());
      expect(confirm).toHaveAttribute("aria-busy", "true");

      rejectRequest(new Error("boom"));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });
  },
);

describe("unpublish confirm focus", () => {
  it("returns focus to the More trigger after Cancel", async () => {
    await renderFlow("row");

    await raiseDialog("row", "Unpublish to draft");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: `More actions for ${UNPUBLISH_FLOW_PIECE_TITLE}`,
        }),
      ).toHaveFocus(),
    );
  });
});
