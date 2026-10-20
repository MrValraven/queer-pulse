import { useId, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { FiAlertCircle } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  Button,
  Collapse,
  FormField,
  Modal,
} from "../../../shared/components/ui";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { useCreateQuizshowGame } from "../api/useQuizshowGames";
import { quizshowGamePath } from "../quizshowPaths";
import styles from "./QuizshowGames.module.css";

interface QuizshowNewGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Open the new game's source picker once it lands (the "Copy a game or event quiz" start). */
  shouldOpenSources: boolean;
}

function NewGameForm({
  onClose,
  shouldOpenSources,
}: Omit<QuizshowNewGameDialogProps, "isOpen">) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const formId = useId();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const createGame = useCreateQuizshowGame();
  const [typedTitle, setTypedTitle] = useState("");
  const [hasTriedBlankTitle, setHasTriedBlankTitle] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const trimmedTitle = typedTitle.trim();
  const isTitleBlank = trimmedTitle.length === 0;
  const isBlocked = isTitleBlank || createGame.isPending;

  async function submitTitle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isTitleBlank) {
      setHasTriedBlankTitle(true);
      return;
    }
    if (createGame.isPending) return;
    setErrorKey(null);
    try {
      const response = await createGame.mutateAsync({
        title: trimmedTitle,
        source: null,
      });
      showToast(t("quizshow:games.new.created"), "success");
      void navigate(quizshowGamePath(response.gameId, { shouldOpenSources }));
      onClose();
    } catch (error) {
      setErrorKey(quizshowErrorKeyOf(quizshowErrorCodeOf(error)));
    }
  }

  return (
    <Modal
      title={t("quizshow:games.new.title")}
      sub={t("quizshow:games.new.sub")}
      onClose={onClose}
      initialFocusRef={titleInputRef}
      footer={
        <div className={styles.dialogFooter}>
          <Button variant="ghost" onClick={onClose}>
            {t("shared:confirmDialog.cancel")}
          </Button>
          <Button type="submit" form={formId} aria-disabled={isBlocked}>
            {t("quizshow:games.new.create")}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        className={styles.dialogForm}
        onSubmit={(event) => void submitTitle(event)}
        noValidate
      >
        <FormField
          label={t("quizshow:games.new.titleLabel")}
          required
          error={
            hasTriedBlankTitle && isTitleBlank
              ? t("quizshow:games.new.titleRequired")
              : undefined
          }
        >
          <input
            ref={titleInputRef}
            type="text"
            value={typedTitle}
            maxLength={QUIZSHOW_LIMITS.quizTitleMax}
            placeholder={t("quizshow:games.new.titlePlaceholder")}
            autoComplete="off"
            enterKeyHint="done"
            onChange={(event) => {
              setTypedTitle(event.target.value);
              setErrorKey(null);
            }}
          />
        </FormField>
        <Collapse isOpen={errorKey !== null}>
          <p className={styles.errorLine} role="alert">
            <FiAlertCircle
              aria-hidden
              fill="none"
              className={styles.errorIcon}
            />
            {errorKey === null ? null : t(errorKey)}
          </p>
        </Collapse>
      </form>
    </Modal>
  );
}

/** Names a new game, creates it, then opens its page. */
export function QuizshowNewGameDialog({
  isOpen,
  onClose,
  shouldOpenSources,
}: QuizshowNewGameDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <NewGameForm
          key="quizshow-new-game"
          onClose={onClose}
          shouldOpenSources={shouldOpenSources}
        />
      )}
    </AnimatePresence>
  );
}
