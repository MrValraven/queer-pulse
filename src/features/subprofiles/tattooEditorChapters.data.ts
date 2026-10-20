import type {
  SkinBlockControl,
  SkinBlockDescriptor,
  SkinChapterDescriptor,
  SkinChapterGroup,
  SkinSelectOption,
} from "./skinBlockFields.data";
import type { SubprofileSection } from "./api/subprofiles.api";
import { TATTOO_STATUS_OPTIONS } from "./skins/tattoo/tattooBooksStatus";
import {
  TATTOO_BOOKING_ROUTES,
  TATTOO_COLOURS,
  TATTOO_COMFORT_OPTIONS,
  TATTOO_CONSULTATIONS,
  TATTOO_HYGIENE_PRACTICES,
  TATTOO_LIMITS,
  TATTOO_STYLES,
  TATTOO_WHAT_TO_SEND,
} from "./skins/tattoo/tattooVocab.data";

/**
 * The tattoo artist "Page blocks" editor, as eight chapters that follow the
 * public tattoo page from top to bottom. Each chapter is one screen of the
 * pane, picked by `?chapter=<key>`, and holds titled groups of purpose-built
 * controls.
 *
 * Every control writes a `SkinData` dot-path (`tattooPrices.deposit.amount`
 * is three levels deep). `TATTOO_BLOCKS` below is derived from these chapters
 * (one block per first path segment) and feeds the draft, the save graph and
 * the pending-changes list. The `sectionList` controls edit a section's full
 * list of items and derive no block.
 *
 * Option labels reuse the public page's own keys
 * (`subprofiles:tattoo.<vocab>.<value>`), so the owner and visitors read one
 * word for each choice.
 *
 * Only type imports from `skinBlockFields.data.ts`: that module imports the
 * runtime values here, and a runtime import back would form a cycle (the same
 * one `therapistEditorChapters.data.ts` describes).
 */

export type TattooChapterKey =
  | "booking"
  | "flash"
  | "healed"
  | "scarCoverUps"
  | "prices"
  | "care"
  | "outAndAbout"
  | "about";

const KEY_PREFIX = "subprofiles:skinBlock.tattoo";

const fieldKey = (block: string, field: string): string =>
  `${KEY_PREFIX}.${block}.${field}`;
const placeholderKey = (block: string, field: string): string =>
  fieldKey(block, `${field}Placeholder`);
const chapterKey = (
  chapter: TattooChapterKey,
  part: "title" | "lede",
): string => `${KEY_PREFIX}.chapter.${chapter}.${part}`;
const groupKey = (group: string): string => `${KEY_PREFIX}.group.${group}`;
const sectionTitleKey = (section: SubprofileSection): string =>
  `subprofiles:section.${section}`;

/** Choices labelled with the public page's keys, `tattoo.<vocab>.<value>`. */
function vocabularyOptions(
  vocabulary: string,
  values: readonly string[],
): SkinSelectOption[] {
  return values.map((value) => ({
    value,
    labelKey: `subprofiles:tattoo.${vocabulary}.${value}`,
  }));
}

/** A control at `<block>.<field>` (the path may go deeper, `field` is the
 *  rest of the path) with its label under `skinBlock.tattoo.<block>.*`. */
function tattooControl(
  block: string,
  field: string,
  extra: Partial<SkinBlockControl> = {},
): SkinBlockControl {
  return {
    path: `${block}.${field}`,
    kind: "text",
    labelKey: fieldKey(block, field),
    ...extra,
  };
}

/** A toggle for a contract boolean. */
const toggleControl = (
  block: string,
  field: string,
  extra: Partial<SkinBlockControl> = {},
): SkinBlockControl =>
  tattooControl(block, field, { kind: "toggle", ...extra });

/** A `money` control capped at six integer digits. */
const moneyControl = (
  block: string,
  field: string,
  extra: Partial<SkinBlockControl> = {},
): SkinBlockControl =>
  tattooControl(block, field, {
    kind: "money",
    maxIntegerDigits: 6,
    ...extra,
  });

/** A group holding one `sectionList` control for a persona section. */
function sectionGroup(
  section: SubprofileSection,
  extra: Partial<SkinBlockControl> = {},
  groupExtra: Partial<SkinChapterGroup> = {},
): SkinChapterGroup {
  return {
    titleKey: sectionTitleKey(section),
    ...groupExtra,
    controls: [
      {
        path: `section:${section}`,
        kind: "sectionList",
        section,
        labelKey: sectionTitleKey(section),
        ...extra,
      },
    ],
  };
}

