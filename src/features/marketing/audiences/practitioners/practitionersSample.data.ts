import type { TFunction } from "../../../../shared/i18n/types";
import type {
  SubprofileItemDTO,
  SubprofilePublicDTO,
} from "../../../subprofiles/api/subprofiles.api";
import { sampleIsoDate } from "../shared/sampleDates";
import type { PractitionerTryKind } from "./practitionersLanding.data";

/**
 * The four sample practitioners of the practitioners page. Every name,
 * handle and line is made up for the page; the photos are stock images the
 * demo fixtures already use. Prices are plain round figures, typed the way an
 * owner types them, and sit only inside each practitioner's own blocks. The
 * therapist carries no registration number and no credentials at all.
 */

const SAMPLE_CREATED_AT = "2026-01-12T10:00:00.000Z";

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?q=80&w=800&auto=format&fit=crop`;
}

const PHOTO_FOUNTAIN_PEN = unsplash("1455390582262-044cdead277a");
const PHOTO_PRESSED_VIOLETS = unsplash("1529251333259-d36cccaf22ea");
const PHOTO_BROKEN_CIRCLE = unsplash("1740508905511-bccff9d04f7d");
const PHOTO_LINE_SMOKE = unsplash("1685378338540-30a5d312282f");
const PHOTO_HEALED_SLEEVE = unsplash("1599351431202-1e0f0137899a");
const PHOTO_SAGE_CROP = unsplash("1611178204388-1deef70ec66a");
const PHOTO_SHORT_BACK = unsplash("1503951914875-452162b0f3f1");
const PHOTO_HANDS = unsplash("1582213782179-e0d53f98f2ca");
const PHOTO_PORTRAIT_MORNING = unsplash("1506863530036-1efeddceb993");
const PHOTO_PORTRAIT_SUNDAY = unsplash("1524504388940-b1c1722653e1");
const PHOTO_CONTACT_SHEETS = unsplash("1618410321132-9f4cebb2f7f5");
const PHOTO_DANCER_COVER = unsplash("1572224384995-f9529873f379");

/** A sample tattoo artist, therapist, hair stylist and photographer. */
const SAMPLE_PRACTITIONER_NAMES: Record<PractitionerTryKind, string> = {
  tattoo_artist: "Linha Lenta",
  therapist: "Joana Ferraz",
  hair_stylist: "Rafa Maré",
  photographer: "Luz Parada",
};

const SAMPLE_HANDLES: Record<PractitionerTryKind, string> = {
  tattoo_artist: "linha-lenta",
  therapist: "joana-ferraz",
  hair_stylist: "rafa-mare",
  photographer: "luz-parada",
};

function sampleItem(
  kind: PractitionerTryKind,
  itemId: string,
  section: SubprofileItemDTO["section"],
  title: string,
  rest: Partial<SubprofileItemDTO> = {},
): SubprofileItemDTO {
  return {
    id: `sample-${kind}-${itemId}`,
    section,
    title,
    createdAt: SAMPLE_CREATED_AT,
    tags: [],
    isFeatured: false,
    collaborators: [],
    ...rest,
  };
}

/** The fields every sample shares: published, open, standalone, with no
 *  followers, endorsements or links. */
function samplePersona(
  kind: PractitionerTryKind,
  fields: Partial<SubprofilePublicDTO>,
): SubprofilePublicDTO {
  return {
    id: `sample-practitioner-${kind}`,
    kind,
    slug: SAMPLE_HANDLES[kind],
    handle: SAMPLE_HANDLES[kind],
    displayName: SAMPLE_PRACTITIONER_NAMES[kind],
    avatarUrl: null,
    tagline: null,
    bio: null,
    coverUrl: null,
    accent: "plum",
    availability: null,
    ctaLabel: null,
    ctaUrl: null,
    socialLinks: [],
    linkVisibility: "unlinked",
    visibility: "open",
    status: "published",
    items: [],
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
    skinData: null,
    ...fields,
  };
}

function flashItem(
  t: TFunction,
  itemId: string,
  imageUrl: string | null,
  flash: {
    availability: "available" | "claimed" | "repeatable";
    size: string;
    price: string;
  },
): SubprofileItemDTO {
  return sampleItem(
    "tattoo_artist",
    itemId,
    "flash",
    t(`forPractitioners:sample.tattoo.flash.${itemId}`),
    {
      imageUrl,
      structured: {
        flash: {
          ...flash,
          placements: [t(`forPractitioners:sample.tattoo.placement.${itemId}`)],
        },
      },
    },
  );
}

function sampleTattooArtist(t: TFunction): SubprofilePublicDTO {
  return samplePersona("tattoo_artist", {
    avatarUrl: PHOTO_FOUNTAIN_PEN,
    tagline: t("forPractitioners:sample.tattoo.tagline"),
    bio: t("forPractitioners:sample.tattoo.bio"),
    accent: "plum",
    availability: "booking",
    skinData: {
      tattoo: { status: "open" },
      tattooBooking: {
        route: "message",
        whatToSend: ["idea", "placement", "size", "references"],
        consultation: "video",
        replyTime: t("forPractitioners:sample.tattoo.replyTime"),
      },
      tattooStyles: {
        styles: ["fine_line", "illustrative", "handpoke"],
        colour: "black_grey",
        minSize: "4 cm",
        doesNotDo: [t("forPractitioners:sample.tattoo.doesNotDo")],
      },
      tattooPrices: {
        minimum: "80",
        hourly: "100",
        deposit: {
          amount: "40",
          isRefundable: false,
          note: t("forPractitioners:sample.tattoo.depositNote"),
        },
        cancellation: t("forPractitioners:sample.tattoo.cancellation"),
      },
      tattooComfort: {
        options: [
          "chosen_name_pronouns",
          "breaks_any_time",
          "bring_someone",
          "private_room",
        ],
        note: t("forPractitioners:sample.tattoo.comfortNote"),
      },
      tattooStudio: {
        city: t("forPractitioners:sample.tattoo.city"),
        isPrivateStudio: true,
        isByAppointmentOnly: true,
      },
    },
    items: [
      flashItem(t, "violets", PHOTO_PRESSED_VIOLETS, {
        availability: "available",
        size: "8 cm",
        price: "120",
      }),
      flashItem(t, "circle", PHOTO_BROKEN_CIRCLE, {
        availability: "repeatable",
        size: "6 cm",
        price: "90",
      }),
      flashItem(t, "candle", PHOTO_LINE_SMOKE, {
        availability: "claimed",
        size: "10 cm",
        price: "150",
      }),
      sampleItem(
        "tattoo_artist",
        "healed-sleeve",
        "healed",
        t("forPractitioners:sample.tattoo.healed.sleeve"),
        {
          imageUrl: PHOTO_HEALED_SLEEVE,
          structured: {
            healed: {
              healedFor: t("forPractitioners:sample.tattoo.healedFor"),
              placement: t("forPractitioners:sample.tattoo.placement.sleeve"),
            },
            photo: { isBlurred: false },
          },
        },
      ),
    ],
  });
}

function specialism(
  t: TFunction,
  topicId: "identity" | "relationships" | "everyday",
): SubprofileItemDTO {
  return sampleItem(
    "therapist",
    `topic-${topicId}`,
    "specialisms",
    t(`forPractitioners:sample.therapist.topic.${topicId}.heading`),
    {
      description: t(
        `forPractitioners:sample.therapist.topic.${topicId}.bullets`,
      ),
    },
  );
}

function sampleTherapist(t: TFunction): SubprofilePublicDTO {
  return samplePersona("therapist", {
    tagline: t("forPractitioners:sample.therapist.tagline"),
    bio: t("forPractitioners:sample.therapist.bio"),
    accent: "jade",
    availability: "open_to_collabs",
    skinData: {
      therapist: {
        status: "open",
        waitNote: "",
        title: t("forPractitioners:sample.therapist.title"),
        registration: "",
        quote: t("forPractitioners:sample.therapist.quote"),
        languages: ["pt", "en"],
        where: t("forPractitioners:sample.therapist.where"),
        online: "yes",
        timezone: "",
        email: "",
        website: "",
        goodToKnow: "",
      },
      lived: ["queer", "migrant"],
      whoFor: ["adults", "couples"],
      contexts: ["nonMonogamy", "comingOut", "migration"],
      approach: [t("forPractitioners:sample.therapist.approach")],
      workingStyle: ["collaborative", "exploratory"],
      firstSession: (["hello", "listen", "decide"] as const).map((stepId) => ({
        title: t(`forPractitioners:sample.therapist.step.${stepId}.title`),
        body: t(`forPractitioners:sample.therapist.step.${stepId}.body`),
      })),
      therapyFees: {
        standard: "60",
        slidingMin: "",
        slidingMax: "",
        slidingPlaces: "",
        slidingOpen: "",
        slidingRules: "",
        firstContact: t("forPractitioners:sample.therapist.firstContact"),
        frequency: "",
        receipts: t("forPractitioners:sample.therapist.receipts"),
        receiptTime: "",
        payment: "",
        cancellation: "",
      },
      feeSchedule: [
        {
          label: t("forPractitioners:sample.therapist.sessionLength"),
          value: "60€",
        },
      ],
      availabilitySummary: {
        headline: t("forPractitioners:sample.therapist.headline"),
        waiting: "",
        waitMoves: "",
      },
      hours: [
        {
          label: t("forPractitioners:sample.therapist.hours.weekdays"),
          value: t("forPractitioners:sample.therapist.hours.weekdaysTime"),
        },
        {
          label: t("forPractitioners:sample.therapist.hours.saturday"),
          value: t("forPractitioners:sample.therapist.hours.saturdayTime"),
        },
      ],
      openSlots: [
        t("forPractitioners:sample.therapist.slot.tuesday"),
        t("forPractitioners:sample.therapist.slot.thursday"),
      ],
      venue: {
        name: "",
        lines: [t("forPractitioners:sample.therapist.venueArea")],
      },
      access: [
        t("forPractitioners:sample.therapist.access.stepFree"),
        t("forPractitioners:sample.therapist.access.toilet"),
      ],
    },
    items: [
      specialism(t, "identity"),
      specialism(t, "relationships"),
      specialism(t, "everyday"),
    ],
  });
}

function sampleHairStylist(t: TFunction): SubprofilePublicDTO {
  const service = (serviceId: "cut" | "colour" | "first") =>
    sampleItem(
      "hair_stylist",
      `service-${serviceId}`,
      "services",
      t(`forPractitioners:sample.chair.service.${serviceId}.title`),
      {
        subtitle: t(`forPractitioners:sample.chair.service.${serviceId}.time`),
        description: t(
          `forPractitioners:sample.chair.service.${serviceId}.body`,
        ),
      },
    );
  return samplePersona("hair_stylist", {
    tagline: t("forPractitioners:sample.chair.tagline"),
    bio: t("forPractitioners:sample.chair.bio"),
    accent: "amber",
    availability: "booking",
    skinData: {
      chair: {
        rate: t("forPractitioners:sample.chair.rate", { amount: "35€" }),
        walkins: t("forPractitioners:sample.chair.walkins"),
        where: t("forPractitioners:sample.chair.where"),
        quiet: t("forPractitioners:sample.chair.quiet"),
      },
      beforeYouSit: [
        t("forPractitioners:sample.chair.before.photo"),
        t("forPractitioners:sample.chair.before.name"),
        t("forPractitioners:sample.chair.before.hair"),
      ],
    },
    items: [
      service("cut"),
      service("colour"),
      service("first"),
      sampleItem(
        "hair_stylist",
        "look-sage",
        "looks",
        t("forPractitioners:sample.chair.look.sage"),
        { imageUrl: PHOTO_SAGE_CROP, date: "2026" },
      ),
      sampleItem(
        "hair_stylist",
        "look-short-back",
        "looks",
        t("forPractitioners:sample.chair.look.shortBack"),
        { imageUrl: PHOTO_SHORT_BACK, date: "2026" },
      ),
    ],
  });
}

function samplePhotographer(t: TFunction, today: Date): SubprofilePublicDTO {
  const series = (
    seriesId: "hands" | "morning" | "still" | "prints",
    imageUrl: string,
    isFeatured = false,
  ) =>
    sampleItem(
      "photographer",
      `series-${seriesId}`,
      "series",
      t(`forPractitioners:sample.studio.series.${seriesId}.title`),
      {
        imageUrl,
        isFeatured,
        description: t(
          `forPractitioners:sample.studio.series.${seriesId}.body`,
        ),
        date: "2026",
      },
    );
  return samplePersona("photographer", {
    coverUrl: PHOTO_DANCER_COVER,
    tagline: t("forPractitioners:sample.studio.tagline"),
    bio: t("forPractitioners:sample.studio.bio"),
    accent: "violet",
    availability: "open_to_collabs",
    items: [
      series("hands", PHOTO_HANDS, true),
      series("morning", PHOTO_PORTRAIT_MORNING),
      series("still", PHOTO_PORTRAIT_SUNDAY),
      series("prints", PHOTO_CONTACT_SHEETS),
      sampleItem(
        "photographer",
        "exhibition-group",
        "exhibitions",
        t("forPractitioners:sample.studio.exhibition.title"),
        {
          subtitle: t("forPractitioners:sample.studio.exhibition.subtitle"),
          date: sampleIsoDate(today, 30),
        },
      ),
    ],
  });
}

/**
 * The sample persona for one practice, built from the page's own copy, so a
 * visitor reading in Portuguese reads the sample in Portuguese too. `today`
 * keeps the photographer's show upcoming whenever the page is opened.
 */
export function buildSamplePractitioner(
  t: TFunction,
  kind: PractitionerTryKind,
  today: Date,
): SubprofilePublicDTO {
  switch (kind) {
    case "tattoo_artist":
      return sampleTattooArtist(t);
    case "therapist":
      return sampleTherapist(t);
    case "hair_stylist":
      return sampleHairStylist(t);
    case "photographer":
      return samplePhotographer(t, today);
  }
}
