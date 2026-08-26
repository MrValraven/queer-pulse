import { FiCheck } from "react-icons/fi";
import { Button, ModalSheet } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ABOUT_LINK_TOPICS, type AboutLinkTopicId } from "./aboutLinks.data";
import s from "./AboutLinkModal.module.css";

interface AboutLinkModalProps {
  topic: AboutLinkTopicId;
  onClose: () => void;
}

/**
 * The dialog behind every reference link on the About page: a digest of the
 * page that link points at, written for the claim that raised it, closing on a
 * button to the full page. Built on `ModalSheet` for the same reason
 * `GuidelinesModal` is: it rises from the bottom on mobile, centers on desktop,
 * scroll-locks the page behind, traps focus, and scrolls its own body. A reader
 * working through the positions can check what backs one up without losing
 * their place in the argument.
 */
export function AboutLinkModal({ topic, onClose }: AboutLinkModalProps) {
  const { t } = useTranslation();
  const entry = ABOUT_LINK_TOPICS[topic];

  return (
    <ModalSheet onClose={onClose} wide ariaLabel={t(entry.labelKey)}>
      <div className={s.head}>
        <div className={s.eyebrow}>{t(entry.eyebrowKey)}</div>
        <h2 className={s.title}>
          <Translation i18nKey={entry.titleKey} components={{ em: <em /> }} />
        </h2>
        <p className={s.sub}>{t(entry.leadKey)}</p>
      </div>

      <div className={s.body}>
        {entry.paragraphKeys.map((key) => (
          <p key={key}>{t(key)}</p>
        ))}
      </div>

      <ul className={s.points}>
        {entry.points.map((point) => (
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
        <Button variant="primary" to={entry.href}>
          {t(entry.ctaKey)}
        </Button>
      </div>
    </ModalSheet>
  );
}
