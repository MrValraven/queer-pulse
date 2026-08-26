import { FiCheck } from "react-icons/fi";
import { Reveal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AboutLinkTrigger } from "./AboutLinkTrigger";
import type { StandPanel } from "./about.data";
import s from "./AboutPage.module.css";

interface AboutStandPanelProps {
  panel: StandPanel;
  delay: number;
}

/**
 * One full-weight position panel on the About page's "Where we stand" section:
 * a plum surface carrying a title, its paragraphs, and the commitments that
 * position can be held to. The `accent` panel adds a coral edge so the trans
 * position reads as the section's loudest note.
 */
export function AboutStandPanel({ panel, delay }: AboutStandPanelProps) {
  const { t } = useTranslation();
  const className = panel.accent
    ? `${s.standPanel} ${s.standPanelAccent}`
    : s.standPanel;

  return (
    <Reveal className={className} delay={delay}>
      <h3 className={s.standPanelTitle}>{t(panel.titleKey)}</h3>
      {panel.paragraphKeys.map((key) => (
        <p key={key} className={s.standPanelBody}>
          {t(key)}
        </p>
      ))}

      <ul className={s.standCommitments}>
        {panel.commitments.map((commitment) => (
          <li key={commitment.titleKey} className={s.standCommitment}>
            <FiCheck className={s.contrastIconUs} aria-hidden />
            <div>
              <span className={s.standCommitmentTitle}>
                {t(commitment.titleKey)}
              </span>{" "}
              {t(commitment.bodyKey)}{" "}
              {commitment.link && (
                <AboutLinkTrigger
                  topic={commitment.link.topic}
                  className={s.standPanelLink}
                >
                  {t(commitment.link.labelKey)}
                </AboutLinkTrigger>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
