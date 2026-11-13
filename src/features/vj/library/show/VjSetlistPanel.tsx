import { useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertCircle, FiList, FiPlus } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { ApiError } from "../../../../shared/api/client";
import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjSceneDTO,
  type VjSetlistDTO,
  type VjTempo,
} from "../../../../shared/contracts/vj";
import {
  Button,
  Collapse,
  EmptyState,
  SkeletonLine,
} from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjClips } from "../../api/useVjClips";
import { useVjScenes } from "../../api/useVjScenes";
import { useVjSetlistMutations } from "../../api/useVjSetlistMutations";
import { useVjSetlists } from "../../api/useVjSetlists";
import { vjErrorKeyOf } from "../../vjErrors";
import { VjReasonLine } from "../../VjReasonLine";
import { useVjListOrder } from "./useVjListOrder";
import { VjNameForm } from "./VjNameForm";
import { VjSetlistRow } from "./VjSetlistRow";
import styles from "./VjSetlists.module.css";

/** The app's `--dur-base`, for the swap between loading, error, empty and list. */
const FADE_SECONDS = 0.25;
const SKELETON_ROW_KEYS = ["first", "second", "third"] as const;

/** The library holds 50 sequences at most: New sequence names that cap
 *  before any request, as the server would. */
const SETLIST_LIMIT_REFUSAL = new ApiError(400, "VJ_SETLIST_LIMIT_REACHED", {
  statusCode: 400,
  code: "VJ_SETLIST_LIMIT_REACHED",
});

/** The sequences in their saved order: drag a grip or use up and down. */
function VjSetlistList({
  setlists,
  scenes,
  clips,
  clipsById,
  tempo,
  freshSetlistId,
}: {
  setlists: readonly VjSetlistDTO[];
  scenes: readonly VjSceneDTO[];
  clips: readonly VjClipDTO[];
  clipsById: ReadonlyMap<string, VjClipDTO>;
  tempo: VjTempo | null;
  freshSetlistId: string | null;
}) {
  const { t } = useTranslation();
  const { reorderSetlists } = useVjSetlistMutations();
  // A VJ_SETLIST_REORDER_MISMATCH refusal reads the set lists again (the
  // reorder write does it), so the order shown goes back to the server's.
  const {
    orderedItems,
    moveBy,
    draggingIndex,
    gripHandlers,
    listRef,
    status: orderStatus,
    error: orderError,
  } = useVjListOrder<VjSetlistDTO>({
    items: setlists,
    idOf: (setlist) => setlist.id,
    save: (setlistIds) => reorderSetlists.mutateAsync({ setlistIds }),
    statusOf: (movedSetlist, newIndex) =>
      t("vj:librarySetlists.movedStatus", {
        name: movedSetlist.name,
        position: newIndex + 1,
      }),
  });
  const total = orderedItems.length;

  return (
    <>
      <ol
        ref={listRef}
        className={styles.list}
        aria-label={t("vj:librarySetlists.listLabel")}
      >
        <AnimatePresence initial={false}>
          {orderedItems.map((setlist, setlistIndex) => (
            <VjSetlistRow
              key={setlist.id}
              setlist={setlist}
              scenes={scenes}
              clips={clips}
              clipsById={clipsById}
              tempo={tempo}
              position={setlistIndex}
              total={total}
              isDragging={draggingIndex === setlistIndex}
              gripProps={gripHandlers(setlistIndex)}
              onMove={(direction) => moveBy(setlistIndex, direction)}
              isItemsEditorOpenedOnCreate={setlist.id === freshSetlistId}
            />
          ))}
        </AnimatePresence>
      </ol>
      <p role="status" className="visuallyHidden">
        {orderStatus ?? ""}
      </p>
      <VjReasonLine error={orderError} />
    </>
  );
}

