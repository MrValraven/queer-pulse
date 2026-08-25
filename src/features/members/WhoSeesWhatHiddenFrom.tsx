import { useMemo, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import {
  Button,
  MemberIdentity,
  Modal,
  SearchInput,
  SkeletonLine,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMembers } from "./api/useMembers";
import { MEMBERS as MEMBER_REGISTRY } from "./data/members";
import {
  useHiddenFromList,
  useHideFrom,
  useUnhideFrom,
  type HiddenFromEntry,
} from "./api/useHiddenFrom";
import styles from "./WhoSeesWhatSheet.module.css";

/** One person this member is currently hidden from, with an "undo" action. */
function HiddenFromRow({
  person,
  onRemove,
  removing,
}: {
  person: HiddenFromEntry;
  onRemove: () => void;
  removing: boolean;
}) {
  const { t } = useTranslation();
  const name = `${person.firstName} ${person.lastName}`.trim();
  return (
    <div className={styles.row}>
      <div className={styles.rowTitle}>{name}</div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={removing}
        // WCAG 2.5.3 Label in Name: the catalog copy for this key must START
        // with the same word as the visible "remove" label below (e.g.
        // "Remove {name}"), not replace it with unrelated wording, so a
        // voice-control/screen-reader user saying the visible label still
        // matches the accessible name.
        aria-label={t("members:profile.whoSeesWhat.hiddenFrom.removeAria", {
          name,
        })}
      >
        <FiX aria-hidden /> {t("members:profile.whoSeesWhat.hiddenFrom.remove")}
      </Button>
    </div>
  );
}

/**
 * Modal member-picker for "hide my profile from someone else".
 *
 * The search box drives `GET /members?query=`, debounced, rather than filtering
 * an already-fetched array. It used to call `useMembers({})` and let a
 * client-side filter search page 1 — twenty people, on a directory the backend
 * pages at twenty. On any community larger than that the person you needed to
 * hide from usually could not be found at all, which defeats the point of a
 * safety control. "Load more" walks the remaining pages for the same reason.
 *
 * Demo cards carry no `firstName`/`lastName` (see `MemberCard`'s own doc
 * comment); the mock registry fills that gap so the picker still shows real
 * names in the prototype.
 */
function HiddenFromPicker({
  excludeSlugs,
  onClose,
  onHide,
}: {
  excludeSlugs: string[];
  onClose: () => void;
  onHide: (slug: string) => void;
}) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebouncedValue(searchText.trim(), 300);
  const { items, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMembers(debouncedSearch ? { query: debouncedSearch } : {});
  const excluded = useMemo(() => new Set(excludeSlugs), [excludeSlugs]);

  const candidates = useMemo<MemberSelectPerson[]>(
    () =>
      items
        .filter((card) => !excluded.has(card.slug))
        .map((card) => {
          const registryMember = MEMBER_REGISTRY[card.slug];
          const name =
            card.firstName || card.lastName
              ? `${card.firstName ?? ""} ${card.lastName ?? ""}`.trim()
              : registryMember
                ? `${registryMember.first} ${registryMember.last}`
                : card.slug;
          return {
            slug: card.slug,
            name,
            avatarUrl: card.avatarUrl ?? undefined,
          };
        }),
    [items, excluded],
  );

  return (
    <Modal
      title={t("members:profile.whoSeesWhat.hiddenFrom.pickerTitle")}
      onClose={onClose}
    >
      <SearchInput
        value={searchText}
        onChange={setSearchText}
        placeholder={t(
          "members:profile.whoSeesWhat.hiddenFrom.pickerSearchPlaceholder",
        )}
      />
      {isLoading ? (
        <SkeletonLine width="70%" style={{ marginTop: 12 }} />
      ) : candidates.length === 0 ? (
        <p className={styles.emptyLine}>
          {t("members:profile.whoSeesWhat.hiddenFrom.pickerNoResults")}
        </p>
      ) : (
        <div className={styles.pickerList} role="listbox">
          {candidates.map((person) => (
            <button
              key={person.slug}
              type="button"
              role="option"
              aria-selected={false}
              className={styles.pickerRow}
              onClick={() => {
                onHide(person.slug);
                onClose();
              }}
            >
              <MemberIdentity person={person} size={38} />
            </button>
          ))}
        </div>
      )}
      {hasNextPage && (
        <Button
          variant="ghost"
          size="sm"
          className={styles.pickerMore}
          onClick={fetchNextPage}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage
            ? t("members:profile.whoSeesWhat.hiddenFrom.pickerLoadingMore")
            : t("members:profile.whoSeesWhat.hiddenFrom.pickerLoadMore")}
        </Button>
      )}
    </Modal>
  );
}

/**
 * Who this member has individually hidden their own profile from, plus the
 * action to hide it from one more person. Demo mode has no per-viewer "hidden
 * from" relationship to simulate, so it shows an explanatory note instead of
 * the interactive list/picker rather than pretending the toggle does
 * something.
 */
export function WhoSeesWhatHiddenFrom() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { profile } = useProfileData();
  const { showToast } = useToast();
  const { data: hiddenFrom, isLoading } = useHiddenFromList();
  const hideFrom = useHideFrom();
  const unhideFrom = useUnhideFrom();
  const [pickerOpen, setPickerOpen] = useState(false);

  const list = hiddenFrom ?? [];

  const handleHide = (slug: string) => {
    hideFrom.mutate(slug, {
      onSuccess: () =>
        showToast(
          t("members:profile.whoSeesWhat.hiddenFrom.toast.hidden"),
          "success",
        ),
      onError: () =>
        showToast(
          t("members:profile.whoSeesWhat.hiddenFrom.toast.error"),
          "error",
        ),
    });
  };

  const handleUnhide = (slug: string) => {
    unhideFrom.mutate(slug, {
      onSuccess: () =>
        showToast(
          t("members:profile.whoSeesWhat.hiddenFrom.toast.unhidden"),
          "info",
        ),
      onError: () =>
        showToast(
          t("members:profile.whoSeesWhat.hiddenFrom.toast.error"),
          "error",
        ),
    });
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("members:profile.whoSeesWhat.hiddenFrom.heading")}
      </h3>
      <p className={styles.sectionSub}>
        {t("members:profile.whoSeesWhat.hiddenFrom.sub")}
      </p>

      {demoMode ? (
        <p className={styles.emptyLine}>
          {t("members:profile.whoSeesWhat.hiddenFrom.demoNote")}
        </p>
      ) : (
        <>
          {isLoading && <SkeletonLine width="70%" />}
          {!isLoading && list.length === 0 && (
            <p className={styles.emptyLine}>
              {t("members:profile.whoSeesWhat.hiddenFrom.empty")}
            </p>
          )}
          {!isLoading && list.length > 0 && (
            <div className={styles.rowList}>
              {list.map((person) => (
                <HiddenFromRow
                  key={person.slug}
                  person={person}
                  removing={unhideFrom.isPending}
                  onRemove={() => handleUnhide(person.slug)}
                />
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={styles.addRow}
            onClick={() => setPickerOpen(true)}
          >
            <FiPlus aria-hidden />
            {t("members:profile.whoSeesWhat.hiddenFrom.addButton")}
          </Button>
          {pickerOpen && (
            <HiddenFromPicker
              excludeSlugs={[
                profile.slug,
                ...list.map((person) => person.slug),
              ]}
              onClose={() => setPickerOpen(false)}
              onHide={handleHide}
            />
          )}
        </>
      )}
    </section>
  );
}
