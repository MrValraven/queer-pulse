import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../../test/TestProviders";
import type { SubprofileItemView } from "../../../api/subprofiles.adapters";
import type { FlashDayEventRef } from "../../../api/subprofiles.api";
import { emptyItem } from "../../../subprofileSectionEditorRows";
import { TattooFlashDayEventPicker } from "./TattooFlashDayEventPicker";

const useOptionsMock =
  vi.fn<
    (subprofileId: string, isEnabled: boolean) => Record<string, unknown>
  >();
const editorState = {
  linkVisibility: "linked" as "linked" | "unlinked",
  draftLink: "linked" as "linked" | "unlinked",
};

vi.mock("../../../api/useFlashDayEventOptions", () => ({
  useFlashDayEventOptions: (subprofileId: string, isEnabled: boolean) =>
    useOptionsMock(subprofileId, isEnabled),
}));

vi.mock("../../../subprofileEditorContext", () => ({
  useSubprofileEditorContext: () => ({
    subprofile: { id: "persona-1", linkVisibility: editorState.linkVisibility },
    meta: { metaSnapshot: () => ({ link: editorState.draftLink }) },
  }),
}));

const picnic: FlashDayEventRef = {
  slug: "trans-joy-picnic",
  title: "Trans Joy Picnic",
  startsAt: "2026-11-14T13:00:00.000Z",
  endsAt: null,
  venue: "Hampstead Heath",
  neighbourhood: null,
  isOnline: false,
  imageUrl: null,
};

const flashDayDraft = (
  overrides: Partial<SubprofileItemView> = {},
): SubprofileItemView => ({ ...emptyItem("flash_days"), ...overrides });

function renderPicker(
  draft: SubprofileItemView,
  onPatch = vi.fn<(patch: Partial<SubprofileItemView>) => void>(),
) {
  render(
    <TestProviders>
      <TattooFlashDayEventPicker draft={draft} onPatch={onPatch} />
    </TestProviders>,
  );
  return onPatch;
}

describe("TattooFlashDayEventPicker", () => {
  beforeEach(() => {
    editorState.linkVisibility = "linked";
    editorState.draftLink = "linked";
    useOptionsMock.mockReset();
    useOptionsMock.mockReturnValue({
      data: [picnic],
      isPending: false,
      isError: false,
      isSuccess: true,
    });
  });

  it("fills the date and place from a picked event", () => {
    const onPatch = renderPicker(flashDayDraft());
    fireEvent.click(screen.getByRole("button", { name: /Link to an event/ }));
    fireEvent.click(
      screen.getByRole("option", { name: /Trans Joy Picnic · / }),
    );

    expect(onPatch).toHaveBeenCalledTimes(1);
    const patch = onPatch.mock.calls[0]![0];
    expect(patch.date).toMatch(/^2026-11-1[45]$/);
    expect(patch.subtitle).toBe("Hampstead Heath");
    expect(patch.structured?.flashDay?.eventSlug).toBe("trans-joy-picnic");
  });

  it("hides the picker while the draft unlinks the persona", () => {
    editorState.draftLink = "unlinked";
    renderPicker(flashDayDraft());

    expect(screen.queryByText("Link to an event")).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Link to an event/ }),
    ).toBeNull();
    expect(useOptionsMock).toHaveBeenCalledWith("persona-1", false);
  });

  it("hides the picker on an unlinked persona", () => {
    editorState.linkVisibility = "unlinked";
    editorState.draftLink = "unlinked";
    renderPicker(flashDayDraft());

    expect(
      screen.queryByRole("button", { name: /Link to an event/ }),
    ).toBeNull();
    expect(useOptionsMock).toHaveBeenCalledWith("persona-1", false);
  });

  it("names a co-owner's linked event from the item", () => {
    renderPicker(
      flashDayDraft({
        structured: { flashDay: { eventSlug: "queer-flash-market" } },
        linkedEvent: {
          ...picnic,
          slug: "queer-flash-market",
          title: "Queer Flash Market",
        },
      }),
    );

    expect(screen.getByText("Queer Flash Market")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove link" }),
    ).toBeInTheDocument();
  });
});
