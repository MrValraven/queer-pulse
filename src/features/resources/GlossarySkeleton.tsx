import styles from "./GlossaryPage.module.css";
import { SkeletonLine } from "../../shared/components/ui";

function TermSkeleton() {
  // Mirrors a .term cell: name + type chip row, then two definition lines.
  return (
    <div className={styles.term}>
      <div className={styles.termRow}>
        <SkeletonLine width="45%" height={21} />
        <SkeletonLine width={48} height={16} />
      </div>
      <SkeletonLine width="100%" height={15} style={{ marginTop: 6 }} />
      <SkeletonLine width="80%" height={15} style={{ marginTop: 6 }} />
    </div>
  );
}

/** Two letter blocks of term cells: mirrors the real grouped, 2-column list. */
export function GlossarySkeleton() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, blockIndex) => (
        <div className={styles.letterBlock} key={blockIndex}>
          <SkeletonLine width={64} height={72} style={{ marginBottom: 16 }} />
          <div className={styles.termList}>
            {Array.from({ length: 4 }).map((_, termIndex) => (
              <TermSkeleton key={termIndex} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
