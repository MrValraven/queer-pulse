import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
} from "react";
import { FiX } from "react-icons/fi";
import {
  Button,
  IconButton,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useConnectionsSearch } from "../../connect/api/useConnectionsSearch";
import { InviteMembersListFooter } from "../../gatherings/InviteMembersListFooter";
import { ForumAvatar } from "../ForumAuthor";
import type { ComposeCoAuthorOption } from "./ComposePostingAs";
import styles from "./ComposePostingAs.module.css";

// ── "Write it with someone" ─────────────────────────────────────────────────
// The picker shares a sticky rail with the preview card, so it stays small:
// once somebody is credited it folds to one row naming them, with Change and
// Remove beside the name, and the search with its short list opens only while
// nobody is credited or the member asked to change who is. Once the search
// has focus it counts as changing, so a credit restored from a draft while the
// member is typing never folds the search away under them. With nobody
// credited the list under the search stays folded too, until the member
// focuses the search or types in it, so the preview card below keeps its room.

/** Where focus goes after the picker swaps between its two shapes, so a
 *  keyboard user never lands on a control that just unmounted. */
type PendingFocus = "change" | "search" | null;

/**
 * Who else the post credits. Hidden while posting anonymously. Co-authors are
 * the member's own connections. That is the whole population a co-written
 * post can credit: the handle is resolved server-side and a stranger would be
 * a 400, so the picker offers connections only.
 */
