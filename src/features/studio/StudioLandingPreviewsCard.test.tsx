import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import {
  DEMO_ARTIST_MARIANA,
  DEMO_ARTIST_NIGHTFORM,
} from "./api/studioDemoMe.data";
import type { StudioErrorCode } from "./api/studio.types";
import type { StudioLandingPreviewOwnerItemDTO } from "./api/studioLanding.types";
import { StudioLandingPreviewsCard } from "./StudioLandingPreviewsCard";

interface MocksHolder {
  items: StudioLandingPreviewOwnerItemDTO[] | null;
  refusal: { status: number; code: StudioErrorCode } | null;
  listCalls: number;
  answerOverride: Partial<StudioLandingPreviewOwnerItemDTO> | null;
}

const mocks = vi.hoisted<MocksHolder>(() => ({
  items: null,
  refusal: null,
  listCalls: 0,
  answerOverride: null,
}));

vi.mock("./api/studioDemoLandingPreviews", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoLandingPreviews")>();
  return {
    ...original,
    demoStudioLandingPreviews: (
      ...args: Parameters<typeof original.demoStudioLandingPreviews>
    ) => {
      mocks.listCalls += 1;
      return mocks.items
        ? { items: mocks.items }
        : original.demoStudioLandingPreviews(...args);
    },
    demoActOnStudioLandingPreview: (
      ...args: Parameters<typeof original.demoActOnStudioLandingPreview>
    ) => {
      if (mocks.refusal) {
        const { status, code } = mocks.refusal;
        throw new ApiError(status, "Refused", { statusCode: status, code });
      }
      return {
        ...original.demoActOnStudioLandingPreview(...args),
        ...mocks.answerOverride,
      };
    },
  };
});

function itemOf(
  overrides: Partial<StudioLandingPreviewOwnerItemDTO> &
    Pick<StudioLandingPreviewOwnerItemDTO, "id">,
): StudioLandingPreviewOwnerItemDTO {
  return {
    status: "pending",
    relation: "main",
    track: {
      id: `track-${overrides.id}`,
      title: "Pedro on the 25",
      durationSeconds: 200,
    },
    release: { id: "release-1", title: "Late buses", coverUrl: null },
    mainArtist: DEMO_ARTIST_MARIANA,
    requestedAt: "2026-10-26T09:30:00.000Z",
    decidedAt: null,
    isEligible: true,
    canApprove: true,
    canDecline: true,
    canWithdraw: false,
    ...overrides,
  };
}

const PENDING_MAIN = itemOf({ id: "preview-pending" });
const APPROVED_CREDITED = itemOf({
  id: "preview-credited",
  status: "approved",
  relation: "credited",
  mainArtist: DEMO_ARTIST_NIGHTFORM,
  track: { id: "track-2", title: "Vela acesa", durationSeconds: 217 },
  canApprove: false,
  canDecline: false,
  canWithdraw: true,
});

function CardHost() {
  const outsideRef = useRef<HTMLHeadingElement>(null);
  return (
    <>
      <h1 ref={outsideRef} tabIndex={-1}>
        Outside heading
      </h1>
      <StudioLandingPreviewsCard
        subprofileId={DEMO_ARTIST_MARIANA.id}
        outsideFocusRef={outsideRef}
      />
    </>
  );
}

function renderCard(initialEntries?: string[]) {
  return render(
    <TestProviders initialEntries={initialEntries}>
      <CardHost />
    </TestProviders>,
  );
}

