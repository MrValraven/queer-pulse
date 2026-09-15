#!/usr/bin/env node
/**
 * Composer emoji picker dataset: every picker-eligible emoji, with its English
 * and Portuguese label and a pre-flattened bilingual search string.
 *
 * OUTPUT is src/features/messages/emoji.data.ts, which is generated in full and
 * never hand-edited. Re-run with `node scripts/generate-emoji-data.mjs` from the
 * repo root after bumping the emojibase-data devDependency (a new Unicode
 * release is the only reason the output should ever move). Like
 * scripts/generate-chat-wallpapers.mjs and scripts/generate-icons.mjs, the
 * result is committed rather than built on demand.
 *
 * WHY A COMMITTED FILE AND NOT A RUNTIME DEPENDENCY. The alternative is shipping
 * emojibase-data itself and reshaping it in the browser. That costs twice: the
 * published dataset carries every skin-tone variant, every shortcode set and a
 * pile of fields a picker never reads, and the reshaping (label merge, tag
 * merge, diacritic stripping, dedup) would then run on every mount of the
 * picker on every device. Doing it once, here, means the app imports a plain
 * array of exactly the five fields the grid and the search box use. It also
 * keeps emojibase out of the dependency graph the browser sees, which is why it
 * is a devDependency and why application code must never import it.
 *
 * WHY A GENERATOR AND NOT A HAND-WRITTEN LIST. The list is ~1,900 entries in two
 * languages. Hand-maintaining that is how a picker ends up missing half of
 * Unicode 15, or carrying a Portuguese label nobody checked against a glyph. The
 * EXCLUSIONS are the other half of the argument: skin-tone variants, the
 * skin-tone and hair components, and the regional-indicator letters all have to
 * come out, and a rule is auditable in a way that a curated list is not.
 *
 * WHAT IS EXCLUDED, AND WHY.
 *
 *   Skin-tone variants. emojibase nests them under each base emoji as `skins`,
 *   so simply never descending into that array drops all ~1,300 of them. This
 *   build has no skin-tone feature: there is no tone preference to store and no
 *   tone strip to pick from, so a picker showing five copies of every hand would
 *   be noise. When a tone feature arrives, this is the line to revisit.
 *
 *   The `component` group (group 2). Nine codepoints: the five skin tones and
 *   the four hair components. They are modifiers, not emoji, and on their own
 *   they render as a bare colour swatch.
 *
 *   Entries with no group at all. Twenty-six of them, the regional-indicator
 *   letters (the halves that combine into a flag). A flag is already in the
 *   flags group; its letters are not something anyone picks.
 *
 *   Entries with no emoji-presentation form. emojibase gives every entry an
 *   `emoji` field (the qualified, variation-selector form) and a `text` field
 *   (the monochrome form), either of which may be empty. Anything with an empty
 *   `emoji` has no emoji presentation and would render as a glyph from the text
 *   font. As of emojibase-data 17 nothing grouped trips this, but the guard is
 *   cheap and a future Unicode release could add one.
 *
 * WHY THE GLYPH KEEPS ITS VARIATION SELECTOR. `entry.emoji` is the qualified
 * form, so the red heart ships as U+2764 U+FE0F rather than bare U+2764. Without
 * the selector, the ~200 emoji whose DEFAULT presentation is text (the heart,
 * the victory hand, the smiling face) render as monochrome outlines from the
 * text font on exactly the platforms where it matters. The selector is
 * invisible in this file's source; that is expected, not a corrupted string.
 *
 * WHY `terms` IS ONE PRE-FLATTENED STRING. Search runs on every keystroke over
 * the whole array. Storing EN label + PT label + EN tags + PT tags as four
 * arrays would mean a nested loop and a per-word `toLowerCase()` per keystroke.
 * Instead every word is lowercased, stripped of diacritics, deduplicated and
 * joined here, so the picker's filter is a single `terms.includes(query)` after
 * it puts the query through the SAME normalisation. Diacritic stripping is what
 * makes a Portuguese search work without a Portuguese keyboard: "coracao" finds
 * "coração", because both sides collapse to the same ASCII.
 *
 * ORDERING. Groups come out in EMOJI_GROUP_ORDER (the picker's tab order) and,
 * within a group, in emojibase's own `order` field, which is the Unicode CLDR
 * ordering every other picker uses. Smileys therefore start at the grinning face
 * and not at whatever the JSON happened to list first.
 *
 * WHY THIS SCRIPT RUNS PRETTIER ON ITS OWN OUTPUT. Prettier is enforced through
 * eslint as an error, so an unformatted generated file fails `pnpm lint`. If the
 * fix were "run the generator, then run lint:fix", the two would fight forever:
 * every regeneration would re-break the formatting and show up as a diff.
 * Formatting here instead makes the output a fixed point, so running the script
 * twice leaves the file byte-identical.
 *
 * DETERMINISM. Every input is a checked-in JSON file and nothing here consults a
 * clock, a random source or the environment, so two runs on the same
 * emojibase-data produce identical bytes and any diff after a re-run is a real
 * change.
 */
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";

