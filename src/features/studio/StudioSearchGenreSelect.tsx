import { useId } from "react";
import { Select, type SelectOption } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isStudioFormat,
  isStudioGenre,
  isStudioMood,
  STUDIO_FORMAT_LABEL_KEY,
  STUDIO_GENRE_LABEL_KEY,
} from "./api/studio.adapters";
import {
  STUDIO_FORMATS,
  STUDIO_GENRES,
  STUDIO_MOODS,
  type StudioFormat,
  type StudioGenre,
  type StudioMood,
} from "./api/studio.types";
import { useStudioFormats } from "./api/useStudioFormats";
import { useStudioGenres } from "./api/useStudioGenres";
import { useStudioMoods } from "./api/useStudioMoods";
import type { StudioLoadState } from "./api/studioLoadState";
import { STUDIO_MOOD_LABEL_KEY } from "./studioDiscoveryLabels";
import css from "./StudioSearch.module.css";

/** DES-35: a facet lists only the values with something published, read
 *  from the same queries as browse. Until that list arrives (or if it
 *  fails) the whole vocabulary stays, so the select never goes empty, and
 *  the value in the URL always stays listed. */
function publishedValuesOf<Value extends string>(
  vocabulary: readonly Value[],
  published: readonly Value[],
  loadState: StudioLoadState,
  current: Value | null,
): readonly Value[] {
  const hasList = !loadState.isLoading && !loadState.isError;
  if (!hasList) return vocabulary;
  const listed = new Set<Value>(published);
  if (current) listed.add(current);
  return vocabulary.filter((value) => listed.has(value));
}

/** One vocabulary select beside the type filter, on the shared Select
 *  (DES-38): "Any" first, then each published value in list order. Genre and mood narrow releases and tracks (the
 *  server ignores both for artists and playlists). */
function StudioSearchVocabularySelect<Value extends string>({
  labelKey,
  anyKey,
  values,
  labelKeys,
  isValue,
  value,
  onChange,
}: {
  labelKey: string;
  anyKey: string;
  values: readonly Value[];
  labelKeys: Record<Value, string>;
  isValue: (candidate: string) => candidate is Value;
  value: Value | null;
  onChange: (value: Value | null) => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const options: SelectOption[] = [
    { value: "", label: t(anyKey) },
    ...values.map((option) => ({ value: option, label: t(labelKeys[option]) })),
  ];
  return (
    <div className={css.facetField}>
      <span id={labelId} className={css.facetLabel}>
        {t(labelKey)}
      </span>
      <Select
        className={css.facetSelect}
        labelledBy={labelId}
        options={options}
        searchable={false}
        value={value ?? ""}
        onChange={(next) => onChange(next && isValue(next) ? next : null)}
      />
    </div>
  );
}

export function StudioSearchGenreSelect({
  value,
  onChange,
}: {
  value: StudioGenre | null;
  onChange: (genre: StudioGenre | null) => void;
}) {
  const { genres, loadState } = useStudioGenres();
  return (
    <StudioSearchVocabularySelect
      labelKey="studio:searchPage.genreLabel"
      anyKey="studio:searchPage.genreAny"
      values={publishedValuesOf(STUDIO_GENRES, genres, loadState, value)}
      labelKeys={STUDIO_GENRE_LABEL_KEY}
      isValue={isStudioGenre}
      value={value}
      onChange={onChange}
    />
  );
}

export function StudioSearchMoodSelect({
  value,
  onChange,
}: {
  value: StudioMood | null;
  onChange: (mood: StudioMood | null) => void;
}) {
  const { moods, loadState } = useStudioMoods();
  return (
    <StudioSearchVocabularySelect
      labelKey="studio:searchPage.moodLabel"
      anyKey="studio:searchPage.moodAny"
      values={publishedValuesOf(STUDIO_MOODS, moods, loadState, value)}
      labelKeys={STUDIO_MOOD_LABEL_KEY}
      isValue={isStudioMood}
      value={value}
      onChange={onChange}
    />
  );
}

/** Artist kinds: the format select, beside type, genre and mood. Format
 *  narrows releases, tracks and artists. */
export function StudioSearchFormatSelect({
  value,
  onChange,
}: {
  value: StudioFormat | null;
  onChange: (format: StudioFormat | null) => void;
}) {
  const { formats, loadState } = useStudioFormats();
  return (
    <StudioSearchVocabularySelect
      labelKey="studio:searchPage.formatLabel"
      anyKey="studio:searchPage.formatAny"
      values={publishedValuesOf(STUDIO_FORMATS, formats, loadState, value)}
      labelKeys={STUDIO_FORMAT_LABEL_KEY}
      isValue={isStudioFormat}
      value={value}
      onChange={onChange}
    />
  );
}
