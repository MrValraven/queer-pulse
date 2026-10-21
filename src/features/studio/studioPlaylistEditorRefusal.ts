import { intlLocale } from "../../shared/i18n/locale";
import type { Language, TFunction } from "../../shared/i18n/types";
import type { StudioPlaylistEditorIneligibleReason } from "./api/studio.types";
import {
  ineligibleEditorsOf,
  type IneligibleEditor,
} from "./api/studioPlaylistEditors.api";
import { studioErrorMessageKeyOf } from "./studioErrors.data";

/** Each reason's sentence, in reading order: the whole-request lapse first.
 *  `named` speaks of the credited persona by name, `unnamed` when the
 *  playlist shows as a member and no persona name is at hand. */
const REASON_KEYS: Record<
  StudioPlaylistEditorIneligibleReason,
  { named: string; unnamed: string }
> = {
  persona_credit_lapsed: {
    named: "studio:playlist.editors.refused.creditLapsed",
    unnamed: "studio:playlist.editors.refused.creditLapsedUnnamed",
  },
  no_studio_access: {
    named: "studio:playlist.editors.refused.noStudioAccess",
    unnamed: "studio:playlist.editors.refused.noStudioAccess",
  },
  not_connected: {
    named: "studio:playlist.editors.refused.notConnected",
    unnamed: "studio:playlist.editors.refused.notConnected",
  },
  not_co_owner: {
    named: "studio:playlist.editors.refused.notCoOwner",
    unnamed: "studio:playlist.editors.refused.notCoOwnerUnnamed",
  },
  blocked: {
    named: "studio:playlist.editors.refused.blocked",
    unnamed: "studio:playlist.editors.refused.blocked",
  },
  not_found: {
    named: "studio:playlist.editors.refused.notFound",
    unnamed: "studio:playlist.editors.refused.notFound",
  },
  is_owner: {
    named: "studio:playlist.editors.refused.isOwner",
    unnamed: "studio:playlist.editors.refused.isOwner",
  },
};

const REASONS_IN_ORDER = Object.keys(
  REASON_KEYS,
) as StudioPlaylistEditorIneligibleReason[];

const SENTENCE_SEPARATOR = ". ";

export interface EditorRefusalTextOptions {
  t: TFunction;
  language: Language;
  /** The name to show for a refused slug. */
  nameOf: (memberSlug: string) => string;
  /** The credited persona's name, or null for a member-credited playlist. */
  personaName: string | null;
  /** Everyone ticked in a multi-pick invite: adds the closing line that tells
   *  the owner to untick the refused people. Leave it out where nothing
   *  stays ticked after a refusal. */
  pickedSlugs?: ReadonlySet<string>;
}

/**
 * What a refused editors invite says: one sentence per reason the server
 * gave, naming everyone it refused for that reason, then (on a multi-pick
 * invite) one line on unticking them. Any other error, and a refusal with no
 * reason this client knows, falls back to the existing lines.
 */
export function editorRefusalTextOf(
  error: unknown,
  options: EditorRefusalTextOptions,
): string {
  const { t, language, nameOf, personaName, pickedSlugs } = options;
  const refusedEditors = ineligibleEditorsOf(error);
  const hasAnyReason = refusedEditors.some((editor) => editor.reason !== null);
  const listFormat = new Intl.ListFormat(intlLocale(language), {
    style: "long",
    type: "conjunction",
  });
  const namesOf = (editors: IneligibleEditor[]) =>
    listFormat.format(editors.map((editor) => nameOf(editor.memberSlug)));

  if (!hasAnyReason) {
    if (refusedEditors.length === 0 || !pickedSlugs)
      return t(studioErrorMessageKeyOf(error));
    return t("studio:playlist.editors.invite.ineligible", {
      names: namesOf(refusedEditors),
    });
  }

  const sentences: string[] = [];
  for (const reason of REASONS_IN_ORDER) {
    const group = refusedEditors.filter((editor) => editor.reason === reason);
    if (group.length === 0) continue;
    const keys = REASON_KEYS[reason];
    sentences.push(
      t(personaName === null ? keys.unnamed : keys.named, {
        names: namesOf(group),
        count: group.length,
        persona: personaName ?? "",
      }),
    );
  }
  const unexplained = refusedEditors.filter((editor) => editor.reason === null);
  if (unexplained.length > 0)
    sentences.push(
      t("studio:playlist.editors.refused.unexplained", {
        names: namesOf(unexplained),
        count: unexplained.length,
      }),
    );

  const isFixedByUntick = refusedEditors.some(
    (editor) => editor.reason !== "persona_credit_lapsed",
  );
  if (pickedSlugs && isFixedByUntick) {
    const refusedSlugs = new Set(
      refusedEditors.map((editor) => editor.memberSlug),
    );
    const isEveryPickRefused = [...pickedSlugs].every((slug) =>
      refusedSlugs.has(slug),
    );
    sentences.push(
      t(
        isEveryPickRefused
          ? "studio:playlist.editors.refused.untickAndRetry"
          : "studio:playlist.editors.refused.untickToSendRest",
      ),
    );
  }
  return sentences.join(SENTENCE_SEPARATOR);
}
