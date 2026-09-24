import type {
  SkinBlockControl,
  SkinBlockDescriptor,
  SkinChapterDescriptor,
  SkinItemFieldDescriptor,
  SkinOptionTone,
  SkinSelectOption,
} from "./skinBlockFields.data";
import {
  FEE_CHOICE_VALUES,
  feeChoiceLabelKey,
  type FeeChoiceField,
} from "./skins/therapist/therapistFeeOptions";
import {
  CONTEXT_OPTIONS,
  LANGUAGE_OPTIONS,
  LIVED_OPTIONS,
  MODALITY_OPTIONS,
  WHO_FOR_OPTIONS,
  WORKING_STYLE_OPTIONS,
} from "./skins/therapist/therapistPickOptions";

/**
 * The therapist "Page blocks" editor, as six chapters that follow the public
 * therapist page from top to bottom. Each chapter is one screen of the pane,
 * picked by `?chapter=<key>`, and holds titled groups of purpose-built controls.
 *
 * Every control writes the same `SkinData` dot-path the flat therapist table
 * always wrote, so stored data keeps its place. One shape change: the
 * `multiSelect` for `therapist.languages` reads the older comma string and
 * writes a `string[]` on the first edit. `THERAPIST_BLOCKS` below is derived
 * from these chapters (one block per first path segment) and keeps feeding the
 * draft, the save graph and the pending-changes list. The `sectionItems`
 * control edits the `specialisms` section's rows and derives no block.
 *
 * Only type imports from `skinBlockFields.data.ts`: that module imports the
 * runtime values here, and a runtime import back would form a cycle. The pick
 * options module type-imports it too, so importing its lists here is safe.
 */

const KEY_PREFIX = "subprofiles:skinBlock";

const therapistKey = (block: string, field: string): string =>
  `${KEY_PREFIX}.therapist.${block}.${field}`;
const therapistPlaceholder = (block: string, field: string): string =>
  therapistKey(block, `${field}Placeholder`);
const practiceKey = (block: string, field: string): string =>
  `${KEY_PREFIX}.practice.${block}.${field}`;
const chapterKey = (chapter: string, field: "title" | "lede"): string =>
  `${KEY_PREFIX}.therapist.chapter.${chapter}.${field}`;
const groupKey = (group: string): string =>
  `${KEY_PREFIX}.therapist.group.${group}`;
const joinerKey = (joiner: string): string =>
  `${KEY_PREFIX}.therapist.joiner.${joiner}`;
const checkKey = (check: string): string =>
  `${KEY_PREFIX}.therapist.check.${check}`;

/** Blocks whose heading reuses the practice family's key and copy. */
const PRACTICE_TITLED_BLOCKS = new Set([
  "approach",
  "firstSession",
  "referrals",
  "venue",
]);

/** The heading key of a therapist block, as the pending-changes list shows it. */
function blockTitleKey(blockKey: string): string {
  return PRACTICE_TITLED_BLOCKS.has(blockKey)
    ? practiceKey(blockKey, "title")
    : therapistKey(blockKey, "title");
}

/** Choices keyed `skinBlock.therapist.<block>.<field>_<value>`. An empty value
 *  gets the `unsaid` suffix. */
function therapistOptions(
  block: string,
  field: string,
  values: string[],
  tones: Partial<Record<string, SkinOptionTone>> = {},
): SkinSelectOption[] {
  return values.map((value) => ({
    value,
    labelKey: therapistKey(block, `${field}_${value || "unsaid"}`),
    ...(tones[value] ? { tone: tones[value] } : {}),
  }));
}

/** A `therapist.<field>` control, a single-line text input unless `extra`
 *  says otherwise. */
function therapistFactControl(
  field: string,
  extra: Partial<SkinBlockControl> = {},
): SkinBlockControl {
  return {
    path: `therapist.${field}`,
    kind: "text",
    labelKey: therapistKey("therapist", field),
    ...extra,
  };
}

/** A sub-field of a therapist object block with its label and example
 *  placeholder under `skinBlock.therapist.<block>.*`. */
function therapistFieldControl(
  blockKey: string,
  field: string,
  extra: Partial<SkinBlockControl> = {},
): SkinBlockControl {
  return {
    path: `${blockKey}.${field}`,
    kind: "text",
    labelKey: therapistKey(blockKey, field),
    placeholderKey: therapistPlaceholder(blockKey, field),
    ...extra,
  };
}

/** A fee field's fixed choices, labelled with the keys the public page uses
 *  (`therapyFees.<field>_<value>`). */
