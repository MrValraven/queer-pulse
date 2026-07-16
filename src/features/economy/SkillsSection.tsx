import type { ReactNode } from "react";
import { FiHeart } from "react-icons/fi";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import type { Skill } from "./skills.data";
import { SkillCard } from "./SkillCard";
import styles from "./SkillsPage.module.css";

interface SkillsSectionProps {
  title: ReactNode;
  dotColor: string;
  skills: Skill[];
  /** Copy for the no-results state when a category filter matches nothing. */
  emptyDescription: string;
  onClearFilters: () => void;
}

/**
 * One half of the board — the members teaching, or the members learning. Renders
 * nothing at all when there's no data behind it; the caller decides whether an
 * empty board deserves a page-level empty state instead.
 */
export function SkillsSection({
  title,
  dotColor,
  skills,
  emptyDescription,
  onClearFilters,
}: SkillsSectionProps) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sshDot} style={{ background: dotColor }} />
        <h2>{title}</h2>
      </div>
      <div className={styles.cards}>
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <FadeIn
              key={skill.skill + index}
              className={styles.cardWrap}
              delay={Math.min(index, 8) * 60}
            >
              <SkillCard skill={skill} />
            </FadeIn>
          ))
        ) : (
          <EmptyState
            compact
            icon={<FiHeart />}
            title="Nothing matches your filter"
            description={emptyDescription}
            action={{ label: "Clear filters", onClick: onClearFilters }}
          />
        )}
      </div>
    </div>
  );
}
