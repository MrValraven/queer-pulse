import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowErrorCode } from "../../../shared/contracts/quizshow";
import { QuizshowCodeForm } from "../player/QuizshowCodeForm";
import { useIsQuizshowVisible } from "../quizshowLaunch";
import { QuizshowMyGames } from "./QuizshowMyGames";
import styles from "./QuizshowGames.module.css";

interface QuizshowPlayHomeProps {
  initialErrorCode: QuizshowErrorCode | null;
  /** The last join failed with no known code, so the generic copy shows. */
  hasUnknownFailure?: boolean;
}

/** The `/play` home: anyone signed in types a code; hosts with Pulse Live also see their games.
 *  The page has no app frame (and an installed app has no Back), so a quiet link leads home. */
export function QuizshowPlayHome({
  initialErrorCode,
  hasUnknownFailure = false,
}: QuizshowPlayHomeProps) {
  const { t } = useTranslation();
  const isQuizshowVisible = useIsQuizshowVisible();
  return (
    <>
      <Link to={routes.feed} className={styles.homeBack}>
        <FiArrowLeft aria-hidden fill="none" />
        {t("quizshow:home.back")}
      </Link>
      <QuizshowCodeForm
        initialErrorCode={initialErrorCode}
        hasUnknownFailure={hasUnknownFailure}
      />
      <Collapse isOpen={isQuizshowVisible}>
        <QuizshowMyGames />
      </Collapse>
    </>
  );
}
