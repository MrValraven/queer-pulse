import type { ArticleBlock, ArticleDraftDto } from "../../api/pieces.api";
import { PublishRail, type PublishStatus } from "./PublishRail";
import { ArticleMetaRail } from "./ArticleMetaRail";
import { NotesRail } from "./NotesRail";
import { VersionsRail } from "./VersionsRail";
import styles from "../../ArticleEditorPage.module.css";

export interface ArticleEditorRailsProps {
  pieceId: string;
  /** The document's currently selected block, if any — carried onto new
   *  top-level notes so they anchor to that block (see `NotesRailProps`). */
  activeBlockId: string | null;
  standfirst: string;
  blocks: ArticleBlock[];
  publishStatus: PublishStatus;
  onPublishStatusChange: (status: PublishStatus) => void;
  onPublish: () => void;
  section: string;
  onSectionChange: (value: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  byline: string;
  role: string;
  onRoleChange: (value: string) => void;
  slug: string;
  readMinutes: number;
  wordCount: number;
  /** Threaded straight to `VersionsRail` — see its own prop doc. */
  onVersionRestored: (draft: ArticleDraftDto) => void;
}

/**
 * The editor's `.erail` sidebar — Publish, Piece meta, Notes, and History —
 * shown in Shape and Read modes (Draft hides it for a wider writing
 * column). Pure composition, extracted so `ArticleEditorPage` stays under
 * the 200-line cap; every rail already owns its own presentation.
 */
export function ArticleEditorRails(props: ArticleEditorRailsProps) {
  return (
    <aside className={styles.erail}>
      <PublishRail
        standfirst={props.standfirst}
        blocks={props.blocks}
        publishStatus={props.publishStatus}
        onPublishStatusChange={props.onPublishStatusChange}
        onPublish={props.onPublish}
      />
      <ArticleMetaRail
        section={props.section}
        onSectionChange={props.onSectionChange}
        tags={props.tags}
        onTagsChange={props.onTagsChange}
        byline={props.byline}
        role={props.role}
        onRoleChange={props.onRoleChange}
        slug={props.slug}
        readMinutes={props.readMinutes}
        wordCount={props.wordCount}
      />
      <NotesRail pieceId={props.pieceId} blockId={props.activeBlockId} />
      <VersionsRail
        pieceId={props.pieceId}
        blocks={props.blocks}
        onRestored={props.onVersionRestored}
      />
    </aside>
  );
}
