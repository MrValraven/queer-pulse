import { useEffect, useRef, useState, type RefObject } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { usePrefersReducedMotion } from "../../../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../../api/subprofiles.adapters";
import { TattooBlock } from "./TattooBlock";
import { TattooPhotoTile } from "./TattooPhotoTile";
import type { TattooBlockProps } from "./tattooView";
import { formatTattooDay } from "./tattooView.helpers";
import styles from "./TattooPortfolio.module.css";

interface StripEdges {
  hasOverflow: boolean;
  isAtStart: boolean;
  isAtEnd: boolean;
}

const STRIP_WITHOUT_OVERFLOW: StripEdges = {
  hasOverflow: false,
  isAtStart: true,
  isAtEnd: true,
};

/** Where the strip sits in its own scroll box. A pixel of slack absorbs
 *  sub-pixel widths, so a strip that fits never reads as overflowing. */
function readStripEdges(strip: HTMLElement): StripEdges {
  const maxScroll = strip.scrollWidth - strip.clientWidth;
  if (maxScroll <= 1) return STRIP_WITHOUT_OVERFLOW;
  return {
    hasOverflow: true,
    isAtStart: strip.scrollLeft <= 1,
    isAtEnd: strip.scrollLeft >= maxScroll - 1,
  };
}

/** Whether the strip overflows and which end it rests at, read again on
 *  every scroll and resize. */
function useStripEdges(
  stripRef: RefObject<HTMLOListElement | null>,
  sessionCount: number,
): StripEdges {
  const [edges, setEdges] = useState<StripEdges>(STRIP_WITHOUT_OVERFLOW);
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return undefined;
    const update = () => {
      const next = readStripEdges(strip);
      setEdges((current) =>
        current.hasOverflow === next.hasOverflow &&
        current.isAtStart === next.isAtStart &&
        current.isAtEnd === next.isAtEnd
          ? current
          : next,
      );
    };
    const frame = requestAnimationFrame(update);
    const observer = new ResizeObserver(update);
    observer.observe(strip);
    strip.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      strip.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [stripRef, sessionCount]);
  return edges;
}

function SessionStrip({ item }: { item: SubprofileItemView }) {
  const { t, language } = useTranslation();
  const sessions = (item.structured?.sessions ?? []).filter(
    (session) => (session?.imageUrl ?? "") !== "",
  );
  const isReducedMotion = usePrefersReducedMotion();
  const stripRef = useRef<HTMLOListElement>(null);
  const { hasOverflow, isAtStart, isAtEnd } = useStripEdges(
    stripRef,
    sessions.length,
  );
  if (sessions.length === 0) return null;
  const scrollStrip = (direction: -1 | 1) => {
    const strip = stripRef.current;
    if (strip) {
      strip.scrollBy({
        left: direction * strip.clientWidth * 0.8,
        behavior: isReducedMotion ? "auto" : "smooth",
      });
    }
  };
  return (
    <div className={styles.stripWrap}>
      <ol
        ref={stripRef}
        className={styles.strip}
        role="region"
        aria-label={t("subprofiles:tattoo.project.sessionsLabel", {
          title: item.title,
        })}
      >
        {sessions.map((session, index) => (
          <li key={`${session.imageUrl}-${index}`} className={styles.stripCell}>
            <TattooPhotoTile
              item={item}
              imageUrl={session.imageUrl}
              alt={`${item.title}: ${t("subprofiles:tattoo.project.session", { number: index + 1 })}`}
              caption={
                <>
                  <span className={styles.itemTitle}>
                    {t("subprofiles:tattoo.project.session", {
                      number: index + 1,
                    })}
                  </span>
                  {session.date ? (
                    <span className={styles.facts}>
                      {formatTattooDay(session.date, language)}
                    </span>
                  ) : null}
                  {session.note ? (
                    <span className={styles.note}>{session.note}</span>
                  ) : null}
                </>
              }
            />
          </li>
        ))}
      </ol>
      {sessions.length > 1 && hasOverflow ? (
        <div className={styles.stripControls}>
          <button
            type="button"
            className={styles.stripButton}
            aria-label={t("subprofiles:tattoo.project.previousSessions")}
            aria-disabled={isAtStart}
            disabled={isAtStart}
            onClick={() => scrollStrip(-1)}
          >
            <FiChevronLeft aria-hidden />
          </button>
          <button
            type="button"
            className={styles.stripButton}
            aria-label={t("subprofiles:tattoo.project.nextSessions")}
            aria-disabled={isAtEnd}
            disabled={isAtEnd}
            onClick={() => scrollStrip(1)}
          >
            <FiChevronRight aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Projects in progress: title, description, then a session strip. */
export function TattooProjects({ view }: TattooBlockProps) {
  const { t } = useTranslation();
  return (
    <TattooBlock
      blockKey="projects"
      heading={t("subprofiles:tattoo.block.projects.heading")}
      hasContent={view.hasContent.projects}
      emptyBodyKey="subprofiles:tattoo.block.projects.empty"
      emptyActionKey="subprofiles:tattoo.block.projects.action"
    >
      <ul className={styles.projectList}>
        {view.itemsBySection.in_progress.map((item) => (
          <li key={item.id} className={styles.project}>
            <h3 className={styles.projectTitle}>{item.title}</h3>
            {item.description ? (
              <p className={styles.intro}>{item.description}</p>
            ) : null}
            <SessionStrip item={item} />
          </li>
        ))}
      </ul>
    </TattooBlock>
  );
}
