import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjPackDTO } from "../../../shared/contracts/vj";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  Button,
  Collapse,
  ConfirmDialog,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDeleteVjPack, useRenameVjPack } from "../api/useVjPackMutations";
import { VjReasonLine } from "../VjReasonLine";
import { formatVjBytes } from "../vjFormat";
import { VjPackNameForm } from "./VjPackCreateForm";
import { VjPackEventLink } from "./VjPackEventLink";
import styles from "./VjPacks.module.css";

/** `--ease` and `--dur-fast`, for the swap between two packs' headers. */
const SWAP_EASE = [0.22, 0.68, 0.16, 1] as const;
const SWAP_SECONDS = 0.15;

export interface VjPackHeaderProps {
  /** The pack on show; null is All clips. */
  pack: VjPackDTO | null;
  /** The library's clip count; null while it loads or after it failed, so
   *  the meta line waits for a real number. */
  libraryClipCount: number | null;
  onPackDeleted: (packId: string) => void;
}

/** The Delete pack dialog: says what stays, and names a refusal inside. */
function DeletePackDialog({
  pack,
  onClose,
  onDeleted,
}: {
  pack: VjPackDTO;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const deletePack = useDeleteVjPack();
  const [refusal, setRefusal] = useState<unknown>(null);

  const confirm = async () => {
    if (deletePack.isPending) return;
    setRefusal(null);
    try {
      await deletePack.mutateAsync({ packId: pack.id });
      showToast(t("vj:packs.toast.deleted", { name: pack.name }), "success");
      onDeleted();
    } catch (cause) {
      setRefusal(cause);
    }
  };

  return (
    <ConfirmDialog
      open
      tone="destructive"
      initialFocus="cancel"
      title={t("vj:packs.delete.title", { name: pack.name })}
      description={
        pack.clipCount === 0
          ? t("vj:packs.delete.bodyEmpty")
          : t("vj:packs.delete.body", { count: pack.clipCount })
      }
      confirmLabel={t("vj:packs.delete.confirm")}
      loading={deletePack.isPending}
      onClose={onClose}
      onConfirm={() => void confirm()}
    >
      <VjReasonLine error={refusal} />
    </ConfirmDialog>
  );
}

/** Rename pack (a field that folds open) and Delete pack (a dialog). The
 *  buttons sit beside the title; the rename field folds in under it, above
 *  the `after` row (the pack's event). */
function PackActions({
  pack,
  onPackDeleted,
  after,
}: {
  pack: VjPackDTO;
  onPackDeleted: (packId: string) => void;
  after: ReactNode;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const renamePack = useRenameVjPack();
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [renameRefusal, setRenameRefusal] = useState<unknown>(null);
  const renameOpenerRef = useRef<HTMLButtonElement>(null);

  const rename = async (name: string) => {
    setRenameRefusal(null);
    try {
      const renamed = await renamePack.mutateAsync({ packId: pack.id, name });
      showToast(t("vj:packs.toast.renamed", { name: renamed.name }), "success");
      setIsRenaming(false);
      // The field that held focus folds away; focus goes back to its opener.
      renameOpenerRef.current?.focus({ preventScroll: true });
    } catch (cause) {
      setRenameRefusal(cause);
    }
  };

  return (
    <>
      <div className={styles.headerActions}>
        <Button
          ref={renameOpenerRef}
          variant="quiet"
          size="sm"
          aria-expanded={isRenaming}
          onClick={() => {
            setRenameRefusal(null);
            setIsRenaming((wasRenaming) => !wasRenaming);
          }}
        >
          <FiEdit2 aria-hidden="true" fill="none" focusable="false" />
          {t("vj:packs.rename.open")}
        </Button>
        <Button
          variant="quiet"
          size="sm"
          onClick={() => setIsConfirmingDelete(true)}
        >
          <FiTrash2 aria-hidden="true" fill="none" focusable="false" />
          {t("vj:packs.delete.open")}
        </Button>
      </div>
      <div className={styles.headerBelow}>
        <Collapse isOpen={isRenaming}>
          <div className={styles.renameForm}>
            <VjPackNameForm
              initialName={pack.name}
              submitLabel={t("vj:packs.rename.submit")}
              isPending={renamePack.isPending}
              refusal={renameRefusal}
              onSubmit={(name) => void rename(name)}
            />
          </div>
        </Collapse>
        {after}
      </div>
      <AnimatePresence>
        {isConfirmingDelete && (
          <DeletePackDialog
            key="delete-pack"
            pack={pack}
            onClose={() => setIsConfirmingDelete(false)}
            onDeleted={() => {
              setIsConfirmingDelete(false);
              onPackDeleted(pack.id);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/** The count line. A placeholder holds its place until the count is known,
 *  then the number fades in. */
function HeaderMeta({ meta }: { meta: string | null }) {
  const { reducedMotion } = useMotionPrefs();
  const transition = {
    duration: reducedMotion ? 0 : SWAP_SECONDS,
    ease: SWAP_EASE,
  };
  return (
    <AnimatePresence mode="wait" initial={false}>
      {meta === null ? (
        <m.div
          key="meta-pending"
          className={styles.headerMeta}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          <SkeletonLine width="8em" height="1lh" />
        </m.div>
      ) : (
        <m.p
          key="meta"
          className={styles.headerMeta}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          {meta}
        </m.p>
      )}
    </AnimatePresence>
  );
}

/**
 * The main column's head: the pack's name (or All clips), what the list
 * means, its size, and for a pack the Rename pack and Delete pack actions.
 * Switching packs fades one head into the next.
 */
export function VjPackHeader({
  pack,
  libraryClipCount,
  onPackDeleted,
}: VjPackHeaderProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const meta =
    pack === null
      ? libraryClipCount === null
        ? null
        : t("vj:packs.clipCount", { count: libraryClipCount })
      : t("vj:packs.rowMeta", {
          count: pack.clipCount,
          size: formatVjBytes(pack.totalByteSize),
        });

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.header
        key={pack?.id ?? "all-clips"}
        className={styles.header}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: reducedMotion ? 0 : SWAP_SECONDS,
          ease: SWAP_EASE,
        }}
      >
        <div className={styles.headerText}>
          <h2 className={styles.headerTitle}>
            {pack?.name ?? t("vj:packs.allClips")}
          </h2>
          <p className={styles.headerSub}>
            {pack === null ? t("vj:library.sub") : t("vj:pack.sub")}
          </p>
          <HeaderMeta meta={meta} />
        </div>
        {pack !== null && (
          <PackActions
            pack={pack}
            onPackDeleted={onPackDeleted}
            after={
              // Its own full-width row, so the event line never shares its
              // width with the pack buttons.
              <VjPackEventLink pack={pack} />
            }
          />
        )}
      </m.header>
    </AnimatePresence>
  );
}