function feeChoiceOptions(field: FeeChoiceField): SkinSelectOption[] {
  return FEE_CHOICE_VALUES[field].map((value) => ({
    value,
    labelKey: feeChoiceLabelKey(field, value),
  }));
}

/** A `therapyFees.<field>` control offered as chips over its fixed choices:
 *  `choice` stores one value, `multiChoice` a list. Chips show no
 *  placeholder, so none is set. */
function feeChoiceControl(
  field: FeeChoiceField,
  kind: "choice" | "multiChoice",
  extra: Partial<SkinBlockControl> = {},
): SkinBlockControl {
  return {
    path: `therapyFees.${field}`,
    kind,
    labelKey: therapistKey("therapyFees", field),
    options: feeChoiceOptions(field),
    ...extra,
  };
}

/** A whole-block `string[]` edited as chips, labelled by the block heading. */
function chipsControl(
  blockKey: string,
  extra: Partial<SkinBlockControl> = {},
): SkinBlockControl {
  return {
    path: blockKey,
    kind: "chips",
    labelKey: therapistKey(blockKey, "title"),
    placeholderKey: therapistKey(blockKey, "placeholder"),
    ...extra,
  };
}

/** A whole-block `string[]` picked from fixed `options`, with room for the
 *  therapist's own words. Picks are stored by option id; anything typed is
 *  stored as written. */
function pickControl(
  blockKey: string,
  options: SkinSelectOption[],
): SkinBlockControl {
  return {
    path: blockKey,
    kind: "multiSelect",
    labelKey: therapistKey(blockKey, "title"),
    placeholderKey: therapistKey(blockKey, "placeholder"),
    options,
    allowsCustom: true,
    customPlaceholderKey: therapistKey(blockKey, "customPlaceholder"),
  };
}

/** A label/value item field pair under `skinBlock.therapist.<block>.*`. */
function therapistPairFields(
  blockKey: string,
  valueExtra: Partial<SkinItemFieldDescriptor> = {},
): SkinItemFieldDescriptor[] {
  return [
    {
      key: "label",
      labelKey: therapistKey(blockKey, "label"),
      placeholderKey: therapistPlaceholder(blockKey, "label"),
    },
    {
      key: "value",
      labelKey: therapistKey(blockKey, "value"),
      placeholderKey: therapistPlaceholder(blockKey, "value"),
      ...valueExtra,
    },
  ];
}

const showWhileWaitlisted = { path: "therapist.status", values: ["wait"] };

const BASICS_CHAPTER: SkinChapterDescriptor = {
  key: "basics",
  titleKey: chapterKey("basics", "title"),
  ledeKey: chapterKey("basics", "lede"),
  groups: [
    {
      titleKey: therapistKey("therapist", "status"),
      controls: [
        therapistFactControl("status", {
          kind: "segmented",
          options: therapistOptions(
            "therapist",
            "status",
            ["open", "wait", "closed"],
            { open: "jade", wait: "amber", closed: "muted" },
          ),
          defaultValue: "open",
        }),
        therapistFactControl("waitNote", {
          placeholderKey: therapistPlaceholder("therapist", "waitNote"),
          helperKey: therapistKey("therapist", "waitNoteHelper"),
          showWhen: showWhileWaitlisted,
        }),
      ],
    },
    {
      titleKey: groupKey("introduce"),
      controls: [
        // Field key is literally "title"; a distinct label suffix keeps it
        // apart from the block's own ".title" heading key.
        therapistFactControl("title", {
          labelKey: therapistKey("therapist", "jobTitle"),
          placeholderKey: therapistPlaceholder("therapist", "jobTitle"),
          isWrapping: true,
        }),
        therapistFactControl("registration", {
          placeholderKey: therapistPlaceholder("therapist", "registration"),
          size: "narrow",
        }),
        therapistFactControl("quote", {
          kind: "textarea",
          helperKey: therapistKey("therapist", "quoteHelper"),
          placeholderKey: therapistPlaceholder("therapist", "quote"),
          hasEmphasisPreview: true,
        }),
        {
          path: "lived",
          kind: "multiSelect",
          labelKey: therapistKey("lived", "title"),
          placeholderKey: therapistKey("lived", "placeholder"),
          helperKey: therapistKey("lived", "helper"),
          helperTone: "private",
          options: LIVED_OPTIONS,
          featuredValues: [
            "trans",
            "nonBinary",
            "lesbian",
            "gay",
            "bisexual",
            "queer",
            "neurodivergent",
            "migrant",
          ],
          allowsCustom: true,
          customPlaceholderKey: therapistKey("lived", "customPlaceholder"),
        },
        therapistFactControl("languages", {
          kind: "multiSelect",
          placeholderKey: therapistPlaceholder("therapist", "languages"),
          options: LANGUAGE_OPTIONS,
          featuredValues: ["pt", "en", "es", "fr", "lgp"],
          allowsCustom: true,
          customPlaceholderKey: therapistKey(
            "therapist",
            "languagesCustomPlaceholder",
          ),
        }),
      ],
    },
  ],
};

