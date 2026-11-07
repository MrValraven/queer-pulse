import { useEffect, useRef, type JSX } from "react";
import { Collapse } from "../../../../shared/components/ui/Collapse";
import { SearchInput } from "../../../../shared/components/ui/SearchInput";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./VjGrid.module.css";

interface VjGridSearchProps {
  isOpen: boolean;
  query: string;
  onQuery: (query: string) => void;
  /** Escape in the field closes the search. */
  onClose: () => void;
}

/**
 * The pack search above the grid (shown once a pack holds more than 24
 * clips). It folds open with the field focused, and Escape closes it.
 */
export function VjGridSearch({
  isOpen,
  query,
  onQuery,
  onClose,
}: VjGridSearchProps): JSX.Element {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  return (
    <Collapse isOpen={isOpen}>
      <div className={styles.search} data-vj-grid-search="">
        <SearchInput
          value={query}
          onChange={onQuery}
          placeholder={t("vj:grid.searchLabel")}
          ariaLabel={t("vj:grid.searchLabel")}
          inputRef={inputRef}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            onClose();
          }}
        />
      </div>
    </Collapse>
  );
}