const require = createRequire(import.meta.url);

const OUTPUT_PATH = fileURLToPath(
  new URL("../src/features/messages/emoji.data.ts", import.meta.url),
);

/* The 9 picker categories, in the order the category rail renders them. Note
   this is NOT emojibase's group order: activities sits before travel here
   because the rail reads better with the two "things people do" tabs adjacent,
   and the tab order is a presentation choice the picker owns. */
const EMOJI_GROUP_ORDER = [
  "smileys",
  "people",
  "animals",
  "food",
  "activities",
  "travel",
  "objects",
  "symbols",
  "flags",
];

/* emojibase's own group keys (from its messages.json) mapped onto ours. The
   mapping is 1:1 for all nine; only "component" is absent, which is what
   excludes the skin-tone and hair modifiers. Keying off the published group KEY
   rather than its numeric id means a future reshuffle of the numbers cannot
   silently file food under travel. */
const GROUP_KEY_BY_EMOJIBASE_KEY = {
  "smileys-emotion": "smileys",
  "people-body": "people",
  "animals-nature": "animals",
  "food-drink": "food",
  activities: "activities",
  "travel-places": "travel",
  objects: "objects",
  symbols: "symbols",
  flags: "flags",
};

/* ------------------------------------------------------------------ reading */

async function readEmojibaseJson(subpath) {
  const resolvedPath = require.resolve(`emojibase-data/${subpath}`);
  return JSON.parse(await readFile(resolvedPath, "utf8"));
}

/* emojibase numbers its groups and publishes the number-to-key table in
   messages.json. Resolve through it so GROUP_KEY_BY_EMOJIBASE_KEY above stays
   readable, and fail loudly if emojibase ever ships a group this script has
   never heard of, rather than dropping its emoji on the floor. */
function buildGroupKeyByGroupNumber(englishMessages) {
  const groupKeyByGroupNumber = new Map();
  for (const group of englishMessages.groups) {
    const isKnownGroup = Object.hasOwn(GROUP_KEY_BY_EMOJIBASE_KEY, group.key);
    const isDeliberatelyDropped = group.key === "component";
    if (!isKnownGroup && !isDeliberatelyDropped) {
      throw new Error(
        `Unknown emojibase group "${group.key}". Add it to GROUP_KEY_BY_EMOJIBASE_KEY (and to EmojiGroupKey in the picker) or add it to the deliberately-dropped list.`,
      );
    }
    if (isKnownGroup) {
      groupKeyByGroupNumber.set(
        group.order,
        GROUP_KEY_BY_EMOJIBASE_KEY[group.key],
      );
    }
  }
  return groupKeyByGroupNumber;
}

/* ----------------------------------------------------------------- eligible */

function isPickerEligible(emojibaseEntry, groupKeyByGroupNumber) {
  /* No group: the regional-indicator letters. No mapped key: the component
     group. Empty `emoji`: no emoji-presentation form to render. */
  if (emojibaseEntry.group === undefined) return false;
  if (!groupKeyByGroupNumber.has(emojibaseEntry.group)) return false;
  if (!emojibaseEntry.emoji) return false;
  return true;
}

