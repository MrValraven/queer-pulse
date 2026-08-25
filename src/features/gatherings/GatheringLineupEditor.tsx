import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import {
  Button,
  Modal,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileKind } from "../subprofiles/api/subprofiles.api";
import { useAttendees } from "./api/useAttendees";
import { useEventLineup, useReplaceLineup } from "./api/useEventLineup";
import { LINEUP_ROLES, MAX_LINEUP_ENTRIES } from "./eventLineup.data";
import { GatheringLineupRow, type LineupEditorRow } from "./GatheringLineupRow";
import styles from "./GatheringLineupEditor.module.css";

let seq = 0;
const withUid = (row: Omit<LineupEditorRow, "_uid">): LineupEditorRow => ({
  ...row,
  _uid: `lineup-${seq++}`,
});

/** Only members going to the event are taggable — the lineup picker reuses
 *  the same "going" roster the manage/invite surfaces already fetch, rather
 *  than a general member search this contract doesn't expose. A host wanting
 *  to credit someone who never RSVP'd is a documented follow-up. */
function useLineupCandidates(slug: string): MemberSelectPerson[] {
  const { data } = useAttendees(slug);
  return (data?.going ?? []).map((attendee) => ({
    slug: attendee.slug,
    name: attendee.name,
    pronouns: attendee.pronouns,
  }));
}

/**
 * Host/co-host-only "who performed" lineup section on the gathering detail
 * page: tag attendees with a craft ({@link LINEUP_ROLES}), replace-all saved
 * via `useReplaceLineup`. Backs `GatheringPerformerNudge`'s post-gathering
 * persona prompt (Personas Phase 5, Moment 5) — once the event has ended, a
 * tagged member without a matching persona sees that nudge on this same page.
 * Only mounted by `GatheringPage` when `gathering.viewerIsOrganizer`.
 */
export function GatheringLineupEditor({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: lineup } = useEventLineup(slug);
  const candidates = useLineupCandidates(slug);
  const replaceLineup = useReplaceLineup(slug);

  const [rows, setRows] = useState<LineupEditorRow[] | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Seed local editable rows once the current lineup loads; further server
  // refreshes (e.g. after save) don't clobber in-progress local edits.
  // Adjusted during render (not an effect) so the seed lands in the same
  // commit instead of a follow-up render; the `rows === null` guard makes
  // this a one-time seed, same as the effect it replaces.
  if (rows === null && lineup) {
    setRows(
      lineup.entries.map((entry) =>
        withUid({
          slug: entry.slug,
          name: entry.name,
          avatarUrl: entry.avatarUrl,
          role: (LINEUP_ROLES as string[]).includes(entry.role)
            ? (entry.role as SubprofileKind)
            : LINEUP_ROLES[0]!,
        }),
      ),
    );
  }

  const list = rows ?? [];
  const atCap = list.length >= MAX_LINEUP_ENTRIES;

  function addRow(memberSlug: string) {
    const person = candidates.find(
      (candidate) => candidate.slug === memberSlug,
    );
    if (!person) return;
    setRows((current) => [
      ...(current ?? []),
      withUid({
        slug: person.slug,
        name: person.name,
        avatarUrl: person.avatarUrl ?? null,
        role: LINEUP_ROLES[0]!,
      }),
    ]);
    setDirty(true);
    setPickerOpen(false);
  }

  function changeRole(uid: string, role: SubprofileKind) {
    setRows((current) =>
      (current ?? []).map((row) => (row._uid === uid ? { ...row, role } : row)),
    );
    setDirty(true);
  }

  function removeRow(uid: string) {
    setRows((current) => (current ?? []).filter((row) => row._uid !== uid));
    setDirty(true);
  }

  async function save() {
    try {
      await replaceLineup.mutateAsync(
        list.map((row) => ({ memberSlug: row.slug, role: row.role })),
      );
      setDirty(false);
      showToast(t("gatherings:lineup.savedToast"), "success");
    } catch (error) {
      showToast(
        error instanceof Error && error.message
          ? error.message
          : t("gatherings:lineup.errorToast"),
        "error",
      );
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <div className={styles.panelTitle}>
            {t("gatherings:lineup.title")}
          </div>
          <p className={styles.panelDesc}>
            {t("gatherings:lineup.description")}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => setPickerOpen(true)}
          disabled={atCap}
        >
          <FiPlus size={16} aria-hidden /> {t("gatherings:lineup.addCta")}
        </Button>
      </div>

      {list.length === 0 ? (
        <p className={styles.empty}>{t("gatherings:lineup.empty")}</p>
      ) : (
        <div className={styles.rows}>
          {list.map((row) => (
            <GatheringLineupRow
              key={row._uid}
              row={row}
              onRoleChange={(role) => changeRole(row._uid, role)}
              onRemove={() => removeRow(row._uid)}
            />
          ))}
        </div>
      )}

      {dirty && (
        <div className={styles.saveRow}>
          <Button
            variant="primary"
            onClick={() => void save()}
            disabled={replaceLineup.isPending}
          >
            {replaceLineup.isPending
              ? t("gatherings:lineup.saving")
              : t("gatherings:lineup.saveCta")}
          </Button>
        </div>
      )}

      {pickerOpen && (
        <Modal
          eyebrow={t("gatherings:lineup.title")}
          title={t("gatherings:lineup.pickerTitle")}
          onClose={() => setPickerOpen(false)}
          footer={
            <Button variant="ghost" onClick={() => setPickerOpen(false)}>
              {t("gatherings:manage.cancelCta")}
            </Button>
          }
        >
          <MemberSelectList
            people={candidates}
            selected={new Set<string>()}
            onToggle={addRow}
            multiSelect={false}
            excludeSlugs={list.map((row) => row.slug)}
            searchPlaceholder={t("gatherings:lineup.pickerSearchPlaceholder")}
          />
        </Modal>
      )}
    </section>
  );
}
