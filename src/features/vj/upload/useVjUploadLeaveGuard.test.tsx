import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVjUploadLeaveGuard } from "./useVjUploadLeaveGuard";

const guard = vi.fn<(options: unknown) => void>();
vi.mock("../../../shared/hooks/useUnsavedChangesGuard", () => ({
  useUnsavedChangesGuard: (options: unknown) => guard(options),
}));
vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const lastOptions = () =>
  guard.mock.lastCall?.[0] as {
    active: boolean;
    confirmMessage: string;
    guardBackButton: boolean;
    shouldAllowQueryChanges: boolean;
  };

beforeEach(() => guard.mockClear());

describe("useVjUploadLeaveGuard", () => {
  it("asks before leaving, Back included, while uploads are pending", () => {
    renderHook(() => useVjUploadLeaveGuard(true));
    expect(lastOptions()).toMatchObject({
      active: true,
      guardBackButton: true,
      shouldAllowQueryChanges: true,
      confirmMessage: "vj:page.leaveWhileUploading.body",
    });
  });

  it("lets the admin leave once no upload is pending", () => {
    renderHook(() => useVjUploadLeaveGuard(false));
    expect(lastOptions().active).toBe(false);
  });
});
