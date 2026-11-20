import { useRef, useState, type RefObject } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCalendar, FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ListingOverflowMenu } from "../ListingOverflowMenu";
import { AdminPageHeader } from "../ui";
import type { CulturalGuideDTO } from "./api/culturalProduction.types";
import { useDeleteCulturalGuide } from "./api/useCulturalGuideMutations";
import {
  CULTURAL_EVENT_TYPE_KEY,
  CULTURAL_GUIDE_LOCALE_KEY,
} from "./culturalProductionLabels.data";
import { culturalTabHref } from "./culturalProductionPaths";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import { GuideEditLine } from "./GuideCard";
import styles from "./GuidePage.module.css";

const PAGE_PREFIX = "admin:culturalProduction.guides.page";
const ACTIONS_FADE_SECONDS = 0.18;

/** "Delete guide" behind the overflow menu, through a confirm that names
 *  what stays. A refusal shows inside the confirm; a success toasts and
 *  returns to the Guides tab. */
function GuideDeleteAction({ guide }: { guide: CulturalGuideDTO }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [refusal, setRefusal] = useState<unknown>(null);
  const isSendingRef = useRef(false);
  const deleteGuide = useDeleteCulturalGuide(guide.id);

  function confirmDelete() {
    if (deleteGuide.isPending || isSendingRef.current) return;
    isSendingRef.current = true;
    setRefusal(null);
    deleteGuide.mutate(undefined, {
      onSuccess: () => {
        showToast(t(`${PAGE_PREFIX}.deletedToast`), "success");
        void navigate(culturalTabHref("guides"));
      },
      onError: (cause) => setRefusal(cause),
      onSettled: () => {
        isSendingRef.current = false;
      },
    });
  }

  return (
    <>
      <ListingOverflowMenu
        ariaLabel={t(`${PAGE_PREFIX}.moreActionsLabel`)}
        disabled={deleteGuide.isPending}
        items={[
          {
            key: "delete",
            label: t(`${PAGE_PREFIX}.deleteCta`),
            tone: "danger",
            onSelect: () => {
              setRefusal(null);
              setIsConfirming(true);
            },
          },
        ]}
      />
      <ConfirmDialog
        open={isConfirming}
        tone="destructive"
        title={t(`${PAGE_PREFIX}.deleteConfirmTitle`)}
        description={t(`${PAGE_PREFIX}.deleteConfirmBody`)}
        confirmLabel={t(`${PAGE_PREFIX}.deleteCta`)}
        cancelLabel={t("admin:culturalProduction.common.cancel")}
        loading={deleteGuide.isPending}
        onClose={() => {
          if (!deleteGuide.isPending) setIsConfirming(false);
        }}
        onConfirm={confirmDelete}
      >
        <CulturalRefusalLine error={refusal} />
      </ConfirmDialog>
    </>
  );
}

/**
 * The guide page's header: the event type and language as the eyebrow, the
 * title, the summary and who edited it last. Read mode carries Edit guide,
 * Create tasks for an event and, for a guide the viewer may delete, an
 * overflow with Delete guide; the actions fade away while the editor is
 * open, since the editor has its own Save and Cancel.
 */
export function GuidePageHeader({
  guide,
  isEditing,
  editButtonRef,
  onEdit,
  onCreateTasks,
}: {
  guide: CulturalGuideDTO;
  isEditing: boolean;
  /** Reaches Edit guide, so the page can hand focus back to it when the
   *  editor closes. */
  editButtonRef?: RefObject<HTMLButtonElement | null>;
  onEdit: () => void;
  onCreateTasks: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const transition = {
    duration: isReducedMotion ? 0 : ACTIONS_FADE_SECONDS,
    ease: [0.22, 0.68, 0.16, 1] as const,
  };

  const actions = (
    <AnimatePresence initial={false}>
      {!isEditing && (
        <m.div
          key="actions"
          className={styles.headerActions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition }}
          exit={{ opacity: 0, transition }}
        >
          <Button
            ref={editButtonRef}
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            <FiEdit2 aria-hidden />
            {t(`${PAGE_PREFIX}.editCta`)}
          </Button>
          <Button
            size="sm"
            className={styles.createTasksAction}
            onClick={onCreateTasks}
          >
            <FiCalendar aria-hidden />
            {t(`${PAGE_PREFIX}.createTasksCta`)}
          </Button>
          {guide.canDelete && <GuideDeleteAction guide={guide} />}
        </m.div>
      )}
    </AnimatePresence>
  );

  return (
    <AdminPageHeader
      eyebrow={
        <span className={styles.eyebrow}>
          <span>{t(CULTURAL_EVENT_TYPE_KEY[guide.eventType])}</span>
          <span aria-hidden>·</span>
          <span>{t(CULTURAL_GUIDE_LOCALE_KEY[guide.locale])}</span>
        </span>
      }
      title={guide.title}
      sub={
        <span className={styles.headerSub}>
          {guide.summary !== "" && (
            <span className={styles.headerSummary}>{guide.summary}</span>
          )}
          <GuideEditLine guide={guide} className={styles.headerEditLine} />
        </span>
      }
      actions={actions}
    />
  );
}
