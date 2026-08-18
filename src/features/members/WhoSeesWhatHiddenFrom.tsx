import { useMemo, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import {
  Button,
  MemberSelectList,
  Modal,
  SkeletonLine,
  type MemberSelectPerson,
} from "../../shared/components/ui";
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

/** Modal member-picker for "hide my profile from someone else". A live-only
 *  candidate source: `useMembers` (the same directory-search hook the member
 *  directory page uses), narrowed to `MemberSelectPerson` shape and excluding
 *  the caller and everyone already hidden. Demo cards carry no `firstName`/
 *  `lastName` (see `MemberCard`'s own doc comment); the mock registry fills
 *  that gap so the picker still shows real names in the prototype. */
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
  const { items } = useMembers({});
  const candidates = useMemo<MemberSelectPerson[]>(
    () =>
      items.map((card) => {
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
    [items],
  );
  const [selected] = useState<Set<string>>(new Set());

  return (
    <Modal
      title={t("members:profile.whoSeesWhat.hiddenFrom.pickerTitle")}
      onClose={onClose}
    >
      <MemberSelectList
        people={candidates}
        selected={selected}
        onToggle={(slug) => {
          onHide(slug);
          onClose();
        }}
        multiSelect={false}
        excludeSlugs={excludeSlugs}
        searchPlaceholder={t(
          "members:profile.whoSeesWhat.hiddenFrom.pickerSearchPlaceholder",
        )}
      />
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
        showToast(t("members:profile.whoSeesWhat.hiddenFrom.toast.hidden"), "success"),
      onError: () =>
        showToast(t("members:profile.whoSeesWhat.hiddenFrom.toast.error"), "error"),
    });
  };

  const handleUnhide = (slug: string) => {
    unhideFrom.mutate(slug, {
      onSuccess: () =>
        showToast(t("members:profile.whoSeesWhat.hiddenFrom.toast.unhidden"), "info"),
      onError: () =>
        showToast(t("members:profile.whoSeesWhat.hiddenFrom.toast.error"), "error"),
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
              excludeSlugs={[profile.slug, ...list.map((person) => person.slug)]}
              onClose={() => setPickerOpen(false)}
              onHide={handleHide}
            />
          )}
        </>
      )}
    </section>
  );
}
