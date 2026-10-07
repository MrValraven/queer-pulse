import { useEffect, type KeyboardEventHandler, type RefObject } from "react";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { MdQrCodeScanner } from "react-icons/md";
import { Button } from "../../../shared/components/ui/Button";
import { SearchInput } from "../../../shared/components/ui/SearchInput";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./CheckinTab.module.css";

/** The backend refuses a longer `q` with a 400. */
const SEARCH_MAX_LENGTH = 100;

interface CheckinToolbarProps {
  /** Owned by the tab, which moves focus here after clearing a search. */
  searchInputRef: RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (query: string) => void;
  canScan: boolean;
  onScan: () => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
}

function isTypingTarget(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  if (element.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName);
}

/**
 * Search, scan and focus mode in one row. `/` jumps to the search field from
 * anywhere on the tab, and a mouse or trackpad user lands in it on arrival.
 */
export function CheckinToolbar({
  searchInputRef,
  query,
  onQueryChange,
  canScan,
  onScan,
  isFocusMode,
  onToggleFocusMode,
}: CheckinToolbarProps) {
  const { t } = useTranslation();

  // SearchInput has no `maxLength` prop, so the cap is set on the field
  // itself. The toolbar remounts with focus mode, and this runs again.
  // `data-checkin-search` lets the guest list find this field as its
  // keyboard-focus fallback.
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.maxLength = SEARCH_MAX_LENGTH;
      searchInputRef.current.dataset.checkinSearch = "true";
    }
  }, [searchInputRef]);

  useEffect(() => {
    if (!window.matchMedia?.("(pointer: fine)").matches) return;
    // A dialog owns focus while it is open.
    if (document.querySelector('[aria-modal="true"]')) return;
    // Keyboard focus elsewhere (the Manage tablist, arrowed onto this tab)
    // stays where the host put it.
    const activeElement = document.activeElement;
    if (activeElement !== null && activeElement !== document.body) {
      let isKeyboardFocusElsewhere: boolean;
      try {
        isKeyboardFocusElsewhere = activeElement.matches(":focus-visible");
      } catch {
        // An engine without `:focus-visible` support: focus alone decides.
        isKeyboardFocusElsewhere = true;
      }
      if (isKeyboardFocusElsewhere) return;
    }
    searchInputRef.current?.focus();
  }, [searchInputRef]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(document.activeElement)) return;
      // The scanner dialog owns the keyboard while it is open.
      if (document.querySelector('[aria-modal="true"]')) return;
      event.preventDefault();
      searchInputRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchInputRef]);

  // Chrome and Safari clear a search field on Escape and Firefox does not, so
  // the toolbar clears it for every browser. preventDefault keeps the native
  // clear from running too and tells useFocusMode the key is spent. On an
  // empty field Escape passes through and leaves focus mode. During IME
  // composition Escape belongs to the composition alone.
  const handleSearchKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
    if (query === "") return;
    event.preventDefault();
    onQueryChange("");
  };

  return (
    <div className={styles.toolbarSticky}>
      <div className={styles.toolbar}>
        <SearchInput
          className={styles.search}
          inputRef={searchInputRef}
          value={query}
          onChange={onQueryChange}
          onKeyDown={handleSearchKeyDown}
          ariaLabel={t("gatherings:checkin.toolbar.searchLabel")}
          placeholder={t("gatherings:checkin.toolbar.searchPlaceholder")}
        />
        {canScan && (
          <Button
            variant="primary"
            className={styles.scanInRow}
            onClick={onScan}
          >
            <MdQrCodeScanner aria-hidden="true" />
            {t("gatherings:checkin.toolbar.scanCta")}
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={onToggleFocusMode}
          data-checkin-focus-toggle=""
        >
          {isFocusMode ? (
            <FiMinimize2 aria-hidden="true" />
          ) : (
            <FiMaximize2 aria-hidden="true" />
          )}
          <span className={styles.focusLabel}>
            {isFocusMode
              ? t("gatherings:checkin.toolbar.exitFocusCta")
              : t("gatherings:checkin.toolbar.focusCta")}
          </span>
        </Button>
      </div>
    </div>
  );
}
