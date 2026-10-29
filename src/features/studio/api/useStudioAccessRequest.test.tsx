import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { useStudioAccessRequestState } from "./useStudioAccess";
import {
  useCancelStudioAccessRequest,
  useRequestStudioAccess,
} from "./useStudioAccessRequest";
import {
  readDemoStudioAccessRequest,
  resetDemoStudioAccessRequestForTests,
} from "./studioDemoAccessRequest";

const mocks = vi.hoisted(() => ({
  isDemo: false,
  isAccessOff: false,
  getStudioMe: vi.fn<() => Promise<unknown>>(),
  create: vi.fn<(body: { wantsToRelease: boolean }) => Promise<unknown>>(),
  cancel: vi.fn<() => Promise<void>>(),
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mocks.isDemo }),
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({
    loggedIn: true,
    checking: false,
    user: { id: "user-1" },
  }),
}));
vi.mock("./studio.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./studio.api")>()),
  getStudioMe: () => mocks.getStudioMe(),
}));
vi.mock("./studioAccessRequest.api", () => ({
  createStudioAccessRequest: (body: { wantsToRelease: boolean }) =>
    mocks.create(body),
  cancelStudioAccessRequest: () => mocks.cancel(),
}));
vi.mock("./studioDemoAccessSwitch", () => ({
  DEMO_STUDIO_ACCESS_STORAGE_KEY: "qp.demoStudioAccess.v1",
  isDemoStudioAccessOff: () => mocks.isAccessOff,
}));

const MEMBER_WITHOUT_ACCESS = { hasAccess: false, uploadablePersonas: [] };

function liveMemberWithoutAccess({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function apiErrorWithCode(status: number, code: string) {
  return new ApiError(status, code, { code });
}

function renderRequestHooks() {
  return renderHook(
    () => ({
      request: useRequestStudioAccess(),
      cancel: useCancelStudioAccessRequest(),
      state: useStudioAccessRequestState(),
    }),
    { wrapper: liveMemberWithoutAccess },
  );
}

beforeEach(() => {
  mocks.isDemo = false;
  mocks.isAccessOff = false;
  mocks.getStudioMe.mockReset();
  mocks.create.mockReset();
  mocks.cancel.mockReset();
  mocks.getStudioMe.mockResolvedValue(MEMBER_WITHOUT_ACCESS);
  resetDemoStudioAccessRequestForTests();
});

describe("studio access request hooks", () => {
  it("posts the release wish and marks the member as on the list", async () => {
    mocks.create.mockResolvedValue({
      hasPendingRequest: true,
      wantsToRelease: true,
      requestedAt: "2026-10-28T10:00:00.000Z",
    });
    const { result } = renderRequestHooks();
    await waitFor(() => expect(result.current.state.isKnown).toBe(true));
    expect(result.current.state.hasPendingRequest).toBe(false);
    await act(() =>
      result.current.request.mutateAsync({ wantsToRelease: true }),
    );
    expect(mocks.create).toHaveBeenCalledWith({ wantsToRelease: true });
    expect(result.current.state).toMatchObject({
      isKnown: true,
      hasPendingRequest: true,
      wantsToRelease: true,
    });
    expect(mocks.getStudioMe).toHaveBeenCalledTimes(1);
  });

  it("reads an existing request on a 409 as on the list", async () => {
    mocks.create.mockRejectedValue(
      apiErrorWithCode(409, "studio_access_request_exists"),
    );
    const { result } = renderRequestHooks();
    await waitFor(() => expect(result.current.state.isKnown).toBe(true));
    mocks.getStudioMe.mockResolvedValue({
      ...MEMBER_WITHOUT_ACCESS,
      hasPendingRequest: true,
      wantsToRelease: false,
    });
    await act(async () => {
      await result.current.request
        .mutateAsync({ wantsToRelease: false })
        .catch(() => undefined);
    });
    await waitFor(() =>
      expect(result.current.state).toMatchObject({
        hasPendingRequest: true,
        wantsToRelease: false,
      }),
    );
    expect(mocks.getStudioMe).toHaveBeenCalledTimes(2);
  });

  it("refetches GET /studio/me on studio_access_already_granted", async () => {
    mocks.create.mockRejectedValue(
      apiErrorWithCode(409, "studio_access_already_granted"),
    );
    const { result } = renderRequestHooks();
    await waitFor(() => expect(result.current.state.isKnown).toBe(true));
    expect(mocks.getStudioMe).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.request
        .mutateAsync({ wantsToRelease: true })
        .catch(() => undefined);
    });
    await waitFor(() => expect(mocks.getStudioMe).toHaveBeenCalledTimes(2));
  });

  it("cancels and clears the state", async () => {
    mocks.getStudioMe.mockResolvedValue({
      ...MEMBER_WITHOUT_ACCESS,
      hasPendingRequest: true,
      wantsToRelease: true,
    });
    mocks.cancel.mockResolvedValue(undefined);
    const { result } = renderRequestHooks();
    await waitFor(() =>
      expect(result.current.state.hasPendingRequest).toBe(true),
    );
    await act(() => result.current.cancel.mutateAsync());
    expect(mocks.cancel).toHaveBeenCalledTimes(1);
    expect(result.current.state).toMatchObject({
      isKnown: true,
      hasPendingRequest: false,
      wantsToRelease: false,
    });
  });

  it("reads a request flag that is not true as false", async () => {
    mocks.getStudioMe.mockResolvedValue({
      ...MEMBER_WITHOUT_ACCESS,
      hasPendingRequest: "yes",
      wantsToRelease: true,
    });
    const { result } = renderRequestHooks();
    await waitFor(() => expect(result.current.state.isKnown).toBe(true));
    expect(result.current.state).toMatchObject({
      hasPendingRequest: false,
      wantsToRelease: false,
    });
  });

  it("in demo with access off, keeps the request in memory and never calls the api", async () => {
    mocks.isDemo = true;
    mocks.isAccessOff = true;
    const { result } = renderRequestHooks();
    expect(result.current.state).toMatchObject({
      isKnown: true,
      hasPendingRequest: false,
    });
    await act(() =>
      result.current.request.mutateAsync({ wantsToRelease: true }),
    );
    expect(readDemoStudioAccessRequest()).toEqual({
      hasPendingRequest: true,
      wantsToRelease: true,
    });
    expect(result.current.state).toMatchObject({
      hasPendingRequest: true,
      wantsToRelease: true,
    });
    await act(() => result.current.cancel.mutateAsync());
    expect(readDemoStudioAccessRequest()).toEqual({
      hasPendingRequest: false,
      wantsToRelease: false,
    });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.cancel).not.toHaveBeenCalled();
    expect(mocks.getStudioMe).not.toHaveBeenCalled();
  });
});