const APPROACH_CHAPTER: SkinChapterDescriptor = {
  key: "approach",
  titleKey: chapterKey("approach", "title"),
  ledeKey: chapterKey("approach", "lede"),
  groups: [
    {
      titleKey: groupKey("approach"),
      controls: [
        {
          path: "approach",
          kind: "paragraphs",
          labelKey: groupKey("approach"),
          addLabelKey: therapistKey("approach", "add"),
        },
      ],
    },
    {
      titleKey: groupKey("methods"),
      controls: [
        pickControl("modalities", MODALITY_OPTIONS),
        pickControl("workingStyle", WORKING_STYLE_OPTIONS),
      ],
    },
    {
      titleKey: groupKey("helpsWith"),
      helperKey: groupKey("helpsWithHelper"),
      controls: [
        {
          path: "section:specialisms",
          kind: "sectionItems",
          section: "specialisms",
          labelKey: groupKey("helpsWith"),
        },
      ],
    },
    {
      titleKey: groupKey("whoFor"),
      controls: [
        pickControl("whoFor", WHO_FOR_OPTIONS),
        pickControl("contexts", CONTEXT_OPTIONS),
      ],
    },
    {
      titleKey: groupKey("expectations"),
      controls: [
        chipsControl("notFor"),
        chipsControl("boundaries", {
          labelKey: therapistKey("boundaries", "label"),
        }),
      ],
    },
  ],
};

const FEES_CHAPTER: SkinChapterDescriptor = {
  key: "fees",
  titleKey: chapterKey("fees", "title"),
  ledeKey: chapterKey("fees", "lede"),
  groups: [
    {
      titleKey: groupKey("fee"),
      controls: [
        therapistFieldControl("therapyFees", "standard", {
          kind: "money",
          labelKey: therapistKey("therapyFees", "standardPerSession"),
          helperKey: therapistKey("therapyFees", "standardHelper"),
        }),
      ],
    },
    {
      titleKey: groupKey("sliding"),
      layout: "row",
      joinerKey: joinerKey("to"),
      check: "ascending",
      checkMessageKey: checkKey("ascending"),
      controls: [
        therapistFieldControl("therapyFees", "slidingMin", {
          kind: "money",
          labelKey: therapistKey("therapyFees", "slidingLowest"),
        }),
        therapistFieldControl("therapyFees", "slidingMax", {
          kind: "money",
          labelKey: therapistKey("therapyFees", "slidingHighest"),
        }),
      ],
    },
    {
      helperKey: therapistKey("therapyFees", "placesHelperBoth"),
      layout: "row",
      joinerKey: joinerKey("of"),
      check: "partOfWhole",
      checkMessageKey: checkKey("partOfWhole"),
      controls: [
        therapistFieldControl("therapyFees", "slidingOpen", {
          kind: "count",
          labelKey: therapistKey("therapyFees", "placesOpen"),
        }),
        therapistFieldControl("therapyFees", "slidingPlaces", {
          kind: "count",
          labelKey: therapistKey("therapyFees", "placesTotal"),
        }),
      ],
    },
    {
      controls: [
        therapistFieldControl("therapyFees", "slidingRules", {
          kind: "textarea",
        }),
      ],
    },
    {
      titleKey: therapistKey("feeSchedule", "title"),
      controls: [
        {
          path: "feeSchedule",
          kind: "pairs",
          labelKey: therapistKey("feeSchedule", "title"),
          addLabelKey: therapistKey("feeSchedule", "add"),
          itemFields: [
            {
              key: "label",
              labelKey: therapistKey("feeSchedule", "label"),
              placeholderKey: therapistPlaceholder("feeSchedule", "label"),
            },
            {
              key: "value",
              labelKey: therapistKey("feeSchedule", "value"),
              placeholderKey: therapistPlaceholder("feeSchedule", "value"),
            },
          ],
        },
      ],
    },
    {
      titleKey: groupKey("insurance"),
      controls: [
        {
          path: "reimbursement",
          kind: "pairs",
          labelKey: groupKey("insurance"),
          helperKey: therapistKey("reimbursement", "helper"),
          addLabelKey: therapistKey("reimbursement", "add"),
          itemFields: therapistPairFields("reimbursement", {
            labelKey: therapistKey("reimbursement", "valueBack"),
            isMoney: true,
          }),
        },
        therapistFieldControl("therapyFees", "receipts", {
          labelKey: therapistKey("therapyFees", "insuranceNote"),
          helperKey: therapistKey("therapyFees", "insuranceNoteHelper"),
          isWrapping: true,
        }),
        feeChoiceControl("receiptTime", "choice"),
      ],
    },
    {
      titleKey: groupKey("policies"),
      controls: [
        therapistFieldControl("therapyFees", "firstContact", {
          helperKey: therapistKey("therapyFees", "firstContactHelper"),
          isWrapping: true,
        }),
        feeChoiceControl("frequency", "choice"),
        // The older free-text answer shows under the chips until one is
        // ticked, and the first tick clears it.
        feeChoiceControl("paymentMethods", "multiChoice", {
          legacyTextPath: "therapyFees.payment",
          helperKey: therapistKey("therapyFees", "paymentMethodsHelper"),
        }),
        feeChoiceControl("cancellationNotice", "choice"),
        therapistFieldControl("therapyFees", "cancellation", {
          kind: "textarea",
        }),
      ],
    },
  ],
};