beforeEach(async () => {
  const demo = await import("./api/studioDemoLandingPreviews");
  demo.resetDemoStudioLandingPreviewsForTests();
  mocks.items = null;
  mocks.refusal = null;
  mocks.listCalls = 0;
  mocks.answerOverride = null;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("StudioLandingPreviewsCard", () => {
  it("shows Approve and Decline only where the server allows them", async () => {
    mocks.items = [PENDING_MAIN, APPROVED_CREDITED];
    renderCard();
    const [pendingRow, creditedRow] = await screen.findAllByRole("listitem");
    expect(
      within(pendingRow!).getByRole("button", {
        name: "Approve preview of Pedro on the 25",
      }),
    ).toBeInTheDocument();
    expect(
      within(creditedRow!).queryByRole("button", { name: /Approve/ }),
    ).toBeNull();
    expect(
      within(creditedRow!).getByRole("button", {
        name: /Withdraw the preview/,
      }),
    ).toBeInTheDocument();
    expect(
      within(creditedRow!).getByText(
        "You're credited on this track by NIGHTFORM",
      ),
    ).toBeInTheDocument();
  });

  it("confirms before approving and announces the result", async () => {
    renderCard();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Approve preview of Planície",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Play Planície on the Studio page?"),
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Approve preview" }),
    );
    expect(
      await screen.findByText("Planície is approved for the Studio page"),
    ).toBeInTheDocument();
  });

  it("folds a declined row away", async () => {
    renderCard();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Decline preview of Planície",
      }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      await screen.findByText("You declined the preview of Planície"),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Planície")).toBeNull(), {
      timeout: 3000,
    });
  });

  it.each([
    [
      "studio_landing_preview_main_persona_only",
      403,
      "Only the artist who released this track can answer",
      "Decline preview of Planície",
      null,
    ],
    [
      "studio_landing_preview_not_found",
      404,
      "This preview is no longer there",
      "Decline preview of Planície",
      null,
    ],
    [
      "studio_landing_preview_not_pending",
      409,
      "Someone already answered this request",
      "Decline preview of Planície",
      null,
    ],
    [
      "studio_landing_preview_not_approved",
      409,
      "This preview is no longer on the Studio page",
      "Withdraw preview of Vela acesa",
      "Withdraw preview",
    ],
  ] as const)(
    "names %s",
    async (code, status, line, buttonName, confirmName) => {
      mocks.refusal = { status, code };
      renderCard();
      fireEvent.click(await screen.findByRole("button", { name: buttonName }));
      if (confirmName) {
        const dialog = await screen.findByRole("dialog");
        fireEvent.click(
          within(dialog).getByRole("button", { name: confirmName }),
        );
      }
      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(line);
      if (status === 404) {
        await waitFor(() => expect(screen.queryByText("Planície")).toBeNull(), {
          timeout: 3000,
        });
      }
      if (status === 409) {
        const callsAfterFirstLoad = 1;
        await waitFor(() =>
          expect(mocks.listCalls).toBeGreaterThan(callsAfterFirstLoad),
        );
      }
    },
  );

  it("stays hidden for a persona whose list is empty", async () => {
    mocks.items = [];
    renderCard();
    await waitFor(() => expect(mocks.listCalls).toBeGreaterThan(0));
    expect(
      screen.queryByRole("heading", { name: "Your music on the Studio page" }),
    ).toBeNull();
  });

  it("reads an approved ineligible row as off the page", async () => {
    mocks.items = [{ ...APPROVED_CREDITED, isEligible: false }];
    renderCard();
    expect(
      await screen.findByText(
        "Approved. Off the page while it can't play there",
      ),
    ).toBeInTheDocument();
  });

  it("scrolls to the card and focuses its heading once for #landing-previews", async () => {
    const scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy;
    renderCard(["/studio/dashboard#landing-previews"]);
    const heading = await screen.findByRole("heading", {
      name: "Your music on the Studio page",
    });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(scrollSpy).toHaveBeenCalledTimes(1);
  });
});

describe("StudioLandingPreviewsCard answers", () => {
  it("moves focus to the approved row's Withdraw button after Approve", async () => {
    renderCard();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Approve preview of Planície",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Approve preview" }),
    );
    const withdraw = await screen.findByRole("button", {
      name: "Withdraw preview of Planície",
    });
    await waitFor(() => expect(withdraw).toHaveFocus());
  });

  it("moves focus to the next row's first action after Decline", async () => {
    renderCard();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Decline preview of Planície",
      }),
    );
    const nextAction = await screen.findByRole("button", {
      name: "Withdraw preview of Vela acesa",
    });
    await waitFor(() => expect(nextAction).toHaveFocus());
  });

  it("moves focus outside the card when the last row folds away", async () => {
    renderCard();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Decline preview of Planície",
      }),
    );
    const withdraw = await screen.findByRole("button", {
      name: "Withdraw preview of Vela acesa",
    });
    await waitFor(() => expect(withdraw).toHaveFocus());
    fireEvent.click(withdraw);
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Withdraw preview" }),
    );
    const outsideHeading = await screen.findByRole("heading", {
      name: "Outside heading",
    });
    await waitFor(() => expect(outsideHeading).toHaveFocus(), {
      timeout: 3000,
    });
  });

  it("says an approved track that cannot play on the page is off it", async () => {
    mocks.answerOverride = { isEligible: false };
    renderCard();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Approve preview of Planície",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Approve preview" }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Approved. Off the page while it can't play there",
    );
  });
});
