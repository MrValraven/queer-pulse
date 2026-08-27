import { FiCheck } from "react-icons/fi";
import { Translation } from "../../i18n/Translation";
import { useTranslation } from "../../i18n/useTranslation";
import { Button } from "./Button";
import { ModalSheet } from "./Modal";
import s from "./ReferenceDigestModal.module.css";

export interface ReferenceDigestPoint {
  titleKey: string;
  bodyKey: string;
}

/**
 * A digest of one destination page, written for the claim or the decision that
 * raised it. Every field is a catalog key so the caller owns the copy.
 */
export interface ReferenceDigestTopic {
  /** Small caps line above the title. */
  eyebrowKey: string;
  /** Plain-text accessible name for the dialog (`titleKey` carries `<em>`). */
  labelKey: string;
  /** Serif display title; its catalog value carries an `<em>` run. */
  titleKey: string;
  leadKey: string;
  paragraphKeys: string[];
  points: ReferenceDigestPoint[];
  /** The full page this digest stands in for. */
  href: string;
  ctaKey: string;
}

/**
 * The dialog behind a reference link that should not cost the reader their
 * place: the About page's position links, and the "how we read these" note
 * above every moderation queue, where leaving the page means leaving a
 * half-made decision. Built on `ModalSheet` for the same reason
 * `GuidelinesModal` is: it rises from the bottom on mobile, centers on desktop,
 * scroll-locks the page behind, traps focus, and scrolls its own body. The
 * footer button is the way out to the full page for anyone who wants it.
 */
export function ReferenceDigestModal({
  topic,
  onClose,
}: {
  topic: ReferenceDigestTopic;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ModalSheet onClose={onClose} wide ariaLabel={t(topic.labelKey)}>
      <div className={s.head}>
        <div className={s.eyebrow}>{t(topic.eyebrowKey)}</div>
        <h2 className={s.title}>
          <Translation i18nKey={topic.titleKey} components={{ em: <em /> }} />
        </h2>
        <p className={s.sub}>{t(topic.leadKey)}</p>
      </div>

      <div className={s.body}>
        {topic.paragraphKeys.map((key) => (
          <p key={key}>{t(key)}</p>
        ))}
      </div>

      <ul className={s.points}>
        {topic.points.map((point) => (
          <li key={point.titleKey} className={s.point}>
            <FiCheck className={s.pointIcon} aria-hidden />
            <div>
              <span className={s.pointTitle}>{t(point.titleKey)}</span>{" "}
              {t(point.bodyKey)}
            </div>
          </li>
        ))}
      </ul>

      <div className={s.footer}>
        <Button variant="primary" to={topic.href}>
          {t(topic.ctaKey)}
        </Button>
      </div>
    </ModalSheet>
  );
}
