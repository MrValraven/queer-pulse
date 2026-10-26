import { Link } from "react-router-dom";
import { FiArrowRight, FiPlus } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { resolveText, type Submission } from "./studioProgram.data";
import s from "./StudioProgramPage.module.css";

interface InboxProps {
  inbox: Submission[];
  onSlate: (sub: Submission) => void;
  onPass: (id: string) => void;
  onListen: () => void;
}

/** The right column: submissions waiting to be triaged into the slate. */
export function StudioProgramInbox({
  inbox,
  onSlate,
  onPass,
  onListen,
}: InboxProps) {
  const { t } = useTranslation();
  return (
    <aside className={s.inbox}>
      <div className={s.inboxHead}>
        <h2>
          <Translation
            i18nKey="studio:program.inbox.heading"
            components={{ em: <em /> }}
            values={{ count: inbox.length }}
          />
        </h2>
        <Link to={routes.studioTriage} className={s.triageLink}>
          {t("studio:program.inbox.triageCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>
      <p className={s.inboxTip}>
        <Translation
          i18nKey="studio:program.inbox.tip"
          components={{ em: <em /> }}
        />
      </p>
      <div className={s.subCards}>
        {inbox.map((submission) => (
          <div key={submission.id} className={s.subCard}>
            <div className={s.subCardTop}>
              <span className={s.subCov}>
                <ImageSlot
                  src={submission.image}
                  tint={submission.tint}
                  width={48}
                  height={48}
                  radius={8}
                  placeholder=""
                />
              </span>
              <div className={s.subMeta}>
                <div className={s.subTitle}>
                  {submission.titlePre}
                  {submission.titleEm && <em>{submission.titleEm}</em>}
                </div>
                <div className={s.subWho}>{resolveText(submission.who, t)}</div>
              </div>
            </div>
            <p className={s.subQuote}>{t(submission.quoteKey)}</p>
            <div className={s.subActions}>
              <Button
                variant="quiet"
                size="sm"
                className={s.subBtn}
                onClick={onListen}
              >
                {t("studio:program.inbox.listenCta")}
              </Button>
              <Button
                variant="jade"
                size="sm"
                className={s.subBtn}
                onClick={() => onSlate(submission)}
              >
                <FiPlus aria-hidden /> {t("studio:program.inbox.slateLabel")}
              </Button>
              <Button
                variant="quiet"
                size="sm"
                className={s.subBtn}
                onClick={() => onPass(submission.id)}
              >
                {t("studio:program.inbox.passCta")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