const whenStatusIs = (values: string[]) => ({
  path: "tattoo.status",
  values,
});
const whenRouteIs = (values: string[]) => ({
  path: "tattooBooking.route",
  values,
});
const whenIsOn = (path: string) => ({ path, values: ["true"] });

const BOOKING_CHAPTER: SkinChapterDescriptor = {
  key: "booking",
  titleKey: chapterKey("booking", "title"),
  ledeKey: chapterKey("booking", "lede"),
  groups: [
    {
      titleKey: groupKey("booksStatus"),
      controls: [
        tattooControl("tattoo", "status", {
          kind: "segmented",
          // No `defaultValue`: the draft seeds the status from the stored
          // availability, so the editor opens on what the page already shows.
          options: TATTOO_STATUS_OPTIONS.map((option) => ({
            value: option.status,
            labelKey: option.labelKey,
            tone: option.tone,
          })),
        }),
        tattooControl("tattoo", "nextOpening", {
          kind: "date",
          showWhen: whenStatusIs(["waitlist", "closed"]),
        }),
        tattooControl("tattoo", "waitNote", {
          placeholderKey: placeholderKey("tattoo", "waitNote"),
          maxLength: TATTOO_LIMITS.waitNoteMax,
          showWhen: whenStatusIs(["waitlist"]),
        }),
      ],
    },
    {
      titleKey: groupKey("howToBook"),
      controls: [
        tattooControl("tattooBooking", "route", {
          kind: "choice",
          options: TATTOO_BOOKING_ROUTES.map((route) => ({
            value: route,
            labelKey: `subprofiles:tattoo.route.${route}`,
            ...(route === "message"
              ? { offeredWhen: "publishedPage" as const }
              : {}),
            ...(route === "instagram"
              ? { offeredWhen: "instagramLink" as const }
              : {}),
          })),
        }),
        tattooControl("tattooBooking", "email", {
          validate: "email",
          maxLength: TATTOO_LIMITS.emailMax,
          showWhen: whenRouteIs(["email"]),
        }),
        tattooControl("tattooBooking", "formUrl", {
          validate: "httpsUrl",
          maxLength: TATTOO_LIMITS.formUrlMax,
          showWhen: whenRouteIs(["form_link"]),
        }),
        tattooControl("tattooBooking", "whatToSend", {
          kind: "multiChoice",
          options: vocabularyOptions("whatToSend", TATTOO_WHAT_TO_SEND),
        }),
        tattooControl("tattooBooking", "consultation", {
          kind: "choice",
          options: vocabularyOptions("consultation", TATTOO_CONSULTATIONS),
        }),
        tattooControl("tattooBooking", "replyTime", {
          placeholderKey: placeholderKey("tattooBooking", "replyTime"),
          maxLength: TATTOO_LIMITS.replyTimeMax,
        }),
      ],
    },
    {
      titleKey: groupKey("styles"),
      controls: [
        tattooControl("tattooStyles", "styles", {
          kind: "multiSelect",
          options: vocabularyOptions("style", TATTOO_STYLES),
          featuredValues: [
            "fine_line",
            "blackwork",
            "neo_traditional",
            "american_traditional",
            "japanese",
            "realism",
            "handpoke",
          ],
          allowsCustom: true,
          customPlaceholderKey: fieldKey("tattooStyles", "customPlaceholder"),
        }),
        tattooControl("tattooStyles", "colour", {
          kind: "choice",
          options: vocabularyOptions("colour", TATTOO_COLOURS),
        }),
        tattooControl("tattooStyles", "minSize", {
          placeholderKey: placeholderKey("tattooStyles", "minSize"),
          maxLength: TATTOO_LIMITS.minSizeMax,
          size: "narrow",
        }),
        tattooControl("tattooStyles", "doesNotDo", {
          kind: "lines",
          placeholderKey: placeholderKey("tattooStyles", "doesNotDo"),
          maxItems: TATTOO_LIMITS.doesNotDoMax,
          maxLength: TATTOO_LIMITS.doesNotDoLineMax,
          isWrapping: true,
        }),
      ],
    },
    {
      titleKey: groupKey("whereITattoo"),
      controls: [
        tattooControl("venue", "name"),
        tattooControl("venue", "lines", { kind: "lines" }),
        tattooControl("tattooStudio", "city", {
          placeholderKey: placeholderKey("tattooStudio", "city"),
          maxLength: TATTOO_LIMITS.cityMax,
        }),
        toggleControl("tattooStudio", "isPrivateStudio"),
        toggleControl("tattooStudio", "isByAppointmentOnly"),
      ],
    },
  ],
};