const AVAILABILITY_CHAPTER: SkinChapterDescriptor = {
  key: "availability",
  titleKey: chapterKey("availability", "title"),
  ledeKey: chapterKey("availability", "lede"),
  groups: [
    {
      titleKey: groupKey("rightNow"),
      controls: [
        therapistFieldControl("availabilitySummary", "headline", {
          isWrapping: true,
        }),
        therapistFieldControl("availabilitySummary", "waiting", {
          kind: "count",
          showWhen: showWhileWaitlisted,
        }),
        therapistFieldControl("availabilitySummary", "waitMoves", {
          showWhen: showWhileWaitlisted,
          isWrapping: true,
        }),
      ],
    },
    {
      titleKey: therapistKey("hours", "title"),
      controls: [
        {
          path: "hours",
          kind: "pairs",
          labelKey: therapistKey("hours", "title"),
          addLabelKey: therapistKey("hours", "add"),
          itemFields: therapistPairFields("hours", {
            labelKey: therapistKey("hours", "valueTimes"),
          }),
        },
      ],
    },
    {
      titleKey: therapistKey("openSlots", "title"),
      controls: [
        chipsControl("openSlots", {
          helperKey: therapistKey("openSlots", "chipHelper"),
        }),
      ],
    },
    {
      titleKey: groupKey("firstSession"),
      controls: [
        {
          path: "firstSession",
          kind: "entries",
          labelKey: groupKey("firstSession"),
          addLabelKey: therapistKey("firstSession", "add"),
          itemFields: [
            {
              key: "title",
              labelKey: practiceKey("firstSession", "stepTitle"),
            },
            {
              key: "body",
              labelKey: practiceKey("firstSession", "body"),
              multiline: true,
            },
          ],
        },
      ],
    },
  ],
};

const WHERE_CHAPTER: SkinChapterDescriptor = {
  key: "where",
  titleKey: chapterKey("where", "title"),
  ledeKey: chapterKey("where", "lede"),
  groups: [
    {
      titleKey: groupKey("whereYouWork"),
      controls: [
        therapistFactControl("where", {
          labelKey: therapistKey("therapist", "whereArea"),
          placeholderKey: therapistPlaceholder("therapist", "whereArea"),
          isWrapping: true,
        }),
        therapistFactControl("online", {
          kind: "segmented",
          options: therapistOptions("therapist", "online", ["yes", "no", ""]),
          defaultValue: "",
        }),
        therapistFactControl("timezone", {
          placeholderKey: therapistPlaceholder("therapist", "timezone"),
          helperKey: therapistKey("therapist", "timezoneHelper"),
          // The page shows the time zone only for online-only practice.
          showWhen: [
            { path: "therapist.online", values: ["yes"] },
            { path: "venue.name", values: [""] },
          ],
        }),
      ],
    },
    {
      titleKey: groupKey("room"),
      controls: [
        {
          path: "venue.name",
          kind: "text",
          labelKey: therapistKey("venue", "name"),
          placeholderKey: therapistPlaceholder("venue", "name"),
          // Read by the time zone's `showWhen`: unset counts as blank.
          defaultValue: "",
        },
        {
          path: "venue.lines",
          kind: "lines",
          labelKey: practiceKey("venue", "lines"),
          placeholderKey: therapistPlaceholder("venue", "lines"),
          addLabelKey: therapistKey("venue", "addLine"),
        },
      ],
    },
    {
      titleKey: therapistKey("travel", "title"),
      controls: [
        ...["metro", "bus", "bike"].map((field) =>
          therapistFieldControl("travel", field, { isWrapping: true }),
        ),
        therapistFieldControl("travel", "entrance", {
          labelKey: therapistKey("travel", "entranceLabel"),
          isWrapping: true,
        }),
      ],
    },
    {
      titleKey: groupKey("accessibility"),
      controls: [chipsControl("access"), chipsControl("accessMissing")],
    },
  ],
};

