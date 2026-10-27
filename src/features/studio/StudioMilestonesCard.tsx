import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button, Collapse, LoadErrorState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import type { StudioMilestoneView } from "./api/studioDashboard.adapters";
import { useStudioMilestones } from "./api/useStudioMilestones";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioMilestoneRow } from "./StudioMilestoneRow";
import { StudioLine } from "./StudioSkeletons";
import { StudioMilestoneShareDialog } from "./share/StudioMilestoneShareDialog";
import { studioMilestoneTarget } from "./share/studioLinkTarget";
import { milestoneSentenceOf } from "./studioMilestoneSentence";
import { studioReasonCopyKey } from "./studioReason";
import css from "./StudioMilestones.module.css";
import kit from "./studioKit.module.css";

const SKELETON_ROW_COUNT = 3;
/** Rows shown before the "Show all milestones" toggle. */
const MILESTONE_ROWS_SHOWN = 4;
const MILESTONES_WHAT_KEY = "studio:errors.what.milestones";

function StudioMilestonesSkeleton() {
  return (
    <div className={css.skeleton} aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_row, rowIndex) => (
        <StudioLine key={rowIndex} width="70%" height={16} />
      ))}
    </div>
  );
}

/** A persona the member does not own reads as not found. A Retry cannot
 *  change that answer, so this panel offers none. */
function StudioMilestonesNotFound() {
  const { t } = useTranslation();
  return (
    <LoadErrorState
      title={
        <Translation
          i18nKey="studio:errors.load.title"
          components={{ em: <em /> }}
          values={{ what: t(MILESTONES_WHAT_KEY) }}
        />
      }
      description={t(studioReasonCopyKey("notFound", "load"))}
      compact
      className={kit.loadError}
    />
  );
}

/** The reached milestones: the newest few shown, the rest folded behind a
 *  toggle so the card stays short on a phone. Rows that join or leave either
 *  list animate. */
function StudioMilestoneList({
  milestones,
  personaName,
  now,
  onShare,
}: {
  milestones: StudioMilestoneView[];
  personaName: string;
  now: Date;
  onShare: (milestone: StudioMilestoneView) => void;
}) {
  const { t } = useTranslation();
  const restId = useId();
  const [isShowingAll, setIsShowingAll] = useState(false);
  const shownMilestones = milestones.slice(0, MILESTONE_ROWS_SHOWN);
  const restMilestones = milestones.slice(MILESTONE_ROWS_SHOWN);
  // A rest that empties closes, so one that grows back starts folded.
  if (restMilestones.length === 0 && isShowingAll) setIsShowingAll(false);
  const rowOf = (milestone: StudioMilestoneView, index: number) => (
    <StudioMilestoneRow
      key={milestone.id}
      milestone={milestone}
      index={index}
      personaName={personaName}
      now={now}
      onShare={onShare}
    />
  );
  return (
    <>
      <ul className={css.list}>
        <AnimatePresence>{shownMilestones.map(rowOf)}</AnimatePresence>
      </ul>
      <div id={restId}>
        <Collapse isOpen={isShowingAll && restMilestones.length > 0}>
          <ul className={`${css.list} ${css.restList}`}>
            <AnimatePresence initial={false}>
              {restMilestones.map(rowOf)}
            </AnimatePresence>
          </ul>
        </Collapse>
      </div>
      <Collapse isOpen={restMilestones.length > 0}>
        <Button
          className={css.moreToggle}
          variant="quiet"
          size="sm"
          aria-expanded={isShowingAll}
          aria-controls={restId}
          onClick={() => setIsShowingAll((isShowing) => !isShowing)}
        >
          {isShowingAll
            ? t("studio:numbers.milestones.showFewer")
            : t("studio:numbers.milestones.showAll")}
        </Button>
      </Collapse>
    </>
  );
}

/** "Milestones": what one persona has reached, newest first, each one ready
 *  to share as its milestone card. Milestones apply to every artist kind. */
export function StudioMilestonesCard({
  persona,
}: {
  persona: StudioArtistRefView;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const headingId = useId();
  const { milestones, loadState } = useStudioMilestones(persona.id);
  const [sharing, setSharing] = useState<StudioMilestoneView | null>(null);
  const now = new Date();
  const hasMilestones = milestones !== null && milestones.length > 0;
  const sharingSentence = sharing
    ? milestoneSentenceOf(sharing, persona.name, fmt.number)
    : null;
  const sentenceText = sharingSentence
    ? t(sharingSentence.key, sharingSentence.values)
    : "";

  return (
    <section className={css.card} aria-labelledby={headingId}>
      <h2 id={headingId} className={css.heading}>
        {t("studio:numbers.milestones.heading")}
      </h2>
      <p className={css.dek}>{t("studio:numbers.milestones.dek")}</p>
      <Collapse isOpen={loadState.isLoading}>
        <StudioMilestonesSkeleton />
      </Collapse>
      <Collapse
        isOpen={!milestones && (loadState.isError || loadState.isNotFound)}
      >
        {loadState.isNotFound ? (
          <StudioMilestonesNotFound />
        ) : (
          <StudioLoadError loadState={loadState} what={MILESTONES_WHAT_KEY} />
        )}
      </Collapse>
      <Collapse isOpen={milestones?.length === 0}>
        <p className={css.empty}>{t("studio:numbers.milestones.empty")}</p>
      </Collapse>
      {hasMilestones && (
        <StudioMilestoneList
          milestones={milestones}
          personaName={persona.name}
          now={now}
          onShare={setSharing}
        />
      )}
      <AnimatePresence>
        {sharing && (
          <StudioMilestoneShareDialog
            key={sharing.id}
            target={studioMilestoneTarget(persona.id, sharing.id)}
            title={sentenceText}
            onClose={() => setSharing(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
