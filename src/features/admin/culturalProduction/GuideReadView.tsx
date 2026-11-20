import type { MouseEvent } from "react";
import { FiBookOpen } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminEmptyState, AdminPanel } from "../ui";
import type {
  CulturalGuideDTO,
  CulturalGuideSectionDTO,
} from "./api/culturalProduction.types";
import { GuideBodyText } from "./GuideBodyText";
import { GuideChecklist } from "./GuideChecklist";
import styles from "./GuidePage.module.css";

const PAGE_PREFIX = "admin:culturalProduction.guides.page";

/** The id a section's heading carries, so the contents list can point at it. */
const sectionAnchorOf = (section: CulturalGuideSectionDTO): string =>
  `guide-section-${section.id}`;

/**
 * The guide's section headings as in-page links. A press scrolls to the
 * section and moves focus onto its heading, so a keyboard or screen reader
 * user carries on reading from there.
 */
function GuideContents({ sections }: { sections: CulturalGuideSectionDTO[] }) {
  const { t } = useTranslation();
  const { reducedMotion: isReducedMotion } = useMotionPrefs();

  const jumpTo = (event: MouseEvent<HTMLAnchorElement>, anchor: string) => {
    const heading = document.getElementById(anchor);
    if (heading === null) return;
    event.preventDefault();
    heading.scrollIntoView({
      behavior: isReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    heading.focus({ preventScroll: true });
  };

  return (
    <nav
      className={styles.contents}
      aria-label={t(`${PAGE_PREFIX}.contentsLabel`)}
    >
      <p className={styles.contentsLabel} aria-hidden>
        {t(`${PAGE_PREFIX}.contentsLabel`)}
      </p>
      <ol className={styles.contentsList}>
        {sections.map((section) => {
          const anchor = sectionAnchorOf(section);
          return (
            <li key={section.id}>
              <a
                href={`#${anchor}`}
                className={styles.contentsLink}
                onClick={(event) => jumpTo(event, anchor)}
              >
                {section.heading}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * A guide as a calm document: the section headings in a contents list
 * (sticky in a side column on a wide screen), then each section as a panel
 * with its heading, its text and its checklist. A guide with no sections
 * says so and points at the editor.
 */
export function GuideReadView({ guide }: { guide: CulturalGuideDTO }) {
  const { t } = useTranslation();
  if (guide.sections.length === 0) {
    return (
      <AdminEmptyState
        icon={FiBookOpen}
        title={t(`${PAGE_PREFIX}.noSections`)}
        size="inline"
      />
    );
  }
  return (
    <div className={styles.readView}>
      <aside className={styles.contentsColumn}>
        <GuideContents sections={guide.sections} />
      </aside>
      <div className={styles.sections}>
        {guide.sections.map((section) => (
          <AdminPanel
            key={section.id}
            title={section.heading}
            titleId={sectionAnchorOf(section)}
            isTitleFocusable
            className={styles.section}
          >
            <div className={styles.sectionBody}>
              <GuideBodyText body={section.body} />
              <GuideChecklist steps={section.steps} />
            </div>
          </AdminPanel>
        ))}
      </div>
    </div>
  );
}
