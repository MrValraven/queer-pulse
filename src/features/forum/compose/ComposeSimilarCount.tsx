import { AnimatePresence, m, type Transition } from "motion/react";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { Translation } from "../../../shared/i18n/Translation";
import { useFormat } from "../../../shared/i18n/format";
import styles from "./ComposeSimilarThreads.module.css";

/**
 * The "N found" beside the similar-threads heading. It fades in with the
 * first result and out with the last; in between, the number rolls as each
 * debounced search lands.
 */
export function ComposeSimilarCount({
  count,
  transition,
}: {
  /** How many similar threads are showing; zero hides the count. */
  count: number;
  transition: Transition;
}) {
  const format = useFormat();
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          key="count"
          className={styles.count}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          <Translation
            i18nKey="forum:composePage.similar.count"
            values={{ count }}
            slots={{
              formatted: (
                <RollingNumber
                  value={format.number(count)}
                  numericValue={count}
                />
              ),
            }}
          />
        </m.span>
      )}
    </AnimatePresence>
  );
}
