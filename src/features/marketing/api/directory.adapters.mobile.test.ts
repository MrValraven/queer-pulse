import { describe, expect, it } from "vitest";
import type { Formatters } from "../../../shared/i18n/format";
import { listingDtoToPreviewPlace } from "../../admin/api/listingPreviewPlace";
import { listingDraftToPreviewSource } from "../listBusiness/editor/listingDraftPreviewSource";
import { blankDraft } from "../listBusiness/listingFormDraft";
import { emptyMobileDetails } from "../listBusiness/listingMobile.data";
import type { PendingListing } from "../listBusiness/listBusiness.data";
import type { DirectoryCardDTO, DirectoryDetailDTO } from "./directory.api";
import {
  cardDtoToPlace,
  detailDtoToPlace,
  submittedToPlace,
} from "./directory.adapters";

const details = {
  ...emptyMobileDetails(),
  allOfCity: false,
  parishes: ["Arroios"],
};

describe("cardDtoToPlace and detailDtoToPlace", () => {
  it("carries mobile and heals its block", () => {
    const card = {
      ...({} as DirectoryCardDTO),
      slug: "corte-movel",
      mobile: true,
      mobileDetails: details,
    };
    expect(cardDtoToPlace(card as DirectoryCardDTO)).toMatchObject({
      mobile: true,
      mobileDetails: details,
    });
  });

  it("blanks hood and address for an out-and-about card with no pin", () => {
    const card = {
      ...({} as DirectoryCardDTO),
      slug: "corte-movel",
      mobile: true,
      hood: "Arroios",
      latitude: null,
      longitude: null,
    };
    expect(cardDtoToPlace(card as DirectoryCardDTO).hood).toBe("");
  });

  it("reads an older card as a place with no block", () => {
    const place = cardDtoToPlace({ slug: "atelier-pulso" } as DirectoryCardDTO);
    expect(place.mobile).toBe(false);
    expect(place.mobileDetails).toBeNull();
  });

  it("keeps each upcoming gathering's role, reading none as venue", () => {
    const fmt = {
      date: () => "Sat 17 Oct",
      time: () => "10:00",
    } as unknown as Formatters;
    const detail = {
      slug: "lisboa-arco-iris-walks",
      upcoming: [
        {
          id: "1",
          slug: "queer-history-walk",
          startAt: "2026-10-17T10:00:00",
          title: "Walk",
          role: "runBy",
        },
        {
          id: "2",
          slug: "older",
          startAt: "2026-10-18T10:00:00",
          title: "Older",
        },
      ],
      reviews: [],
    } as unknown as DirectoryDetailDTO;
    const roles = detailDtoToPlace(detail, fmt).upcoming?.map(
      (event) => event.role,
    );
    expect(roles).toEqual(["runBy", "venue"]);
  });
});

describe("previews of a mobile draft show no location without a meeting point", () => {
  const draft: PendingListing = {
    ...blankDraft(),
    ref: "QPL-2026-0103",
    status: "review",
    slug: "muda-comigo",
    submittedBy: "kai",
    name: "Muda Comigo",
    mobile: true,
    mobileDetails: emptyMobileDetails(),
    address: "Rua Antiga 3",
    hood: "Beato",
    latitude: 38.73,
    longitude: -9.1,
  };

  it("in the live preview card", () => {
    expect(submittedToPlace(draft)).toMatchObject({
      mobile: true,
      address: "",
      hood: "",
      latitude: null,
      longitude: null,
    });
  });

  it("in the full page preview", () => {
    const place = listingDtoToPreviewPlace(
      listingDraftToPreviewSource(draft, "muda-comigo", {
        wide: "",
        d1: "",
        d2: "",
        vibe: "",
      }),
    );
    expect(place).toMatchObject({ mobile: true, address: "", latitude: null });
  });

  it("shows the meeting point once it is ticked", () => {
    expect(submittedToPlace({ ...draft, hasMeetingPoint: true })).toMatchObject(
      {
        address: "Rua Antiga 3",
        hood: "Beato",
        latitude: 38.73,
      },
    );
  });
});
