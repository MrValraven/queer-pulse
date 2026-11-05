import { AnimatePresence, m } from "motion/react";
import { useId, useMemo, useState, type FormEvent } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjClipDTO, VjPackDTO } from "../../../shared/contracts/vj";
import {
  Button,
  CollapseListItem,
  FormField,
  Select,
} from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMoveVjClip } from "../api/useVjClipMutations";
import {
  useAddVjPackClip,
  useRemoveVjPackClip,
} from "../api/useVjPackMutations";
import { VjReasonLine } from "../VjReasonLine";
import { vjReasonOf } from "../vjErrors";
import styles from "./VjClips.module.css";

/** `--dur-fast`, for the swap between the "No packs" note and the list. */
const SWAP_SECONDS = 0.15;

interface VjClipPacksProps {
  clip: VjClipDTO;
  packs: VjPackDTO[];
  currentPackId: string | null;
}

/**
 * Which packs hold the clip, with Add and Remove per pack, and Move to another
 * pack when the dialog was opened from a pack. A pack that turns out to be
 * gone stays on the list with its reason line until the dialog closes, so
 * the refusal is read where it was sent.
 */
export function VjClipPacks({ clip, packs, currentPackId }: VjClipPacksProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const { reducedMotion } = useMotionPrefs();
  const swapMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reducedMotion ? 0 : SWAP_SECONDS },
  };
  const [gonePacks, setGonePacks] = useState<VjPackDTO[]>([]);

  const shownPacks = useMemo(() => {
    const listed = [...packs];
    for (const gonePack of gonePacks) {
      if (listed.some((pack) => pack.id === gonePack.id)) continue;
      listed.splice(Math.min(gonePack.position, listed.length), 0, gonePack);
    }
    return listed;
  }, [packs, gonePacks]);

  const keepGonePack = (pack: VjPackDTO) => {
    setGonePacks((current) => [
      ...current.filter((gonePack) => gonePack.id !== pack.id),
      pack,
    ]);
  };

  return (
    <section className={styles.dialogSection} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionHeading}>
        {t("vj:packs.heading")}
      </h3>
      <AnimatePresence mode="wait" initial={false}>
        {shownPacks.length === 0 ? (
          <m.p key="packs-none" className={styles.sectionNote} {...swapMotion}>
            {t("vj:clipDialog.packsNone")}
          </m.p>
        ) : (
          <m.ul key="packs" className={styles.packList} {...swapMotion}>
            <AnimatePresence initial={false}>
              {shownPacks.map((pack) => (
                <CollapseListItem key={pack.id}>
                  <VjClipPackRow
                    clip={clip}
                    pack={pack}
                    isGone={!packs.some((listed) => listed.id === pack.id)}
                    onGone={() => keepGonePack(pack)}
                  />
                </CollapseListItem>
              ))}
            </AnimatePresence>
          </m.ul>
        )}
      </AnimatePresence>
      {currentPackId !== null && (
        <VjClipMoveForm
          clip={clip}
          packs={packs}
          currentPackId={currentPackId}
        />
      )}
    </section>
  );
}

interface VjClipPackRowProps {
  clip: VjClipDTO;
  pack: VjPackDTO;
  isGone: boolean;
  onGone: () => void;
}

function VjClipPackRow({ clip, pack, isGone, onGone }: VjClipPackRowProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const addClip = useAddVjPackClip();
  const removeClip = useRemoveVjPackClip();
  const [rowError, setRowError] = useState<unknown>(null);
  const isInPack = clip.packIds.includes(pack.id);
  const isBusy = addClip.isPending || removeClip.isPending;
  const variables = { packId: pack.id, clipId: clip.id };

  const onError = (cause: Error) => {
    setRowError(cause);
    if (vjReasonOf(cause) === "VJ_PACK_NOT_FOUND") onGone();
  };

  const toggle = () => {
    if (isBusy || isGone) return;
    setRowError(null);
    if (isInPack) {
      removeClip.mutate(variables, {
        onSuccess: () =>
          showToast(
            t("vj:clipDialog.toast.removed", {
              title: clip.title,
              pack: pack.name,
            }),
            "success",
          ),
        onError,
      });
      return;
    }
    addClip.mutate(variables, {
      onSuccess: () =>
        showToast(
          t("vj:clipDialog.toast.added", {
            title: clip.title,
            pack: pack.name,
          }),
          "success",
        ),
      onError,
    });
  };

  return (
    <div className={styles.packRow} data-pack-id={pack.id}>
      <div className={styles.packRowMain}>
        <span className={styles.packName}>{pack.name}</span>
        {/* A gone pack keeps its button, blocked, so the row holds still
            while its reason line reads out. */}
        <Button
          size="sm"
          variant={isInPack ? "ghost" : "soft"}
          aria-disabled={isBusy || isGone || undefined}
          onClick={toggle}
        >
          {isInPack
            ? t("vj:clipDialog.removeFromPack", { pack: pack.name })
            : t("vj:clipDialog.addToPack", { pack: pack.name })}
        </Button>
      </div>
      <VjReasonLine error={rowError} />
    </div>
  );
}

interface VjClipMoveFormProps {
  clip: VjClipDTO;
  packs: VjPackDTO[];
  currentPackId: string;
}

/** Moves the clip out of the pack on show and into another one. */
function VjClipMoveForm({ clip, packs, currentPackId }: VjClipMoveFormProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const moveClip = useMoveVjClip();
  const [targetPackId, setTargetPackId] = useState<string | null>(null);
  const options = packs
    .filter((pack) => !clip.packIds.includes(pack.id))
    .map((pack) => ({ value: pack.id, label: pack.name }));
  const targetPack = packs.find((pack) => pack.id === targetPackId);
  const isBlocked = targetPack === undefined || moveClip.isPending;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (targetPack === undefined || moveClip.isPending) return;
    moveClip.mutate(
      { clipId: clip.id, fromPackId: currentPackId, toPackId: targetPack.id },
      {
        onSuccess: () =>
          showToast(
            t("vj:clipDialog.toast.moved", {
              title: clip.title,
              pack: targetPack.name,
            }),
            "success",
          ),
      },
    );
  };

  return (
    <form className={styles.moveForm} onSubmit={submit}>
      <FormField label={t("vj:clipDialog.moveLabel")}>
        <Select
          options={options}
          value={targetPackId}
          placeholder={t("vj:clipDialog.movePlaceholder")}
          disabled={options.length === 0}
          onChange={(value) => {
            setTargetPackId(value);
            if (moveClip.isError) moveClip.reset();
          }}
        />
      </FormField>
      <div className={styles.formActions}>
        <Button
          type="submit"
          size="sm"
          variant="primary"
          aria-disabled={isBlocked || undefined}
        >
          {t("vj:clipDialog.moveSubmit")}
        </Button>
      </div>
      <VjReasonLine error={moveClip.error} />
    </form>
  );
}
