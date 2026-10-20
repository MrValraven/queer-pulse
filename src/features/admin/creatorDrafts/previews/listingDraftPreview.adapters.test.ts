import { describe, expect, it } from "vitest";
import { listingDraftPreviewToDraft } from "./listingDraftPreview.adapters";

describe("listing draft preview to draft", () => {
  it("reads every null image as an empty one and keeps the rest", () => {
    const draft = listingDraftPreviewToDraft({
      name: "Tasca da Graça",
      photos: { wide: "https://files.test/wide.jpg", d1: null },
      coverPhoto: { image: null, alt: "The counter" },
      shopItems: [
        {
          id: "s1",
          name: "Mug",
          price: "8",
          link: "",
          photo: { image: null, alt: "", caption: "" },
        },
      ],
    });
    expect(draft.photos).toEqual({
      wide: "https://files.test/wide.jpg",
      d1: "",
    });
    expect(draft.coverPhoto).toEqual({ image: "", alt: "The counter" });
    expect(draft.shopItems?.[0]?.photo).toBeNull();
    expect(draft.name).toBe("Tasca da Graça");
  });

  it("keeps a resolved shop photo with its alt and caption", () => {
    const draft = listingDraftPreviewToDraft({
      shopItems: [
        {
          id: "s2",
          name: "Tote bag",
          price: "12",
          link: "",
          photo: {
            image: "https://files.test/tote.jpg",
            alt: "A canvas tote",
            caption: "Printed in Porto",
          },
        },
      ],
    });
    expect(draft.shopItems?.[0]?.photo).toEqual({
      image: "https://files.test/tote.jpg",
      alt: "A canvas tote",
      caption: "Printed in Porto",
    });
  });

  it("leaves out a nested shape the server sent as null", () => {
    const draft = listingDraftPreviewToDraft({
      name: "Casa Lilás Café",
      photos: null,
      coverPhoto: null,
      shopItems: null,
      menu: null,
    });
    expect(draft).toEqual({ name: "Casa Lilás Café" });
  });
});
