import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import {
  UNPUBLISH_FLOW_PIECE_TITLE,
  makePublishedPiece,
} from "./unpublishFlowFixtures";
import { UnpublishFlowHarness } from "./unpublishFlowHarness";

/**
 * The confirm in front of the desk's unpublish: the row's "Unpublish…" item
 * and the board card's "Unpublish" button raise the same dialog, where a
 * radio picks Draft (the default) or Review and the confirm button names the
 * pick. Nothing is sent until that button is pressed. Live mode, with the
 * sender stubbed.
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
async function raiseDialog(surface: "row" | "board") {
  if (surface === "row") {
    fireEvent.click(
      await screen.findByRole("button", {
        name: `More actions for ${UNPUBLISH_FLOW_PIECE_TITLE}`,
      }),
    );
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Unpublish…" }),
    );
  } else {
    // A real click focuses the button; jsdom's synthetic one does not.
    const unpublishButton = await screen.findByRole("button", {
      name: "Unpublish",
    });
    unpublishButton.focus();
    fireEvent.click(unpublishButton);
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
    it("opens a dialog that names the piece and defaults to Draft without sending anything", async () => {
      await renderFlow(surface);

      const dialog = await raiseDialog(surface);

      expect(dialog).toHaveTextContent(
        `Unpublish “${UNPUBLISH_FLOW_PIECE_TITLE}”?`,
      );
      expect(dialog).toHaveTextContent(
        /a link someone already shared stops working/,
      );
      const destinations = within(dialog).getByRole("radiogroup", {
        name: "Where it goes",
      });
      expect(
        within(destinations).getByRole("radio", { name: "Back to draft" }),
      ).toHaveAttribute("aria-checked", "true");
      expect(
        within(destinations).getByRole("radio", { name: "Back to review" }),
      ).toHaveAttribute("aria-checked", "false");
      expect(
        within(dialog).getByRole("button", { name: "Unpublish to draft" }),
      ).toBeInTheDocument();
      expect(apiMocks.unpublishPiece).not.toHaveBeenCalled();
    });

    it("opens with focus on Cancel", async () => {
      await renderFlow(surface);

      const dialog = await raiseDialog(surface);

      expect(
        within(dialog).getByRole("button", { name: "Cancel" }),
      ).toHaveFocus();
    });

    it("sends the drafting stage when confirmed with the default pick", async () => {
      await renderFlow(surface);

      const dialog = await raiseDialog(surface);
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Unpublish to draft" }),
      );

      await waitFor(() =>
        expect(apiMocks.unpublishPiece).toHaveBeenCalledWith(
          "piece-1",
          "drafting",
        ),
      );
    });

    it("names the review pick on the confirm button and sends in_review only after confirm", async () => {
      await renderFlow(surface);

      const dialog = await raiseDialog(surface);
      fireEvent.click(
        within(dialog).getByRole("radio", { name: "Back to review" }),
      );
      expect(
        within(dialog).getByRole("radio", { name: "Back to review" }),
      ).toHaveAttribute("aria-checked", "true");
      expect(
        within(dialog).queryByRole("button", { name: "Unpublish to draft" }),
      ).toBeNull();
      expect(apiMocks.unpublishPiece).not.toHaveBeenCalled();

      fireEvent.click(
        within(dialog).getByRole("button", { name: "Unpublish to review" }),
      );

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

      await raiseDialog(surface);
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(apiMocks.unpublishPiece).not.toHaveBeenCalled();
    });

    it("closes on Escape and never sends the request", async () => {
      await renderFlow(surface);

      await raiseDialog(surface);
      fireEvent.keyDown(document.body, { key: "Escape" });

      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(apiMocks.unpublishPiece).not.toHaveBeenCalled();
    });

    it("disables both buttons while the request is out and closes when it fails", async () => {
      let rejectRequest: (reason: Error) => void = () => undefined;
      apiMocks.unpublishPiece.mockReturnValue(
        new Promise((_resolve, reject) => {
          rejectRequest = reject;
        }),
      );
      await renderFlow(surface);

      const dialog = await raiseDialog(surface);
      const confirm = within(dialog).getByRole("button", {
        name: "Unpublish to draft",
      });
      const cancel = within(dialog).getByRole("button", { name: "Cancel" });
      fireEvent.click(confirm);

      await waitFor(() => expect(confirm).toBeDisabled());
      expect(cancel).toBeDisabled();

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

    await raiseDialog("row");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: `More actions for ${UNPUBLISH_FLOW_PIECE_TITLE}`,
        }),
      ).toHaveFocus(),
    );
  });

  it("returns focus to the card's Unpublish button after Cancel", async () => {
    await renderFlow("board");

    await raiseDialog("board");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Unpublish" })).toHaveFocus(),
    );
  });
});