const FLASH_CHAPTER: SkinChapterDescriptor = {
  key: "flash",
  titleKey: chapterKey("flash", "title"),
  ledeKey: chapterKey("flash", "lede"),
  groups: [sectionGroup("flash"), sectionGroup("wanna_dos")],
};

const HEALED_CHAPTER: SkinChapterDescriptor = {
  key: "healed",
  titleKey: chapterKey("healed", "title"),
  ledeKey: chapterKey("healed", "lede"),
  groups: [sectionGroup("healed"), sectionGroup("in_progress")],
};

const SCAR_COVER_UPS_CHAPTER: SkinChapterDescriptor = {
  key: "scarCoverUps",
  titleKey: chapterKey("scarCoverUps", "title"),
  ledeKey: chapterKey("scarCoverUps", "lede"),
  groups: [
    {
      titleKey: groupKey("scarIntro"),
      controls: [
        tattooControl("tattooScarWork", "intro", {
          kind: "textarea",
          maxLength: TATTOO_LIMITS.scarIntroMax,
        }),
        toggleControl("tattooScarWork", "hasFreeConsult"),
        toggleControl("tattooScarWork", "hasReducedPrice"),
        tattooControl("tattooScarWork", "reducedPriceNote", {
          maxLength: TATTOO_LIMITS.reducedPriceNoteMax,
          showWhen: whenIsOn("tattooScarWork.hasReducedPrice"),
        }),
      ],
    },
    sectionGroup("scar_work"),
    sectionGroup("cover_ups"),
  ],
};

const TOUCH_UP_MONTHS = ["1", "2", "3", "6", "12"];

const PRICES_CHAPTER: SkinChapterDescriptor = {
  key: "prices",
  titleKey: chapterKey("prices", "title"),
  ledeKey: chapterKey("prices", "lede"),
  groups: [
    {
      titleKey: groupKey("rates"),
      layout: "row",
      controls: [
        moneyControl("tattooPrices", "minimum"),
        moneyControl("tattooPrices", "hourly"),
        moneyControl("tattooPrices", "dayRate"),
      ],
    },
    {
      titleKey: groupKey("deposit"),
      controls: [
        moneyControl("tattooPrices", "deposit.amount"),
        toggleControl("tattooPrices", "deposit.isRefundable"),
        tattooControl("tattooPrices", "deposit.note", {
          maxLength: TATTOO_LIMITS.depositNoteMax,
        }),
      ],
    },
    {
      titleKey: groupKey("cancellation"),
      controls: [
        tattooControl("tattooPrices", "cancellation", {
          kind: "textarea",
          maxLength: TATTOO_LIMITS.cancellationMax,
        }),
      ],
    },
    {
      titleKey: groupKey("touchUps"),
      controls: [
        toggleControl("tattooPrices", "touchUps.isFree"),
        tattooControl("tattooPrices", "touchUps.months", {
          kind: "choice",
          options: TOUCH_UP_MONTHS.map((months) => ({
            value: months,
            labelKey: fieldKey("tattooPrices", `touchUpMonths_${months}`),
          })),
          showWhen: whenIsOn("tattooPrices.touchUps.isFree"),
        }),
      ],
    },
  ],
};

const CARE_CHAPTER: SkinChapterDescriptor = {
  key: "care",
  titleKey: chapterKey("care", "title"),
  ledeKey: chapterKey("care", "lede"),
  groups: [
    {
      titleKey: groupKey("comfort"),
      controls: [
        tattooControl("tattooComfort", "options", {
          kind: "multiChoice",
          options: vocabularyOptions("comfort", TATTOO_COMFORT_OPTIONS),
        }),
        tattooControl("tattooComfort", "note", {
          kind: "textarea",
          maxLength: TATTOO_LIMITS.comfortNoteMax,
        }),
      ],
    },
    {
      titleKey: groupKey("hygiene"),
      controls: [
        tattooControl("tattooHygiene", "practices", {
          kind: "multiChoice",
          options: vocabularyOptions("hygiene", TATTOO_HYGIENE_PRACTICES),
        }),
        {
          path: "section:credentials",
          kind: "sectionList",
          section: "credentials",
          labelKey: sectionTitleKey("credentials"),
          isFeatureHidden: true,
        },
      ],
    },
    sectionGroup("aftercare", { isFeatureHidden: true }),
  ],
};

