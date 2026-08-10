/**
 * Sample cards for `EmptySides`' `.empty-samples` stack — three rotated
 * `.empty-card[data-skin-hint]` tiles that hint at what a finished persona can
 * look like, one per distinctive skin family (stage/practice/table are the
 * most visually different of the six, so they read as distinct examples at a
 * glance). Purely illustrative placeholder people, not real members — name
 * and line both go through i18n like any other UI copy.
 */
export interface EmptySideSample {
  /** Matches `SkinFamily` from `subprofile-skins.ts`, narrowed to the three
   *  families shown here. Drives `data-skin-hint` + the CSS `--i` rotation. */
  skinHint: "stage" | "practice" | "table";
  nameKey: string;
  lineKey: string;
}

export const EMPTY_SIDES_SAMPLES: readonly EmptySideSample[] = [
  {
    skinHint: "stage",
    nameKey: "subprofiles:mine.emptySamples.stage.name",
    lineKey: "subprofiles:mine.emptySamples.stage.line",
  },
  {
    skinHint: "practice",
    nameKey: "subprofiles:mine.emptySamples.practice.name",
    lineKey: "subprofiles:mine.emptySamples.practice.line",
  },
  {
    skinHint: "table",
    nameKey: "subprofiles:mine.emptySamples.table.name",
    lineKey: "subprofiles:mine.emptySamples.table.line",
  },
];
