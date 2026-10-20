import { useId, useRef, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import { FiEdit2, FiPlus } from "react-icons/fi";
import {
  Button,
  Collapse,
  LoadErrorState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityGivingDTO } from "../api/communityGiving.api";
import { useCommunityGiving } from "../api/useCommunityGiving";
import { CommunityGivingEditor } from "./CommunityGivingEditor";
import { CommunityGivingReadView } from "./CommunityGivingReadView";
import { GIVING_PANEL_ID } from "./givingConstants";
import {
  usePendingGivingFocus,
  useScrollToGivingPanel,
} from "./useGivingPanelFocus";
import detailStyles from "../CommunityDetailPage.module.css";
import styles from "./Giving.module.css";

/**
 * The community's Support tab. Everyone sees the read view; owners and
 * co-owners (`canEdit`) get an Edit button, or an empty state that opens the
 * editor. The editor only opens on loaded data, so a save can never replace
 * the stored section with an empty one. Once open it keeps its draft through
 * a refetch, a failed refetch or a language switch: it is seeded from a
 * snapshot taken when it opened, and stays mounted while the query reloads.
 */
export function CommunityGivingTab({
  slug,
  communityName,
  canEdit,
}: {
  slug: string;
  communityName: string;
  canEdit: boolean;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { giving, isLoading, isError, refetch } = useCommunityGiving(slug);
  const [isEditing, setIsEditing] = useState(false);
  // Each opening is a new edit session: the key remounts the editor, so a
  // reopen during the close animation starts from the snapshot again and
  // never brings back a discarded draft.
  const [editSessionId, setEditSessionId] = useState(0);
  const [editorGiving, setEditorGiving] = useState<CommunityGivingDTO | null>(
    null,
  );
  const panelRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  useScrollToGivingPanel(panelRef);

  const isLoaded = !isLoading && !isError;
  const methodCount = giving?.methods.length ?? 0;
  const isEditorOpen = isEditing && canEdit;
  const isEditVisible = canEdit && isLoaded && methodCount > 0 && !isEditing;
  const isAddVisible =
    canEdit && isLoaded && methodCount === 0 && !isEditorOpen;
  const { requestFocusAfterClose, clearPendingFocus } = usePendingGivingFocus({
    isEditorOpen,
    methodCount,
    isEditVisible,
    isAddVisible,
    editButtonRef,
    addButtonRef,
    headingRef,
  });

  // Only loaded data may seed the editor (the open controls render only
  // then too), or a save could replace the stored section with an empty one.
  const openEditor = () => {
    if (!isLoaded) return;
    clearPendingFocus();
    flushSync(() => {
      setEditorGiving(giving);
      setEditSessionId((previous) => previous + 1);
      setIsEditing(true);
    });
    editorRef.current
      ?.querySelector<HTMLElement>("textarea, input, select")
      ?.focus();
  };

  // Focus moves once the count matches the saved section (or the current
  // one, for Cancel and Discard); see `usePendingGivingFocus`.
  const closeEditor = (saved?: CommunityGivingDTO) => {
    requestFocusAfterClose(saved?.methods.length ?? methodCount);
    setIsEditing(false);
  };

  return (
    <section
      ref={panelRef}
      id={GIVING_PANEL_ID}
      className={styles.panel}
      aria-labelledby={headingId}
    >
      <div className={styles.head}>
        <h2
          ref={headingRef}
          id={headingId}
          className={[detailStyles.secLbl, styles.panelHeading].join(" ")}
          tabIndex={-1}
        >
          {t("communities:detail.giving.heading", { name: communityName })}
        </h2>
        <Collapse isOpen={isEditVisible}>
          <Button
            ref={editButtonRef}
            variant="ghost"
            size="sm"
            className={styles.editCta}
            onClick={openEditor}
          >
            <FiEdit2 aria-hidden />
            {t("communities:detail.giving.editCta")}
          </Button>
        </Collapse>
      </div>

      <Collapse isOpen={!isEditorOpen}>
        <GivingTabBody
          giving={giving}
          communityName={communityName}
          canEdit={canEdit}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onAdd={openEditor}
          addButtonRef={addButtonRef}
        />
      </Collapse>

      <Collapse isOpen={isEditorOpen}>
        <div ref={editorRef}>
          <CommunityGivingEditor
            key={editSessionId}
            slug={slug}
            communityName={communityName}
            giving={editorGiving}
            onClose={closeEditor}
          />
        </div>
      </Collapse>
    </section>
  );
}

/** What the tab shows while the editor is closed: placeholders, the load
 *  error, the read view, or the empty state (with Add for owners). */
function GivingTabBody({
  giving,
  communityName,
  canEdit,
  isLoading,
  isError,
  onRetry,
  onAdd,
  addButtonRef,
}: {
  giving: CommunityGivingDTO | null;
  communityName: string;
  canEdit: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onAdd: () => void;
  addButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className={styles.loading} aria-busy="true">
        <SkeletonLine width="70%" />
        <SkeletonLine height={44} />
        <SkeletonLine height={44} />
      </div>
    );
  }
  if (isError) return <LoadErrorState compact onRetry={onRetry} />;
  if (giving && giving.methods.length > 0) {
    return (
      <CommunityGivingReadView giving={giving} communityName={communityName} />
    );
  }
  if (!canEdit) {
    return (
      <p className={styles.empty}>
        {t("communities:detail.giving.empty.viewer")}
      </p>
    );
  }
  return (
    <div className={styles.emptyOwner}>
      <h3 className={styles.emptyTitle}>
        {t("communities:detail.giving.empty.title")}
      </h3>
      <p className={styles.empty}>
        {t("communities:detail.giving.empty.body")}
      </p>
      <Button ref={addButtonRef} variant="primary" size="sm" onClick={onAdd}>
        <FiPlus aria-hidden />
        {t("communities:detail.giving.editor.addCta")}
      </Button>
    </div>
  );
}
