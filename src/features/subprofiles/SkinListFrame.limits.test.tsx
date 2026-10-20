import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { SkinChoiceChipsRefined } from "./SkinChoiceChipsRefined";
import { SkinListFrame } from "./SkinListFrame";
import {
  SubprofileEditorContext,
  type SocialRow,
  type SubprofileEditorContextValue,
} from "./subprofileEditorContext";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";

const LINES_CONTROL = {
  kind: "lines",
  path: "excerpt.lines",
  labelKey: "subprofiles:skinBlock.lineLabel",
  addLabelKey: "subprofiles:skinBlock.therapist.venue.addLine",
  maxItems: 2,
} as SkinBlockControl;

function renderFrame(itemCount: number) {
  return render(
    <TestProviders>
      <SkinListFrame
        control={LINES_CONTROL}
        isLabelHidden={false}
        itemCount={itemCount}
        containerRef={createRef<HTMLDivElement>()}
        addButtonRef={createRef<HTMLButtonElement>()}
        onAdd={() => undefined}
      >
        <div />
      </SkinListFrame>
    </TestProviders>,
  );
}

const CHOICE_CONTROL = {
  kind: "choice",
  path: "booking.route",
  labelKey: "subprofiles:skinBlock.lineLabel",
  options: [
    {
      value: "instagram",
      labelKey: "marketing:listBusiness.step5.online.instagram",
      offeredWhen: "instagramLink",
    },
  ],
} as SkinBlockControl;

const CHOICE_EDITOR = {
  getValue: () => "",
  setValue: () => undefined,
} as unknown as SubprofileSkinBlocksEditor;

function renderChips(socialRows: SocialRow[]) {
  const context = {
    socialRows,
    subprofile: { status: "draft" },
  } as unknown as SubprofileEditorContextValue;
  return render(
    <TestProviders>
      <SubprofileEditorContext.Provider value={context}>
        <SkinChoiceChipsRefined
          control={CHOICE_CONTROL}
          editor={CHOICE_EDITOR}
        />
      </SubprofileEditorContext.Provider>
    </TestProviders>,
  );
}

describe("list and option limits", () => {
  it("folds the add button away at the list cap", async () => {
    const view = renderFrame(1);
    expect(screen.getByRole("button", { name: "Add a line" })).toBeTruthy();
    view.unmount();

    renderFrame(2);
    expect(screen.queryByRole("button", { name: "Add a line" })).toBeNull();
    expect(await screen.findByText("Up to 2")).toBeTruthy();
  });

  it("offers the Instagram route only with an Instagram link", () => {
    const withoutLink = renderChips([]);
    expect(screen.queryByText("Instagram")).toBeNull();
    withoutLink.unmount();

    renderChips([
      { platform: "instagram", urlOrHandle: "@inkwell", _uid: "s1" },
    ]);
    expect(screen.getByText("Instagram")).toBeTruthy();
  });
});