const CONTACT_CHAPTER: SkinChapterDescriptor = {
  key: "contact",
  titleKey: chapterKey("contact", "title"),
  ledeKey: chapterKey("contact", "lede"),
  groups: [
    {
      titleKey: groupKey("contact"),
      controls: [
        therapistFactControl("email", { validate: "email" }),
        therapistFactControl("website", { validate: "url" }),
        therapistFactControl("goodToKnow", {
          kind: "textarea",
          helperKey: therapistKey("therapist", "goodToKnowHelper"),
        }),
      ],
    },
    {
      titleKey: therapistKey("faq", "title"),
      controls: [
        {
          path: "faq",
          kind: "entries",
          labelKey: therapistKey("faq", "title"),
          addLabelKey: therapistKey("faq", "add"),
          itemFields: [
            {
              key: "question",
              labelKey: therapistKey("faq", "question"),
              placeholderKey: therapistPlaceholder("faq", "question"),
            },
            {
              key: "answer",
              labelKey: therapistKey("faq", "answer"),
              multiline: true,
            },
          ],
        },
      ],
    },
    {
      titleKey: groupKey("referrals"),
      controls: [
        {
          path: "referrals",
          kind: "entries",
          labelKey: groupKey("referrals"),
          addLabelKey: therapistKey("referrals", "add"),
          itemFields: [
            {
              key: "name",
              labelKey: practiceKey("referrals", "name"),
              placeholderKey: therapistPlaceholder("referrals", "name"),
            },
            {
              key: "note",
              labelKey: practiceKey("referrals", "note"),
              multiline: true,
            },
          ],
        },
      ],
    },
    {
      titleKey: therapistKey("worksAlongside", "title"),
      controls: [
        {
          path: "worksAlongside",
          kind: "entries",
          labelKey: therapistKey("worksAlongside", "title"),
          addLabelKey: therapistKey("worksAlongside", "add"),
          itemFields: [
            { key: "name", labelKey: therapistKey("worksAlongside", "name") },
            {
              key: "kind",
              labelKey: therapistKey("worksAlongside", "kind"),
              placeholderKey: therapistPlaceholder("worksAlongside", "kind"),
              options: therapistOptions("worksAlongside", "kind", [
                "psychiatrist",
                "group",
                "community",
                "clinic",
                "therapist",
              ]),
            },
            {
              key: "note",
              labelKey: therapistKey("worksAlongside", "note"),
              multiline: true,
            },
          ],
        },
      ],
    },
  ],
};

/** The therapist editor's chapters, in the order of the public page. */
export const THERAPIST_CHAPTERS: SkinChapterDescriptor[] = [
  BASICS_CHAPTER,
  APPROACH_CHAPTER,
  FEES_CHAPTER,
  AVAILABILITY_CHAPTER,
  WHERE_CHAPTER,
  CONTACT_CHAPTER,
];

/** One block per first path segment, in first-appearance order across the
 *  chapters, each holding that block's controls. Feeds the draft, the save
 *  graph and the pending-changes list. A `sectionItems` control saves with its
 *  section's rows, so it is left out. */
export function therapistBlocksFromChapters(
  chapters: SkinChapterDescriptor[] = THERAPIST_CHAPTERS,
): SkinBlockDescriptor[] {
  const blocksByKey = new Map<string, SkinBlockDescriptor>();
  for (const chapter of chapters) {
    for (const group of chapter.groups) {
      for (const control of group.controls) {
        if (control.kind === "sectionItems") continue;
        const blockKey = control.path.split(".")[0]!;
        const block = blocksByKey.get(blockKey) ?? {
          blockKey,
          titleKey: blockTitleKey(blockKey),
          controls: [],
        };
        block.controls.push(control);
        blocksByKey.set(blockKey, block);
      }
    }
  }
  return [...blocksByKey.values()];
}

/** The therapist block table, derived from `THERAPIST_CHAPTERS`. */
export const THERAPIST_BLOCKS: SkinBlockDescriptor[] =
  therapistBlocksFromChapters();
