import { Link } from "react-router-dom";
import { Avatar } from "../../../shared/components/ui/Avatar";
import type { QuizshowJoinHost } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { initialsFromName } from "../../../shared/lib/initials";
import { quizshowHostProfilePath } from "../quizshowPaths";
import styles from "./QuizshowPlay.module.css";

/** Who runs this game, shown before a player joins it, with a way to their profile. */
export function QuizshowHostCard({
  host,
  quizTitle,
}: {
  host: QuizshowJoinHost;
  quizTitle: string;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.hostCard}>
      <Avatar
        initials={initialsFromName(host.name, "?")}
        src={host.avatarUrl ?? undefined}
        size={48}
        tint="plum"
      />
      <div className={styles.hostText}>
        <p className={styles.hostQuizTitle}>{quizTitle}</p>
        <p className={styles.hostName}>
          {t("quizshow:player.host.by", { name: host.name })}
        </p>
        <Link
          className={styles.hostLink}
          to={quizshowHostProfilePath(host.memberSlug)}
        >
          {t("quizshow:player.host.profile", { name: host.name })}
        </Link>
        <p className={styles.hint}>{t("quizshow:player.host.hint")}</p>
      </div>
    </section>
  );
}