const OUT_AND_ABOUT_CHAPTER: SkinChapterDescriptor = {
  key: "outAndAbout",
  titleKey: chapterKey("outAndAbout", "title"),
  ledeKey: chapterKey("outAndAbout", "lede"),
  groups: [
    sectionGroup("guest_spots", { isFeatureHidden: true }),
    sectionGroup("flash_days"),
    sectionGroup("shop"),
  ],
};

const ABOUT_CHAPTER: SkinChapterDescriptor = {
  key: "about",
  titleKey: chapterKey("about", "title"),
  ledeKey: chapterKey("about", "lede"),
  groups: [
    {
      titleKey: groupKey("lineage"),
      controls: [
        tattooControl("tattooLineage", "trainedWith", {
          placeholderKey: placeholderKey("tattooLineage", "trainedWith"),
          maxLength: TATTOO_LIMITS.trainedWithMax,
        }),
        tattooControl("tattooLineage", "tattooingSince", {
          placeholderKey: placeholderKey("tattooLineage", "tattooingSince"),
          validate: "year",
          size: "narrow",
        }),
        toggleControl("tattooLineage", "isTakingApprentices"),
        tattooControl("tattooLineage", "apprenticeNote", {
          kind: "textarea",
          maxLength: TATTOO_LIMITS.apprenticeNoteMax,
          showWhen: whenIsOn("tattooLineage.isTakingApprentices"),
        }),
        tattooControl("tattooLineage", "teaches", {
          kind: "lines",
          placeholderKey: placeholderKey("tattooLineage", "teaches"),
          maxItems: TATTOO_LIMITS.teachesMax,
          maxLength: TATTOO_LIMITS.teachesLineMax,
        }),
      ],
    },
    {
      titleKey: groupKey("faq"),
      controls: [
        {
          path: "faq",
          kind: "entries",
          labelKey: groupKey("faq"),
          addLabelKey: fieldKey("faq", "add"),
          maxItems: TATTOO_LIMITS.faqMax,
          itemFields: [
            {
              key: "question",
              labelKey: fieldKey("faq", "question"),
              placeholderKey: placeholderKey("faq", "question"),
              maxLength: TATTOO_LIMITS.faqQuestionMax,
            },
            {
              key: "answer",
              labelKey: fieldKey("faq", "answer"),
              multiline: true,
              maxLength: TATTOO_LIMITS.faqAnswerMax,
            },
          ],
        },
      ],
    },
    sectionGroup(
      "gallery",
      {},
      {
        titleKey: groupKey("gallery"),
        helperKey: groupKey("galleryHelper"),
      },
    ),
  ],
};

/** The tattoo editor's chapters, in the order of the public page. */
export const TATTOO_CHAPTERS: SkinChapterDescriptor[] = [
  BOOKING_CHAPTER,
  FLASH_CHAPTER,
  HEALED_CHAPTER,
  SCAR_COVER_UPS_CHAPTER,
  PRICES_CHAPTER,
  CARE_CHAPTER,
  OUT_AND_ABOUT_CHAPTER,
  ABOUT_CHAPTER,
];

/** One block per first path segment, in first-appearance order across the
 *  chapters, each holding that block's controls. Feeds the draft, the save
 *  graph and the pending-changes list. A `sectionList` control saves with its
 *  section's rows, so it is left out. */
export function tattooBlocksFromChapters(
  chapters: SkinChapterDescriptor[] = TATTOO_CHAPTERS,
): SkinBlockDescriptor[] {
  const blocksByKey = new Map<string, SkinBlockDescriptor>();
  for (const chapter of chapters) {
    for (const group of chapter.groups) {
      for (const control of group.controls) {
        if (control.kind === "sectionItems" || control.kind === "sectionList") {
          continue;
        }
        const blockKey = control.path.split(".")[0]!;
        const block = blocksByKey.get(blockKey) ?? {
          blockKey,
          titleKey: fieldKey(blockKey, "title"),
          controls: [],
        };
        block.controls.push(control);
        blocksByKey.set(blockKey, block);
      }
    }
  }
  return [...blocksByKey.values()];
}

/** The tattoo block table, derived from `TATTOO_CHAPTERS`. */
export const TATTOO_BLOCKS: SkinBlockDescriptor[] = tattooBlocksFromChapters();
