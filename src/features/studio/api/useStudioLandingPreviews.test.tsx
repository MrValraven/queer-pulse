import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { StudioLandingPreviewOwnerItemDTO } from "./studioLanding.types";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import { toLandingPreviewOwnerViews } from "./studioLandingPreviews.adapters";
import type { StudioLandingPreviewOwnerView } from "./studioLandingPreviews.adapters";
import { studioKeys } from "./studioQueryKeys";
import { useStudioLandingPreviewAction } from "./useStudioLandingPreviews";

const mocks: {
  act: ReturnType<typeof vi.fn>;
} = vi.hoisted(() => ({ act: vi.fn() }));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("./useStudioAccess", () => ({
  useStudioAccess: () => ({ hasAccess: true, uploadablePersonas: [] }),
}));
vi.mock("./studioLandingPreviews.api", () => ({
  getStudioLandingPreviews: vi.fn(),
  actOnStudioLandingPreview: mocks.act,
}));

const SUBPROFILE_ID = "sp-1";
const LIST_KEY = studioKeys.landingPreviews(false, SUBPROFILE_ID);
const LANDING_KEY = studioKeys.landing(false);

const PENDING: StudioLandingPreviewOwnerItemDTO = {
  id: "pending-1",
  status: "pending",
  relation: "main",
  track: { id: "track-1", title: "Planície", durationSeconds: 238 },
  release: { id: "release-1", title: "Cidade dos santos", coverUrl: null },
  mainArtist: DEMO_ARTIST_MARIANA,
  requestedAt: "2026-10-26T09:30:00.000Z",
  decidedAt: null,
  isEligible: true,
  canApprove: true,
  canDecline: true,
  canWithdraw: false,
};
const APPROVED: StudioLandingPreviewOwnerItemDTO = {
  ...PENDING,
  id: "approved-1",
  status: "approved",
  decidedAt: "2026-10-27T10:00:00.000Z",
  canApprove: false,
  canDecline: false,
  canWithdraw: true,
};

function refusal(status: number, code: string): ApiError {
  return new ApiError(status, "Refused", { statusCode: status, code });
}

describe("useStudioLandingPreviewAction", () => {
  let queryClient = new QueryClient();
  let wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    mocks.act.mockReset();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    queryClient.setQueryData(
      LIST_KEY,
      toLandingPreviewOwnerViews({ items: [PENDING, APPROVED] }),
    );
    queryClient.setQueryData(LANDING_KEY, { counts: {} });
  });

  const idsInCache = () =>
    (
      queryClient.getQueryData<StudioLandingPreviewOwnerView[]>(LIST_KEY) ?? []
    ).map((row) => row.id);
  const isInvalidated = (key: readonly unknown[]) =>
    queryClient.getQueryState(key)?.isInvalidated === true;

  async function run(
    previewId: string,
    action: "approve" | "decline" | "withdraw",
  ) {
    const { result } = renderHook(
      () => useStudioLandingPreviewAction(SUBPROFILE_ID),
      { wrapper },
    );
    await act(async () => {
      await result.current.mutateAsync({ previewId, action }).catch(() => null);
    });
    await waitFor(() => expect(result.current.isIdle).toBe(false));
  }

  it("approve replaces the row with the approved answer and refreshes the landing", async () => {
    mocks.act.mockResolvedValue({
      ...PENDING,
      status: "approved",
      decidedAt: "2026-10-28T10:00:00.000Z",
      canApprove: false,
      canDecline: false,
      canWithdraw: true,
    });
    await run("pending-1", "approve");
    expect(mocks.act).toHaveBeenCalledWith(
      SUBPROFILE_ID,
      "pending-1",
      "approve",
    );
    expect(idsInCache()).toEqual(["pending-1", "approved-1"]);
    expect(
      queryClient.getQueryData<StudioLandingPreviewOwnerView[]>(LIST_KEY)?.[0],
    ).toMatchObject({ status: "approved", canWithdraw: true });
    expect(isInvalidated(LANDING_KEY)).toBe(true);
  });

  it("decline removes the row and leaves the landing alone", async () => {
    mocks.act.mockResolvedValue({ ...PENDING, status: "declined" });
    await run("pending-1", "decline");
    expect(idsInCache()).toEqual(["approved-1"]);
    expect(isInvalidated(LANDING_KEY)).toBe(false);
  });

  it("withdraw removes the row and refreshes the landing", async () => {
    mocks.act.mockResolvedValue({ ...APPROVED, status: "withdrawn" });
    await run("approved-1", "withdraw");
    expect(idsInCache()).toEqual(["pending-1"]);
    expect(isInvalidated(LANDING_KEY)).toBe(true);
  });

  it("a 404 not found removes the row", async () => {
    mocks.act.mockRejectedValue(
      refusal(404, "studio_landing_preview_not_found"),
    );
    await run("pending-1", "approve");
    expect(idsInCache()).toEqual(["approved-1"]);
  });

  it.each([
    ["approve", "pending-1", "studio_landing_preview_not_pending"],
    ["withdraw", "pending-1", "studio_landing_preview_not_approved"],
  ] as const)(
    "a 409 on %s invalidates the list (%s)",
    async (action, previewId, code) => {
      mocks.act.mockRejectedValue(refusal(409, code));
      await run(previewId, action);
      expect(isInvalidated(LIST_KEY)).toBe(true);
      expect(idsInCache()).toEqual(["pending-1", "approved-1"]);
    },
  );

  it("a 403 main persona only leaves the list as it is", async () => {
    mocks.act.mockRejectedValue(
      refusal(403, "studio_landing_preview_main_persona_only"),
    );
    await run("pending-1", "approve");
    expect(idsInCache()).toEqual(["pending-1", "approved-1"]);
    expect(isInvalidated(LIST_KEY)).toBe(false);
    expect(isInvalidated(LANDING_KEY)).toBe(false);
  });
});
