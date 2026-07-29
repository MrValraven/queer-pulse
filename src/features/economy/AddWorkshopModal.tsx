import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import type { WorkshopDraft } from "./addWorkshop.build";
import { workshopToDraft } from "./api/workshops.adapters";
import type { Workshop } from "./workshops.data";
import { WorkshopDraftFields } from "./WorkshopDraftFields";
import { EMPTY_WORKSHOP_DRAFT } from "./workshopDraft.data";
import { useAddWorkshopFlow } from "./useAddWorkshopFlow";
import styles from "./ApplicationModals.module.css";

/** Plum-panel confirmation shown once the workshop is live, or once an edit to
 *  it has been saved. */
function ListedPanel({
  title,
  newId,
  editing,
  onClose,
}: {
  title: string;
  newId: string | null;
  editing: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <SuccessPanel
      title={t(
        editing
          ? "economy:editWorkshop.saved.title"
          : "economy:addWorkshop.listed.title",
      )}
      em={t(
        editing
          ? "economy:editWorkshop.saved.em"
          : "economy:addWorkshop.listed.em",
      )}
      onClose={onClose}
      closeLabel={t("economy:addWorkshop.listed.closeLabel")}
      footer={
        // Editing happens on the workshop's own page, so there is nowhere new
        // to send anyone — the link is only useful after listing.
        !editing &&
        newId && (
          <div className={styles.successBtn} style={{ marginTop: 10 }}>
            <Button variant="ghost-dark" to={`${routes.skills}/${newId}`}>
              {t("economy:addWorkshop.listed.viewCta")}
            </Button>
          </div>
        )
      }
    >
      <Translation
        i18nKey={
          editing
            ? "economy:editWorkshop.saved.body"
            : "economy:addWorkshop.listed.body"
        }
        values={{ title }}
        components={{ strong: <strong /> }}
      />
    </SuccessPanel>
  );
}

/**
 * List a workshop — or, when `workshop` is passed, edit one you already host.
 *
 * Both are the same form over the same draft, so a field added here shows up in
 * both flows and a listing can never describe itself differently from an edit of
 * itself. The only differences are the seed (`workshopToDraft` vs a blank draft)
 * and the copy.
 */
export function AddWorkshopModal({
  onClose,
  workshop,
}: {
  onClose: () => void;
  /** The workshop being edited. Omit to list a new one. */
  workshop?: Workshop;
}) {
  const { t } = useTranslation();
  const editing = !!workshop;
  const [draft, setDraft] = useState<WorkshopDraft>(() =>
    workshop ? workshopToDraft(workshop) : EMPTY_WORKSHOP_DRAFT,
  );
  const { sending, done, newId, failed, submit } = useAddWorkshopFlow(workshop);

  const set = (patch: Partial<WorkshopDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));
  const num = (v: string) => Number(v) || 0;
  const valid =
    draft.title.trim().length > 2 &&
    draft.blurb.trim().length > 8 &&
    draft.about.trim().length > 12 &&
    num(draft.weeks) >= 1 &&
    num(draft.size) >= 2 &&
    num(draft.price) >= 0;

  // The provider decides what listing or editing means per mode: demo rebuilds
  // the record client-side, live POSTs or PATCHes /workshops. Either way the
  // confirmation panel only shows once the write really landed.
  const onSubmit = () => {
    if (!valid) return;
    void submit(draft);
  };

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      wide
      ariaLabel={t(
        editing
          ? "economy:editWorkshop.ariaLabel"
          : "economy:addWorkshop.ariaLabel",
      )}
    >
      {done ? (
        <ListedPanel
          title={draft.title}
          newId={newId}
          editing={editing}
          onClose={onClose}
        />
      ) : (
        <>
          <div className={styles.eyebrow}>
            {t(
              editing
                ? "economy:editWorkshop.eyebrow"
                : "economy:addWorkshop.eyebrow",
            )}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey={
                editing
                  ? "economy:editWorkshop.title"
                  : "economy:addWorkshop.title"
              }
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>
            {t(
              editing ? "economy:editWorkshop.sub" : "economy:addWorkshop.sub",
            )}
          </p>

          <WorkshopDraftFields draft={draft} set={set} />

          <p className={styles.note}>
            {t(
              editing
                ? "economy:editWorkshop.note"
                : "economy:addWorkshop.note",
            )}
          </p>

          {failed && (
            <p className={styles.note} role="alert">
              {t(
                editing
                  ? "economy:editWorkshop.failedNote"
                  : "economy:addWorkshop.failedNote",
              )}
            </p>
          )}

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:addWorkshop.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={onSubmit}
            >
              {sending ? (
                <Sending
                  label={t(
                    editing
                      ? "economy:editWorkshop.savingLabel"
                      : "economy:addWorkshop.publishingLabel",
                  )}
                />
              ) : (
                t(
                  editing
                    ? "economy:editWorkshop.saveCta"
                    : "economy:addWorkshop.publishCta",
                )
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
