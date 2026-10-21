import { render, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudioUploadActivityProvider } from "./StudioUploadActivity";
import { useReportUploadActivity } from "./studioUploadActivityContext";
import {
  isStepWithinDraft,
  leaveGuardMessageKeyOf,
  useStudioUploadLeaveGuard,
} from "./useStudioUploadLeaveGuard";

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

describe("useStudioUploadLeaveGuard", () => {
  it("blocks navigation, Back included, while uploads run", () => {
    renderHook(() =>
      useStudioUploadLeaveGuard({
        hasActiveUploads: true,
        hasUnsavedDetails: false,
      }),
    );
    expect(lastOptions()).toMatchObject({
      active: true,
      guardBackButton: true,
      shouldAllowQueryChanges: true,
      confirmMessage: "studio:uploadFlow.leave.uploadsBody",
    });
  });

  it("asks about unsaved details when no upload runs", () => {
    renderHook(() =>
      useStudioUploadLeaveGuard({
        hasActiveUploads: false,
        hasUnsavedDetails: true,
      }),
    );
    expect(lastOptions().active).toBe(true);
    expect(lastOptions().confirmMessage).toBe(
      "studio:uploadFlow.leave.detailsBody",
    );
  });

  it("lets the member leave once nothing is pending", () => {
    renderHook(() =>
      useStudioUploadLeaveGuard({
        hasActiveUploads: false,
        hasUnsavedDetails: false,
      }),
    );
    expect(lastOptions().active).toBe(false);
  });

  it("names uploads over details when both are pending", () => {
    expect(
      leaveGuardMessageKeyOf({
        hasActiveUploads: true,
        hasUnsavedDetails: true,
      }),
    ).toBe("studio:uploadFlow.leave.uploadsBody");
  });
});

describe("isStepWithinDraft", () => {
  const at = (search: string) =>
    new URL(`https://queerpulse.test/studio/upload${search}`);
  it("lets a step through that keeps the draft", () => {
    expect(
      isStepWithinDraft(
        ["release"],
        at("?release=r1"),
        at("?release=r1&step=tracks"),
      ),
    ).toBe(true);
    // The first create gives the empty address its draft, and only that one.
    const created = new Map([["release", "r1"]]);
    expect(
      isStepWithinDraft(["release"], at(""), at("?release=r1"), created),
    ).toBe(true);
    expect(
      isStepWithinDraft(["release"], at(""), at("?release=r9"), created),
    ).toBe(false);
  });

  it("asks for a move that drops or swaps the draft", () => {
    expect(isStepWithinDraft(["release"], at("?release=r1"), at(""))).toBe(
      false,
    );
    expect(
      isStepWithinDraft(["release"], at("?release=r1"), at("?release=r2")),
    ).toBe(false);
  });

  it("lets a new episode take its id, and asks when the episode is dropped", () => {
    const kept = ["release", "episode"];
    expect(
      isStepWithinDraft(
        kept,
        at("?release=s1&episode=new"),
        at("?release=s1&episode=t1"),
        new Map([["episode", "t1"]]),
      ),
    ).toBe(true);
    expect(
      isStepWithinDraft(kept, at("?release=s1&episode=t1"), at("?release=s1")),
    ).toBe(false);
  });

  it("names held files apart from running uploads", () => {
    expect(
      leaveGuardMessageKeyOf({
        hasActiveUploads: false,
        hasHeldFiles: true,
        hasUnsavedDetails: true,
      }),
    ).toBe("studio:uploadFlow.leave.heldFilesBody");
  });
});

function ReportingPart({ isUploading }: { isUploading: boolean }) {
  useReportUploadActivity("uploads", isUploading);
  return null;
}

describe("StudioUploadActivityProvider", () => {
  it("guards while a part deep in the flow reports running uploads", () => {
    const { rerender, unmount } = render(
      <StudioUploadActivityProvider>
        <ReportingPart isUploading />
      </StudioUploadActivityProvider>,
    );
    expect(lastOptions().active).toBe(true);
    rerender(
      <StudioUploadActivityProvider>
        <ReportingPart isUploading={false} />
      </StudioUploadActivityProvider>,
    );
    expect(lastOptions().active).toBe(false);
    unmount();
  });
});
