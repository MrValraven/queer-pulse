import type { SkinChapterDescriptor } from "./skinBlockFields.data";

/** The DOM id on a chaptered Page blocks control's wrapper, so a link can
 *  jump to one field: `therapist.quote` → `skin-field-therapist-quote`. */
export function skinFieldAnchorId(path: string): string {
  return `skin-field-${path.replace(/\./g, "-")}`;
}

/** The chapter holding the control at `path`, for building a
 *  `?pane=skinBlocks&chapter=` link. `null` when no chapter edits it. */
export function chapterKeyForPath(
  chapters: SkinChapterDescriptor[],
  path: string,
): string | null {
  const chapter = chapters.find((candidate) =>
    candidate.groups.some((group) =>
      group.controls.some((control) => control.path === path),
    ),
  );
  return chapter?.key ?? null;
}