/* ------------------------------------------------------------------- search */

/* Normalisation the picker's query box MUST mirror exactly, or a query will be
   compared against a string it can never match. Lowercase, decompose, drop the
   combining marks (so "coração" becomes "coracao"), then split on anything that
   is not a letter, a digit or one of the three keycap characters. Apostrophes
   are deleted rather than split on, so "women's" stays one word instead of
   leaving a stray "s" in the term list. */
function toSearchWords(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’]/g, "")
    .replace(/[^\p{Letter}\p{Number}#*+-]+/gu, " ")
    .split(" ")
    .filter((word) => /[\p{Letter}\p{Number}#*]/u.test(word));
}

/* EN label, PT label, EN tags, PT tags, in that order: the labels lead so the
   words a person is most likely to type sit adjacent in the string, which keeps
   a two-word query like "red heart" matching as a substring. A Set does the
   deduplication and preserves insertion order. */
function buildSearchTerms(englishEntry, portugueseEntry) {
  const words = new Set();
  const sources = [
    englishEntry.label,
    portugueseEntry?.label,
    ...(englishEntry.tags ?? []),
    ...(portugueseEntry?.tags ?? []),
  ];
  for (const source of sources) {
    if (!source) continue;
    for (const word of toSearchWords(source)) words.add(word);
  }
  return [...words].join(" ");
}

/* ----------------------------------------------------------------- building */

function buildEntries(englishData, portugueseData, groupKeyByGroupNumber) {
  /* emojibase publishes one file per locale with matching hexcodes, so the
     Portuguese label is a lookup away rather than a parallel walk. */
  const portugueseByHexcode = new Map(
    portugueseData.map((entry) => [entry.hexcode, entry]),
  );

  const entries = englishData
    .filter((entry) => isPickerEligible(entry, groupKeyByGroupNumber))
    .map((englishEntry) => {
      const portugueseEntry = portugueseByHexcode.get(englishEntry.hexcode);
      return {
        glyph: englishEntry.emoji,
        label: englishEntry.label,
        /* No Portuguese translation yet (emojibase ships a few gaps per
           release): fall back to the English label so the button always has an
           accessible name, rather than rendering an empty one. */
        labelPt: portugueseEntry?.label || englishEntry.label,
        terms: buildSearchTerms(englishEntry, portugueseEntry),
        group: groupKeyByGroupNumber.get(englishEntry.group),
        order: englishEntry.order ?? 0,
      };
    });

  /* Group-major, then emojibase's CLDR order inside each group. */
  const groupRank = new Map(
    EMOJI_GROUP_ORDER.map((groupKey, index) => [groupKey, index]),
  );
  entries.sort((left, right) => {
    const rankDifference =
      groupRank.get(left.group) - groupRank.get(right.group);
    return rankDifference !== 0 ? rankDifference : left.order - right.order;
  });

  return entries;
}

/* --------------------------------------------------------------- rendering */

/* How many entries go in one array literal. TypeScript forms a union of every
   element type in a contextually typed array literal, and past roughly a
   thousand elements that union blows its internal complexity budget: the whole
   1,914-entry array in one literal fails `tsc -b --noEmit` with
   "TS2590: Expression produces a union type that is too complex to represent",
   which in turn makes eslint's type service see the export as `any[]`. The
   measured cliff sits between 800 and 1,200 entries, so the file emits blocks
   of 400 and spreads them into EMOJI_DATA. The blocks are an implementation
   detail: only EMOJI_DATA and EMOJI_GROUP_ORDER are exported, the entries stay
   fully type-checked (unlike an `as EmojiEntry` per line, which would also
   silence the error but would stop catching a mistyped field), and the split
   point never lands anywhere a reader has to think about. */
const ENTRIES_PER_BLOCK = 400;

const FILE_HEADER = `/* GENERATED FILE. Do not edit: every line below is overwritten on the next run.
 *
 * Written by scripts/generate-emoji-data.mjs from the emojibase-data
 * devDependency. Regenerate with:
 *
 *   node scripts/generate-emoji-data.mjs
 */`;

function renderModule(entries) {
  const groupUnion = EMOJI_GROUP_ORDER.map(
    (groupKey) => `  | ${JSON.stringify(groupKey)}`,
  ).join("\n");

  const entryLines = entries.map((entry) => {
    const fields = [
      `glyph: ${JSON.stringify(entry.glyph)}`,
      `label: ${JSON.stringify(entry.label)}`,
      `labelPt: ${JSON.stringify(entry.labelPt)}`,
      `terms: ${JSON.stringify(entry.terms)}`,
      `group: ${JSON.stringify(entry.group)}`,
    ];
    return `  { ${fields.join(", ")} },`;
  });

  const blockNames = [];
  const blockLines = [];
  for (
    let blockStart = 0;
    blockStart < entryLines.length;
    blockStart += ENTRIES_PER_BLOCK
  ) {
    const blockName = `EMOJI_BLOCK_${blockNames.length}`;
    blockNames.push(blockName);
    blockLines.push(
      `const ${blockName}: EmojiEntry[] = [`,
      ...entryLines.slice(blockStart, blockStart + ENTRIES_PER_BLOCK),
      "];",
      "",
    );
  }

  return [
    FILE_HEADER,
    "",
    `export type EmojiGroupKey =\n${groupUnion};`,
    "",
    "export interface EmojiEntry {",
    "  /** The glyph itself, in emoji presentation. */",
    "  glyph: string;",
    '  /** English label, e.g. "grinning face". Used as the button\'s accessible name in EN. */',
    "  label: string;",
    "  /** Portuguese label. Used as the button's accessible name in PT. */",
    "  labelPt: string;",
    "  /** Lowercased, space-joined EN + PT search terms, already deduplicated and",
    "   *  stripped of diacritics, so search is a single `terms.includes(query)`. */",
    "  terms: string;",
    "  group: EmojiGroupKey;",
    "}",
    "",
    "/** Tab order for the picker's category rail. */",
    `export const EMOJI_GROUP_ORDER: EmojiGroupKey[] = [`,
    ...EMOJI_GROUP_ORDER.map((groupKey) => `  ${JSON.stringify(groupKey)},`),
    "];",
    "",
    "/* Split into blocks of " +
      ENTRIES_PER_BLOCK +
      " purely to stay under TypeScript's union-complexity",
    "   limit for a single array literal (TS2590). Not exported, no meaning. */",
    ...blockLines,
    "/** Every picker-eligible emoji, in Unicode order within each group. */",
    "export const EMOJI_DATA: EmojiEntry[] = [",
    ...blockNames.map((blockName) => `  ...${blockName},`),
    "];",
    "",
  ].join("\n");
}

/* --------------------------------------------------------------------- run */

const [englishData, portugueseData, englishMessages] = await Promise.all([
  readEmojibaseJson("en/data.json"),
  readEmojibaseJson("pt/data.json"),
  readEmojibaseJson("en/messages.json"),
]);

const groupKeyByGroupNumber = buildGroupKeyByGroupNumber(englishMessages);
const entries = buildEntries(
  englishData,
  portugueseData,
  groupKeyByGroupNumber,
);

const prettierOptions = await resolveConfig(OUTPUT_PATH);
const source = await format(renderModule(entries), {
  ...prettierOptions,
  parser: "typescript",
});
await writeFile(OUTPUT_PATH, source, "utf8");

const countByGroup = EMOJI_GROUP_ORDER.map((groupKey) => {
  const count = entries.filter((entry) => entry.group === groupKey).length;
  return `${groupKey} ${count}`;
}).join(", ");
const kilobytes = (Buffer.byteLength(source, "utf8") / 1024).toFixed(1);
console.log(
  `emoji.data.ts: ${entries.length} emoji (${countByGroup}), ${kilobytes} KB -> ${OUTPUT_PATH}`,
);
