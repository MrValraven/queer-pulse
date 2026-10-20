import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  Button,
  CollapseListItem,
  LoadErrorState,
  Modal,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowStarterPackKey } from "../../../shared/contracts/quizshow";
import { useQuizshowPacks } from "../api/useQuizshowQuiz";
import styles from "./QuizshowImport.module.css";

const FADE_EASE = [0.22, 0.68, 0.16, 1] as const;
const SKELETON_ROW_KEYS = ["first", "second", "third", "fourth"] as const;

/** Swaps a picker's loading, error and list bodies with an opacity fade. */
export function QuizshowPickerFade({
  stateKey,
  children,
}: {
  stateKey: string;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  const transition = { duration: reducedMotion ? 0 : 0.2, ease: FADE_EASE };
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={stateKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

export function QuizshowPickerSkeleton() {
  return (
    <div aria-hidden>
      {SKELETON_ROW_KEYS.map((rowKey) => (
        <div key={rowKey} className={styles.skeletonRow}>
          <SkeletonLine
            height={72}
            style={{ borderRadius: "var(--radius-16)" }}
          />
        </div>
      ))}
    </div>
  );
}

interface QuizshowPackPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onPick: (packKey: QuizshowStarterPackKey) => void;
}

function PackPickerBody({
  onPick,
}: {
  onPick: (packKey: QuizshowStarterPackKey) => void;
}) {
  const { t, language } = useTranslation();
  const packs = useQuizshowPacks({ isEnabled: true });
  if (packs.isError) {
    return (
      <QuizshowPickerFade stateKey="error">
        <LoadErrorState
          compact
          title={t("quizshow:packs.loadError")}
          onRetry={() => void packs.refetch()}
          isRetrying={packs.isFetching}
        />
      </QuizshowPickerFade>
    );
  }
  if (!packs.data) {
    return (
      <QuizshowPickerFade stateKey="loading">
        <QuizshowPickerSkeleton />
      </QuizshowPickerFade>
    );
  }
  return (
    <QuizshowPickerFade stateKey="list">
      <ul className={styles.list}>
        <AnimatePresence initial={false}>
          {packs.data.items.map((pack) => (
            <CollapseListItem key={pack.key}>
              <div className={styles.row}>
                <div className={styles.rowText}>
                  <h3 className={styles.rowTitle}>{pack.title[language]}</h3>
                  <p className={styles.rowMeta}>{pack.description[language]}</p>
                  <p className={styles.rowMeta}>
                    {t("quizshow:packs.rounds", { count: pack.roundCount })}
                    {", "}
                    {t("quizshow:packs.questions", {
                      count: pack.questionCount,
                    })}
                  </p>
                </div>
                <Button size="md" onClick={() => onPick(pack.key)}>
                  {t("quizshow:packs.use")}
                </Button>
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
    </QuizshowPickerFade>
  );
}

export function QuizshowPackPicker({
  isOpen,
  onClose,
  onPick,
}: QuizshowPackPickerProps) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          key="quizshow-pack-picker"
          title={t("quizshow:packs.title")}
          sub={t("quizshow:packs.sub")}
          onClose={onClose}
        >
          <PackPickerBody onPick={onPick} />
        </Modal>
      )}
    </AnimatePresence>
  );
}
