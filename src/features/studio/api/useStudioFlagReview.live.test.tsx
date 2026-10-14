import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  useStudioReviewAction,
  useStudioReviewReports,
  useStudioReviewWithdrawn,
} from "./useStudioFlagReview";

const getModReports = vi.hoisted(() =>
  vi.fn<(...args: unknown[]) => Promise<unknown>>(),
);
const actOnReport = vi.hoisted(() =>
  vi.fn<(...args: unknown[]) => Promise<unknown>>(),
);
const takeDownStudioRelease = vi.hoisted(() =>
  vi.fn<(...args: unknown[]) => Promise<unknown>>(),
);
const getWithdrawnStudioReleases = vi.hoisted(() =>
  vi.fn<(...args: unknown[]) => Promise<unknown>>(),
);
const rejectStudioDispute = vi.hoisted(() =>
  vi.fn<(...args: unknown[]) => Promise<unknown>>(),
);

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../../admin/api/moderation.api", () => ({
  getModReports: (params: unknown) => getModReports(params),
  actOnReport: (reportId: string, body: unknown) => actOnReport(reportId, body),
}));
vi.mock("../../admin/api/adminStudio.api", () => ({
  takeDownStudioRelease: (...args: unknown[]) => takeDownStudioRelease(...args),
  getOpenStudioDisputes: vi.fn(),
  getWithdrawnStudioReleases: (...args: unknown[]) =>
    getWithdrawnStudioReleases(...args),
  upholdStudioDispute: vi.fn(),
  rejectStudioDispute: (...args: unknown[]) => rejectStudioDispute(...args),
  restoreStudioRelease: vi.fn(),
}));

const withdrawnRow = (id: string, openDisputeId: string | null) => ({
  id,
  title: "Coro",
  type: "single",
  coverUrl: null,
  releasedOn: "2026-09-01",
  trackCount: 1,
  totalDurationSeconds: 180,
  artist: {
    id: "persona-1",
    handle: "coro",
    name: "Coro",
    kind: "musician",
    avatarUrl: null,
  },
  publishedAt: "2026-09-01T10:00:00.000Z",
  genre: null,
  status: "taken_down",
  takedownReason: "Names a member",
  takenDownAt: "2026-10-10T15:00:00.000Z",
  openDisputeId,
});

const reportRow = (id: string, subjectId: string) => ({
  id,
  severity: "medium",
  reasonCode: "copyright",
  subjectType: "studio_release",
  subjectId,
  reporter: { anonymous: true },
  reported: { id: "member-1", handle: "nightform", priorReports: 0 },
  community: null,
  createdAt: "2026-10-12T10:00:00.000Z",
  slaDueAt: "2026-10-13T10:00:00.000Z",
  status: "open",
});

function queueAnswer(rows: ReturnType<typeof reportRow>[]) {
  return {
    data: rows,
    pageInfo: { nextCursor: null, hasMore: false },
    counts: { open: rows.length, appeals: 0, resolved: 0 },
    clusters: [],
  };
}

function wrapperFor() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function renderReports() {
  return renderHook(
    () => ({
      reports: useStudioReviewReports(),
      action: useStudioReviewAction(),
    }),
    { wrapper: wrapperFor() },
  );
}

beforeEach(() => {
  getModReports.mockReset();
  actOnReport.mockReset();
  takeDownStudioRelease.mockReset();
  getWithdrawnStudioReleases.mockReset();
  rejectStudioDispute.mockReset();
  getWithdrawnStudioReleases.mockResolvedValue({
    items: [],
    pageInfo: { nextCursor: null, hasMore: false },
  });
  getModReports.mockResolvedValue(
    queueAnswer([
      reportRow("report-1", "release-1"),
      reportRow("report-2", "release-1"),
      reportRow("report-3", "release-2"),
    ]),
  );
});

