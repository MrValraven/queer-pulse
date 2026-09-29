import { intlLocale } from "../../../shared/i18n/locale";
import type {
  Language,
  TFunction,
  TranslateOptions,
} from "../../../shared/i18n/types";
import type { GroupReason } from "../api/goTogether.types";
import { WIDE_AREAS } from "../goTogetherQuestionnaire.data";

/** A reason ready for `t(key, values)`. */
export interface ReasonCopy {
  key: string;
  values: TranslateOptions;
}

const ENERGY_LEVELS = ["calm", "balanced", "lively"] as const;

/** Joins translated labels the way the locale lists things ("A, B and C"). */
function formatTagList(labels: string[], language: Language): string {
  return new Intl.ListFormat(intlLocale(language), {
    type: "conjunction",
  }).format(labels);
}

function isWideArea(areaId: string): boolean {
  return (WIDE_AREAS as readonly string[]).includes(areaId);
}

/** Neighbourhood names are proper nouns and stay as they are; the wide areas
 *  have a label in each language. */
function areaLabel(areaId: string, t: TFunction): string {
  return isWideArea(areaId)
    ? t(`goTogether:questionnaire.area.${areaId}`)
    : areaId;
}

const TAG_LABEL_KEY_PREFIX = {
  interests: "goTogether:questionnaire.interests.tag.",
  music: "goTogether:questionnaire.music.",
} as const;

/** English labels that name a people or a place keep their capital inside a
 *  sentence ("Brazilian music", "Latin"). Portuguese writes both in lower case
 *  ("música brasileira"), so it needs no list. */
const ENGLISH_KEEP_CASE_TAGS: ReadonlySet<string> = new Set([
  "music.brazilian",
  "music.latin",
]);

function isLowercaseLetter(character: string | undefined): boolean {
  return (
    character !== undefined &&
    character !== character.toLocaleUpperCase() &&
    character === character.toLocaleLowerCase()
  );
}

/** The catalog labels are written to stand alone ("Board games"). Inside a
 *  sentence the first letter drops to lower case, but only when the second
 *  letter is already lower case, which keeps "TV series", "R&B" and "K-pop". */
export function tagLabelInSentence(
  label: string,
  tagKey: string,
  language: Language,
): string {
  if (language === "en" && ENGLISH_KEEP_CASE_TAGS.has(tagKey)) return label;
  const [firstCharacter, secondCharacter] = Array.from(label);
  if (!firstCharacter || !isLowercaseLetter(secondCharacter)) return label;
  return (
    firstCharacter.toLocaleLowerCase(intlLocale(language)) +
    label.slice(firstCharacter.length)
  );
}

function sharedTagCopy(
  tagIds: string[],
  count: number,
  total: number,
  keyStem: "interests" | "music",
  t: TFunction,
  language: Language,
): ReasonCopy | null {
  if (tagIds.length === 0) return null;
  const labels = tagIds.map((tagId) =>
    tagLabelInSentence(
      t(`${TAG_LABEL_KEY_PREFIX[keyStem]}${tagId}`),
      `${keyStem}.${tagId}`,
      language,
    ),
  );
  const tags = formatTagList(labels, language);
  return count >= total
    ? { key: `goTogether:reason.${keyStem}Everyone`, values: { tags } }
    : { key: `goTogether:reason.${keyStem}Some`, values: { tags, count } };
}

/**
 * Maps one server reason onto its catalog key and values. The server may add a
 * reason kind this client does not know yet; that reason maps to null and the
 * list skips it.
 */
export function reasonCopy(
  reason: GroupReason,
  t: TFunction,
  language: Language,
): ReasonCopy | null {
  switch (reason.kind) {
    case "interests":
      return sharedTagCopy(
        reason.tagIds,
        reason.count,
        reason.total,
        "interests",
        t,
        language,
      );
    case "music":
      return sharedTagCopy(
        reason.tagIds,
        reason.count,
        reason.total,
        "music",
        t,
        language,
      );
    case "energy":
      return (ENERGY_LEVELS as readonly string[]).includes(reason.level)
        ? { key: `goTogether:reason.energy.${reason.level}`, values: {} }
        : null;
    case "area": {
      const area = areaLabel(reason.areaId, t);
      return reason.count >= reason.total
        ? { key: "goTogether:reason.areaEveryone", values: { area } }
        : {
            key: "goTogether:reason.areaSome",
            values: { area, count: reason.count },
          };
    }
    case "hostQuestion":
      return {
        key: "goTogether:reason.hostQuestion",
        values: { option: reason.optionLabel, prompt: reason.prompt },
      };
    default:
      return null;
  }
}
