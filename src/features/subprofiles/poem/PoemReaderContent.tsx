import { useMemo, useState, type RefObject } from "react";
import { SegmentedControl } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { WorkRightsFooter } from "../rights/WorkRightsFooter";
import { PoemBlocksView } from "./PoemBlocksView";
import { PoemReaderHeader } from "./PoemReaderHeader";
import { normalizePoemVersions, poemToPlainText } from "./poemModel";
import styles from "./PoemReaderContent.module.css";

export interface PoemReaderContentProps {
  item: SubprofileItemView;
  authorName: string;
  shareUrl: string | null;
  titleRef: RefObject<HTMLHeadingElement | null>;
}

/**
 * One poem inside the reader: its title page, the translation tabs and the
 * verse. The reader keys this on the poem's id, so moving to another poem
 * remounts it: the version choice starts over on the first version and the
 * fade-in plays again.
 */
export function PoemReaderContent({
  item,
  authorName,
  shareUrl,
  titleRef,
}: PoemReaderContentProps) {
  const { t } = useTranslation();

  // Named translations of this poem (always one or more; a single-version
  // poem reads as one default version). Readers cycle the rest via the tabs.
  const versions = useMemo(
    () =>
      normalizePoemVersions(
        item.structured?.poemVersions ?? null,
        item.structured?.poem ?? null,
      ),
    [item.structured],
  );
  const [activeId, setActiveId] = useState<string>(() => versions[0]!.id);
  const activeIndex = Math.max(
    0,
    versions.findIndex((version) => version.id === activeId),
  );
  const activeVersion = versions[activeIndex]!;

  function versionLabel(
    version: (typeof versions)[number],
    index: number,
  ): string {
    return (
      version.label.trim() ||
      t("subprofiles:poem.versions.untitled", { index: index + 1 })
    );
  }

  return (
    <div className={styles.content}>
      <PoemReaderHeader
        item={item}
        authorName={authorName}
        shareUrl={shareUrl}
        poemPlainText={poemToPlainText(activeVersion.blocks)}
        titleRef={titleRef}
      />
      <div className={styles.body}>
        {versions.length > 1 && (
          <SegmentedControl
            className={styles.versions}
            label={t("subprofiles:poem.versions.readerAria")}
            options={versions.map((version, index) => ({
              value: version.id,
              label: versionLabel(version, index),
            }))}
            value={activeVersion.id}
            onChange={setActiveId}
          />
        )}
        <PoemBlocksView
          blocks={activeVersion.blocks}
          description={activeIndex === 0 ? item.description : undefined}
        />
        {/* The colophon variant carries no rule of its own, so the pager's
            border stays the one divider under the poem. Passing the poem's own
            date as the latest prints a single year. */}
        <footer className={styles.rights}>
          <WorkRightsFooter
            createdAtISO={item.createdAt}
            variant="colophon"
            latestISO={item.createdAt}
          />
        </footer>
      </div>
    </div>
  );
}