describe("Studio review queues (live)", () => {
  it("asks for open studio_release reports and maps each one", async () => {
    const { result } = renderReports();
    await waitFor(() => expect(result.current.reports.items).toHaveLength(3));
    expect(getModReports).toHaveBeenCalledWith({
      tab: "open",
      subjectType: "studio_release",
      cursor: undefined,
    });
    expect(result.current.reports.items[0]).toEqual({
      reportId: "report-1",
      releaseId: "release-1",
      reasonCode: "copyright",
      reasonLabelKey: "safety:reason.copyright",
      createdAt: "2026-10-12T10:00:00.000Z",
    });
  });

  it("sends the report id with a takedown and drops every report about that release", async () => {
    takeDownStudioRelease.mockResolvedValue({});
    const { result } = renderReports();
    await waitFor(() => expect(result.current.reports.items).toHaveLength(3));
    getModReports.mockResolvedValue(
      queueAnswer([reportRow("report-3", "release-2")]),
    );
    await act(() =>
      result.current.action.mutateAsync({
        kind: "takeDown",
        reportId: "report-1",
        releaseId: "release-1",
        reason: "Uncleared sample",
      }),
    );
    expect(takeDownStudioRelease).toHaveBeenCalledWith(
      "release-1",
      "Uncleared sample",
      "report-1",
    );
    expect(result.current.reports.items.map((item) => item.reportId)).toEqual([
      "report-3",
    ]);
  });

  it("keeps the cards when a takedown fails, and re-reads the queue", async () => {
    takeDownStudioRelease.mockRejectedValueOnce(
      new ApiError(409, "Conflict", {
        statusCode: 409,
        code: "studio_takedown_report_not_open",
      }),
    );
    const { result } = renderReports();
    await waitFor(() => expect(result.current.reports.items).toHaveLength(3));
    await act(async () => {
      await expect(
        result.current.action.mutateAsync({
          kind: "takeDown",
          reportId: "report-1",
          releaseId: "release-1",
          reason: "Uncleared sample",
        }),
      ).rejects.toThrow();
    });
    expect(result.current.reports.items).toHaveLength(3);
    await waitFor(() => expect(getModReports).toHaveBeenCalledTimes(2));
  });

  it("dismisses with the report's own reason code and removes the card after the answer", async () => {
    let resolveDismiss: (value: unknown) => void = () => {};
    actOnReport.mockImplementation(
      () => new Promise((resolve) => (resolveDismiss = resolve)),
    );
    const { result } = renderReports();
    await waitFor(() => expect(result.current.reports.items).toHaveLength(3));
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.action.mutateAsync({
        kind: "dismiss",
        reportId: "report-3",
        reasonCode: "copyright",
      });
    });
    await waitFor(() =>
      expect(actOnReport).toHaveBeenCalledWith("report-3", {
        action: "dismiss",
        reasonCode: "copyright",
        note: "",
      }),
    );
    expect(result.current.reports.items).toHaveLength(3);
    await act(async () => {
      resolveDismiss({ id: "report-3", status: "resolved" });
      await pending;
    });
    expect(
      result.current.reports.items.map((item) => item.reportId),
    ).not.toContain("report-3");
  });

  it("clears the open dispute on its Withdrawn row once a reject succeeds", async () => {
    getWithdrawnStudioReleases.mockResolvedValue({
      items: [
        withdrawnRow("release-1", "dispute-1"),
        withdrawnRow("release-2", "dispute-2"),
      ],
      pageInfo: { nextCursor: null, hasMore: false },
    });
    rejectStudioDispute.mockResolvedValue({});
    const { result } = renderHook(
      () => ({
        withdrawn: useStudioReviewWithdrawn(),
        action: useStudioReviewAction(),
      }),
      { wrapper: wrapperFor() },
    );
    await waitFor(() => expect(result.current.withdrawn.items).toHaveLength(2));
    // The re-read after the decision never answers, so the rows on screen
    // are the cache patch itself.
    getWithdrawnStudioReleases.mockImplementation(
      () => new Promise<unknown>(() => {}),
    );
    await act(() =>
      result.current.action.mutateAsync({
        kind: "reject",
        disputeId: "dispute-1",
        releaseId: "release-1",
        reply: "The verse names someone else",
      }),
    );
    expect(rejectStudioDispute).toHaveBeenCalledWith(
      "dispute-1",
      "The verse names someone else",
    );
    expect(
      result.current.withdrawn.items.map((item) => [
        item.release.id,
        item.openDisputeId,
      ]),
    ).toEqual([
      ["release-1", null],
      ["release-2", "dispute-2"],
    ]);
  });

  it("re-reads every reader of the release after a takedown", async () => {
    takeDownStudioRelease.mockResolvedValue({});
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useStudioReviewAction(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });
    await act(() =>
      result.current.mutateAsync({
        kind: "takeDown",
        reportId: "report-1",
        releaseId: "release-1",
        reason: "Uncleared sample",
      }),
    );
    for (const queryKey of [
      ["studio", "release"],
      ["admin-studio", "release"],
      ["studio", "track"],
      ["studio", "releases"],
      ["studio", "artist"],
      ["mod-report"],
      ["mod-reports"],
    ])
      expect(invalidate).toHaveBeenCalledWith({ queryKey });
  });

  it("re-reads the release but no release list after a reject", async () => {
    rejectStudioDispute.mockResolvedValue({});
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useStudioReviewAction(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });
    await act(() =>
      result.current.mutateAsync({
        kind: "reject",
        disputeId: "dispute-1",
        releaseId: "release-1",
        reply: "The verse names someone else",
      }),
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["studio", "release"],
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["mod-report"] });
    expect(invalidate).not.toHaveBeenCalledWith({
      queryKey: ["studio", "releases"],
    });
  });
});
