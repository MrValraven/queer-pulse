import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getVerificationStatus,
  type VerificationStatusWithRequestDTO,
} from "../../economy/api/verification.api";
import { useAskEligibility } from "./useAskEligibility";

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDemoMode: () => ({
    demoMode: false,
    available: false,
    setDemoMode: vi.fn(),
  }),
}));
vi.mock("../../economy/api/verification.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getVerificationStatus: vi.fn(),
}));

const statusMock = vi.mocked(getVerificationStatus);
const STATUS = (
  level: VerificationStatusWithRequestDTO["level"],
): VerificationStatusWithRequestDTO => ({
  level,
  phoneVerified: level === "phone",
  idVerified: false,
  method: null,
  provider: null,
  verifiedAt: null,
  latestRequest: null,
});

function renderEligibility(isEnabled: boolean) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useAskEligibility(isEnabled), { wrapper });
}

describe("useAskEligibility", () => {
  beforeEach(() => statusMock.mockReset());

  it("asks an email-level member for phone verification", async () => {
    statusMock.mockResolvedValue(STATUS("email"));
    const { result } = renderEligibility(true);
    await waitFor(() => expect(result.current.status).toBe("needsPhone"));
  });

  it("lets a phone-verified member write a fundraiser", async () => {
    statusMock.mockResolvedValue(STATUS("phone"));
    const { result } = renderEligibility(true);
    await waitFor(() => expect(result.current.status).toBe("allowed"));
  });

  it("shows the form when the lookup fails and leaves the decision to the server", async () => {
    statusMock.mockRejectedValue(new Error("network"));
    const { result } = renderEligibility(true);
    await waitFor(() => expect(result.current.status).toBe("allowed"));
  });

  it("asks nothing while no fundraiser is being written", () => {
    renderEligibility(false);
    expect(statusMock).not.toHaveBeenCalled();
  });
});
