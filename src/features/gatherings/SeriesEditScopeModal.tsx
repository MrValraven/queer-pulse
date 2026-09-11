import { Button, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SeriesScope } from "./api/events.api";
import styles from "./GatheringModals.module.css";

/**
 * MSG-10: asks a host whether an edit or cancel on a recurring gathering
 * applies to just this occurrence or to it and every future one in the
 * series. Shown by `ManageGatheringPage` and `GatheringHostBar` right after a
 * save (edit) or in place of the plain confirm (cancel) for a gathering with a
 * real `GatheringDetail.series`.
 *
 * An edit's stashed patch (`buildEditPatch`) always carries the title,
 * description, place, audience, format, care and RSVP settings, and carries
 * the cover, cost and community only when the host changed them. The server
 * copies what the patch carries, except the start and end, onto every future
 * date. The edit sub copy says so, since "future" replaces care a host set on
 * those dates one by one.
 */
export function SeriesEditScopeModal({
  mode,
  onChoose,
  onClose,
}: {
  mode: "edit" | "cancel";
  onChoose: (scope: SeriesScope) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const prefix =
    mode === "cancel"
      ? "gatherings:manage.seriesScope.cancel"
      : "gatherings:manage.seriesScope.edit";
  return (
    <Modal
      eyebrow={t("gatherings:manage.seriesScope.eyebrow")}
      title={
        <Translation i18nKey={`${prefix}.title`} components={{ em: <em /> }} />
      }
      sub={t(`${prefix}.sub`)}
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