/** New sequence: the opener, the name form and the 50 cap. */
function VjSetlistCreate({
  setlistCount,
  onCreated,
}: {
  setlistCount: number;
  onCreated: (setlist: VjSetlistDTO) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { createSetlist } = useVjSetlistMutations();
  const [isOpen, setIsOpen] = useState(false);
  const [refusal, setRefusal] = useState<unknown>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const isAtLimit = setlistCount >= VJ_LIMITS.setlistsMax;

  const toggle = () => {
    if (isAtLimit && !isOpen) {
      setRefusal(SETLIST_LIMIT_REFUSAL);
      return;
    }
    setRefusal(null);
    setIsOpen((wasOpen) => !wasOpen);
  };

  const create = async (name: string) => {
    setRefusal(null);
    try {
      const setlist = await createSetlist.mutateAsync({ name });
      showToast(
        t("vj:librarySetlists.created", { name: setlist.name }),
        "success",
      );
      setIsOpen(false);
      // The field that held focus folds away; focus goes back to its opener.
      openerRef.current?.focus({ preventScroll: true });
      onCreated(setlist);
    } catch (cause) {
      setRefusal(cause);
    }
  };

  return (
    <div className={styles.create}>
      <Button
        ref={openerRef}
        variant="soft"
        size="sm"
        aria-expanded={isOpen}
        aria-disabled={isAtLimit && !isOpen ? "true" : undefined}
        onClick={toggle}
      >
        <FiPlus aria-hidden="true" fill="none" focusable="false" />
        {t("vj:librarySetlists.create.open")}
      </Button>
      <Collapse isOpen={isOpen}>
        <VjNameForm
          label={t("vj:librarySetlists.create.label")}
          initialName=""
          submitLabel={t("vj:librarySetlists.create.submit")}
          maxLength={VJ_LIMITS.setlistNameMax}
          blankCode="VJ_SETLIST_NAME_REQUIRED"
          isPending={createSetlist.isPending}
          refusal={refusal}
          onSubmit={(name) => void create(name)}
          onCancel={() => {
            setRefusal(null);
            setIsOpen(false);
            openerRef.current?.focus({ preventScroll: true });
          }}
        />
      </Collapse>
      <VjReasonLine error={isOpen ? null : refusal} />
    </div>
  );
}

export interface VjSetlistPanelProps {
  clipsById: ReadonlyMap<string, VjClipDTO>;
  /** The live tempo, for the run time of a sequence with steps in beats.
   *  Left out (or null) while no tempo is known: that run time is left out. */
  tempo?: VjTempo | null;
}

/**
 * Sequences, library wide: create, rename, reorder and delete them, set each
 * one's default step length and Loop, and edit the clips and scenes it plays
 * in order. The body fades between loading, a load error with a retry, the
 * empty state and the list; it waits for the clips too, so a clip step never
 * reads as gone while the clips load.
 */
export function VjSetlistPanel({
  clipsById,
  tempo = null,
}: VjSetlistPanelProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const setlistsQuery = useVjSetlists();
  const scenesQuery = useVjScenes();
  const clipsQuery = useVjClips();
  const [freshSetlistId, setFreshSetlistId] = useState<string | null>(null);

  const setlists = setlistsQuery.data;
  const scenes = scenesQuery.data;
  const clips = clipsQuery.data;
  const failedQuery =
    setlists === undefined && setlistsQuery.isError
      ? setlistsQuery
      : scenes === undefined && scenesQuery.isError
        ? scenesQuery
        : clips === undefined && clipsQuery.isError
          ? clipsQuery
          : null;
  const bodyKey =
    failedQuery !== null
      ? "error"
      : setlists === undefined || scenes === undefined || clips === undefined
        ? "loading"
        : setlists.length === 0
          ? "empty"
          : "list";
  const isRetrying =
    setlistsQuery.isFetching || scenesQuery.isFetching || clipsQuery.isFetching;
  const retry = () => {
    if (setlists === undefined) void setlistsQuery.refetch();
    if (scenes === undefined) void scenesQuery.refetch();
    if (clips === undefined) void clipsQuery.refetch();
  };

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <header className={styles.header}>
        <div className={styles.headingRow}>
          <h2 id={headingId} className={styles.heading}>
            {t("vj:librarySetlists.heading")}
          </h2>
          <span className={styles.count}>
            {t("vj:librarySetlists.count", {
              count: setlists?.length ?? 0,
              max: VJ_LIMITS.setlistsMax,
            })}
          </span>
        </div>
        <p className={styles.intro}>{t("vj:librarySetlists.intro")}</p>
      </header>
      <VjSetlistCreate
        setlistCount={setlists?.length ?? 0}
        onCreated={(setlist) => setFreshSetlistId(setlist.id)}
      />
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={bodyKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : FADE_SECONDS }}
        >
          {bodyKey === "loading" && (
            <div className={styles.skeleton} aria-busy="true">
              {SKELETON_ROW_KEYS.map((rowKey) => (
                <SkeletonLine key={rowKey} height={44} />
              ))}
            </div>
          )}
          {bodyKey === "error" && (
            <EmptyState
              compact
              headingLevel={3}
              icon={<FiAlertCircle aria-hidden="true" fill="none" />}
              title={t("vj:librarySetlists.loadErrorTitle")}
              description={
                <span role="alert">{t(vjErrorKeyOf(failedQuery?.error))}</span>
              }
              action={{
                label: t("vj:librarySetlists.retry"),
                onClick: isRetrying ? undefined : retry,
                isBusy: isRetrying,
              }}
            />
          )}
          {bodyKey === "empty" && (
            <EmptyState
              compact
              headingLevel={3}
              icon={<FiList aria-hidden="true" focusable="false" fill="none" />}
              title={t("vj:librarySetlists.emptyTitle")}
              description={t("vj:librarySetlists.emptyBody")}
            />
          )}
          {bodyKey === "list" && setlists !== undefined && (
            <VjSetlistList
              setlists={setlists}
              scenes={scenes ?? []}
              clips={clips ?? []}
              clipsById={clipsById}
              tempo={tempo}
              freshSetlistId={freshSetlistId}
            />
          )}
        </m.div>
      </AnimatePresence>
    </section>
  );
}
