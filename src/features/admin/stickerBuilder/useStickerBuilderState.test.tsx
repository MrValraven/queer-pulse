import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type {
  AdminStickerPackResponse,
  AdminStickerResponse,
} from "../../../shared/contracts/contracts";
import { BLIP_TEMPLATE } from "../../stickers/templates/blip/blip.template";
import { TEA_TEMPLATE } from "../../stickers/templates/tea/tea.template";
import { templateItemIds } from "./stickerItems";
import { useStickerBuilderState } from "./useStickerBuilderState";

const PACK_ID = "pack-1";

function RouterWrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={[`/admin/stickers?pack=${PACK_ID}`]}>
      {children}
    </MemoryRouter>
  );
}

function blipHiSticker(): AdminStickerResponse {
  return {
    id: "sticker-1",
    slug: "blip-hi",
    label: "Hi",
    labelPt: null,
    url: "https://example.test/sticker.png",
    width: 512,
    height: 512,
    keywords: { en: [], pt: [] },
    templateId: "blip",
    templateParams: { itemId: "hi", ...BLIP_TEMPLATE.defaultStyle },
    sortOrder: 1,
  };
}

function packFixture(
  stickers: AdminStickerResponse[],
): AdminStickerPackResponse {
  return {
    id: PACK_ID,
    slug: "pack-one",
    name: "Pack one",
    namePt: null,
    description: null,
    coverStickerId: null,
    status: "draft",
    sortOrder: 0,
    createdAt: "2026-09-28T00:00:00.000Z",
    updatedAt: "2026-09-28T00:00:00.000Z",
    stickers,
  };
}

function renderBuilderState(initialPacks: AdminStickerPackResponse[]) {
  return renderHook(
    ({ packs }: { packs: AdminStickerPackResponse[] }) =>
      useStickerBuilderState({ packs, onPackChange: () => {} }),
    { initialProps: { packs: initialPacks }, wrapper: RouterWrapper },
  );
}

const TUNED_BLIP_STYLE = {
  ...BLIP_TEMPLATE.defaultStyle,
  bodyColor: "#3a86ff",
  hasDieCut: false,
};

describe("useStickerBuilderState", () => {
  it("moves an empty pack to Tea's default style and every Tea item", () => {
    const { result } = renderBuilderState([packFixture([])]);

    act(() => result.current.chooseTemplate("blip"));
    act(() => result.current.setStyle(TUNED_BLIP_STYLE));
    act(() => result.current.chooseTemplate("tea-slang"));

    expect(result.current.template.id).toBe("tea-slang");
    expect(result.current.style).toEqual(TEA_TEMPLATE.defaultStyle);
    expect(result.current.selectedItemIds).toEqual(
      templateItemIds(TEA_TEMPLATE),
    );
  });

  it("restores Blip's tuned style and selection after a visit to Tea", () => {
    const { result } = renderBuilderState([packFixture([])]);
    const blipItemIds = templateItemIds(BLIP_TEMPLATE);
    const tunedSelection = blipItemIds.slice(0, 2);

    act(() => result.current.chooseTemplate("blip"));
    act(() => result.current.setStyle(TUNED_BLIP_STYLE));
    act(() => result.current.setSelectedItemIds(tunedSelection));
    act(() => result.current.chooseTemplate("tea-slang"));
    act(() => result.current.chooseTemplate("blip"));

    expect(result.current.template.id).toBe("blip");
    expect(result.current.style).toEqual(TUNED_BLIP_STYLE);
    expect(result.current.selectedItemIds).toEqual(tunedSelection);
  });

  it("keeps a locked Blip pack on Blip once its last sticker is gone", () => {
    const { result, rerender } = renderBuilderState([
      packFixture([blipHiSticker()]),
    ]);
    expect(result.current.template.id).toBe("blip");
    expect(result.current.isTemplateLocked).toBe(true);

    rerender({ packs: [packFixture([])] });

    expect(result.current.template.id).toBe("blip");
    expect(result.current.isTemplateLocked).toBe(false);
  });

  it("ignores chooseTemplate while the pack is locked", () => {
    const { result } = renderBuilderState([packFixture([blipHiSticker()])]);

    act(() => result.current.chooseTemplate("tea-slang"));

    expect(result.current.template.id).toBe("blip");
    expect(result.current.selectedItemIds).toEqual(
      templateItemIds(BLIP_TEMPLATE),
    );
  });
});
