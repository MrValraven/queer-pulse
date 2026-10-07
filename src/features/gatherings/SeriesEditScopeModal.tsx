import { Button, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SeriesScope } from "./api/events.api";
import styles from "./GatheringModals.module.css";

/** What the prompt asks about: a cancel, a full edit, or one field's edit. */
export type SeriesScopePromptMode = "edit" | "editField" | "cancel";

/**
 * MSG-10: asks a host whether an edit or cancel on a recurring gathering
 * applies to just this occurrence or to it and every future one in the
 * series. Shown by `ManageGatheringPage` and `GatheringHostBar` for a
 * gathering with a real `GatheringDetail.series`: right after a save (edit),
 * and as the cancel confirm itself (cancel).
 *
 * The server copies what an edit's patch carries, except the start and end,
 * onto every future date, so the sub copy names what the patch carries:
 *
 * - `"edit"`: the full edit modal's patch (`buildEditPatch`). It always
 *   carries the title, description, audience, format, care and RSVP
 *   settings, and the place, cover, cost, capacity and community only when
 *   the host changed them. The sub lists them, since "future" replaces care
 *   a host set on those dates one by one.
 * - `"editField"`: one focused editor's patch (`buildFieldEditPatch`, or the
 *   venue editor's venue and listing link). It carries that one field, so
 *   the sub speaks of "this change". The title and both choices read as the
 *   edit ones.
 */
export function SeriesEditScopeModal({
  mode,
  onChoose,
  onClose,
}: {
  mode: SeriesScopePromptMode;
  onChoose: (scope: SeriesScope) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const prefix =
    mode === "cancel"
      ? "gatherings:manage.seriesScope.cancel"
      : "gatherings:manage.seriesScope.edit";
  const subKey =
    mode === "editField"
      ? "gatherings:manage.seriesScope.editField.sub"
      : `${prefix}.sub`;
  return (
    <Modal
      eyebrow={t("gatherings:manage.seriesScope.eyebrow")}
      title={
        <Translation i18nKey={`${prefix}.title`} components={{ em: <em /> }} />
      }
      sub={t(subKey)}
      onClose={onClose}
      footer={
        <Button variant="ghost" onClick={onClose}>
          {t("gatherings:manage.cancelCta")}
        </Button>
      }
    >
      <div className={styles.fields}>
        <Button
          variant="ghost"
          className={styles.full}
          onClick={() => onChoose("this")}
        >
          {t(`${prefix}.thisCta`)}
        </Button>
        <Button
          variant="primary"
          className={styles.full}
          onClick={() => onChoose("future")}
        >
          {t(`${prefix}.futureCta`)}
        </Button>
      </div>
    </Modal>
  );
}