export function CoAuthorPicker({
  coAuthorSlug,
  coAuthor,
  onCoAuthorChange,
}: {
  coAuthorSlug: string | null;
  /** The credited person, kept by the caller so the name survives a search
   *  that no longer returns them. Set whenever `coAuthorSlug` is, as `@slug`
   *  until a restored credit's name arrives. */
  coAuthor: ComposeCoAuthorOption | null;
  onCoAuthorChange: (coAuthor: ComposeCoAuthorOption | null) => void;
}) {
  const { t } = useTranslation();
  const coAuthorLabelId = useId();
  const [isChanging, setIsChanging] = useState(false);
  const pendingFocusRef = useRef<PendingFocus>(null);
  const changeButtonRef = useRef<HTMLButtonElement>(null);
  const searchSlotRef = useRef<HTMLDivElement>(null);
  const isSearchShown = coAuthor === null || isChanging;

  useEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (pendingFocus === "change") changeButtonRef.current?.focus();
    if (pendingFocus === "search")
      searchSlotRef.current?.querySelector("input")?.focus();
  }, [isSearchShown]);

  const choose = (nextCoAuthor: ComposeCoAuthorOption | null) => {
    pendingFocusRef.current = nextCoAuthor ? "change" : "search";
    setIsChanging(false);
    onCoAuthorChange(nextCoAuthor);
  };
  const keep = () => {
    pendingFocusRef.current = "change";
    setIsChanging(false);
  };

  return (
    <div className={styles.coAuthor}>
      <span className={styles.optionText}>
        <span className={styles.optionLabel} id={coAuthorLabelId}>
          {t("forum:composePage.postingAs.coAuthorLabel")}
        </span>
        <span className={styles.optionHint}>
          {t("forum:composePage.postingAs.coAuthorHint")}
        </span>
      </span>
      <div role="group" aria-labelledby={coAuthorLabelId}>
        {coAuthor === null || isChanging ? (
          <div
            ref={searchSlotRef}
            className={styles.coAuthorSearch}
            onFocus={() => setIsChanging(true)}
          >
            <CoAuthorSearch
              coAuthorSlug={coAuthorSlug}
              coAuthor={coAuthor}
              onChoose={choose}
              onKeep={keep}
            />
            {coAuthor && (
              <Button
                variant="ghost"
                size="sm"
                className={styles.coAuthorKeep}
                onClick={keep}
              >
                {t("forum:composePage.postingAs.coAuthorKeep", {
                  name: coAuthor.name,
                })}
              </Button>
            )}
          </div>
        ) : (
          <div className={styles.coAuthorChosen}>
            <ForumAvatar
              className={styles.coAuthorAvatar}
              person={{
                initials: coAuthor.initials,
                name: coAuthor.name,
                photo: coAuthor.photo,
              }}
            />
            <span className={styles.coAuthorName}>{coAuthor.name}</span>
            <Button
              ref={changeButtonRef}
              variant="ghost"
              size="sm"
              onClick={() => {
                pendingFocusRef.current = "search";
                setIsChanging(true);
              }}
            >
              {t("forum:composePage.postingAs.coAuthorChange")}
            </Button>
            <IconButton
              size="sm"
              aria-label={t("forum:composePage.postingAs.coAuthorRemove", {
                name: coAuthor.name,
              })}
              onClick={() => choose(null)}
            >
              <FiX aria-hidden />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The search box over a short list of connections. The search runs on the
 * server across every page of connections, the same path as the cohost picker
 * (`CohostInvitePickStep`), so connection 21 and beyond can be credited. Demo
 * mode takes the same path, since `useConnectionsList` serves and searches the
 * demo connections itself. The credited person shows here only while the
 * member is changing who it is, as the ticked row, so tapping them keeps them
 * and folds the picker back. Removing the credit is the folded row's X.
 */
function CoAuthorSearch({
  coAuthorSlug,
  coAuthor,
  onChoose,
  onKeep,
}: {
  coAuthorSlug: string | null;
  coAuthor: ComposeCoAuthorOption | null;
  onChoose: (coAuthor: ComposeCoAuthorOption) => void;
  onKeep: () => void;
}) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { pickerRef, isEngaged, handleFocus, handleBlur } =
    usePickerEngagement();
  // Changing an existing credit always lists the rows, with the credited
  // person ticked; otherwise they wait for the member to reach for the search.
  const isListShown =
    coAuthor !== null || isEngaged || searchQuery.trim() !== "";
  const connectionsSearch = useConnectionsSearch(searchQuery);
  const { views: connections, isSearchPending } = connectionsSearch;

  const options = useMemo<ComposeCoAuthorOption[]>(
    () =>
      connections.map((connection) => ({
        slug: connection.slug,
        name: connection.name,
        initials: connection.initials,
        ...(connection.photo ? { photo: connection.photo } : {}),
      })),
    [connections],
  );
  const people = useMemo<MemberSelectPerson[]>(
    () => options.map(toMemberSelectPerson),
    [options],
  );
  const pinnedPeople = useMemo<MemberSelectPerson[]>(
    () => (coAuthor ? [toMemberSelectPerson(coAuthor)] : []),
    [coAuthor],
  );
  const selected = useMemo(
    () => new Set(coAuthorSlug ? [coAuthorSlug] : []),
    [coAuthorSlug],
  );

  const toggle = (candidateSlug: string) => {
    if (candidateSlug === coAuthorSlug) {
      onKeep();
      return;
    }
    const option = options.find(
      (candidate) => candidate.slug === candidateSlug,
    );
    if (option) onChoose(option);
  };

  return (
    <div ref={pickerRef} onFocus={handleFocus} onBlur={handleBlur}>
      <MemberSelectList
        isListHidden={!isListShown}
        people={people}
        pinnedPeople={pinnedPeople}
        selected={selected}
        multiSelect={false}
        selectedIndicator="radio"
        isCompact
        onToggle={toggle}
        searchPlaceholder={t("forum:composePage.postingAs.coAuthorSearch")}
        searchAriaLabel={t("forum:composePage.postingAs.coAuthorSearch")}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearchPending && searchQuery.trim() !== ""}
        emptyHint={
          isSearchPending
            ? t("forum:composePage.postingAs.coAuthorLoading")
            : t("forum:composePage.postingAs.coAuthorEmpty")
        }
        emptyMessage={
          connectionsSearch.isError
            ? t("forum:composePage.postingAs.coAuthorLoadError")
            : undefined
        }
        listFooter={<InviteMembersListFooter connections={connectionsSearch} />}
      />
    </div>
  );
}

/**
 * Whether the member is using the co-author search: from the moment focus
 * enters it until focus leaves the whole picker. Tabbing from the search into
 * the rows stays inside, so it counts as staying. A press counts as staying
 * until its click lands, then a click outside ends it: Safari leaves a
 * clicked button unfocused, and folding the rows on that early blur would
 * pull them from under the pointer and shift whatever sits below them.
 */
function usePickerEngagement() {
  const pickerRef = useRef<HTMLDivElement>(null);
  const isPressingRef = useRef(false);
  const [isEngaged, setIsEngaged] = useState(false);

  useEffect(() => {
    if (!isEngaged) return;
    const markPressing = () => {
      isPressingRef.current = true;
    };
    const clearPressing = () => {
      isPressingRef.current = false;
    };
    const settleClick = (event: MouseEvent) => {
      isPressingRef.current = false;
      const picker = pickerRef.current;
      const isOutside =
        event.target instanceof Node && !picker?.contains(event.target);
      if (isOutside) setIsEngaged(false);
    };
    document.addEventListener("pointerdown", markPressing, true);
    document.addEventListener("pointercancel", clearPressing, true);
    document.addEventListener("click", settleClick, true);
    return () => {
      isPressingRef.current = false;
      document.removeEventListener("pointerdown", markPressing, true);
      document.removeEventListener("pointercancel", clearPressing, true);
      document.removeEventListener("click", settleClick, true);
    };
  }, [isEngaged]);

  const handleFocus = () => setIsEngaged(true);
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocus = event.relatedTarget;
    if (nextFocus instanceof Node && event.currentTarget.contains(nextFocus))
      return;
    if (isPressingRef.current) return;
    setIsEngaged(false);
  };

  return { pickerRef, isEngaged, handleFocus, handleBlur };
}

function toMemberSelectPerson(
  option: ComposeCoAuthorOption,
): MemberSelectPerson {
  return { slug: option.slug, name: option.name, avatarUrl: option.photo };
}
