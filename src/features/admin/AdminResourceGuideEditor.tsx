import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal, AdminTabs, type AdminTab } from "./ui";
import { AdminResourceGuideSections } from "./AdminResourceGuideSections";
import {
  draftFromGuide,
  draftToWriteBody,
  type GuideFormDraft,
} from "./adminResourceGuideEditor.utils";
import { useUpdateResourceGuide } from "./api/useAdminResourceGuideMutations";
import type { AdminResourceGuideDTO } from "./api/adminResourceGuides.api";
import styles from "./AdminResourceGuidesPage.module.css";

const FORM_ID = "admin-resource-guide-form";

/**
 * Edit one guide: its card copy, its route, and its prose in both languages.
 *
 * This is the surface CON-08 exists for. Before it, changing a paragraph in a
 * harm-reduction or hormone-access guide meant an engineer editing i18n
 * catalogs in two directories and shipping a deploy, so wrong information sat
 * live until someone with commit access had time.
 *
 * A guide with no sections is still hardcoded on the frontend. Adding a
 * section here is what takes the page over, which the editor says plainly
 * rather than leaving an editor to discover it by publishing.
 */
export function AdminResourceGuideEditor({
  guide,
  onClose,
}: {
  guide: AdminResourceGuideDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updateGuide = useUpdateResourceGuide();
  const [draft, setDraft] = useState<GuideFormDraft>(() =>
    draftFromGuide(guide),
  );
  const [activeTab, setActiveTab] = useState("details");

  const isTakingOverPage =
    guide.sections.length === 0 && draft.sections.length > 0;

  const tabs: AdminTab[] = [
    { id: "details", label: t("admin:adminResourceGuides.tab.details") },
    { id: "prose", label: t("admin:adminResourceGuides.tab.prose") },
    { id: "prosePt", label: t("admin:adminResourceGuides.tab.prosePt") },
  ];

  function change(changes: Partial<GuideFormDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = draftToWriteBody(draft, guide);
    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }
    updateGuide.mutate(
      { id: guide.id, body },
      {
        onSuccess: () => {
          showToast(
            t("admin:adminResourceGuides.toast.saved", { title: draft.title }),
            "info",
          );
          onClose();
        },
        onError: (error) =>
          showToast(
            describeError(
              t("admin:adminResourceGuides.error.save"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          ),
      },
    );
  }

  return (
    <AdminModal
      wide
      eyebrow={guide.slug}
      title={t("admin:adminResourceGuides.editor.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            disabled={updateGuide.isPending}
          >
            {t("admin:adminResourceGuides.editor.saveCta")}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={submit}>
        <AdminTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {isTakingOverPage && (
          <p className={styles.takeoverNotice}>
            {t("admin:adminResourceGuides.editor.takeoverNotice")}
          </p>
        )}

        {activeTab === "details" && (
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="guide-title">
              {t("admin:adminResourceGuides.field.title")}
            </label>
            <input
              id="guide-title"
              className={styles.textInput}
              value={draft.title}
              onChange={(event) => change({ title: event.target.value })}
              required
            />

            <label className={styles.fieldLabel} htmlFor="guide-title-pt">
              {t("admin:adminResourceGuides.field.titlePt")}
            </label>
            <input
              id="guide-title-pt"
              className={styles.textInput}
              value={draft.titlePt}
              onChange={(event) => change({ titlePt: event.target.value })}
            />

            <label className={styles.fieldLabel} htmlFor="guide-description">
              {t("admin:adminResourceGuides.field.description")}
            </label>
            <textarea
              id="guide-description"
              className={styles.textarea}
              value={draft.description}
              onChange={(event) => change({ description: event.target.value })}
              required
            />

            <label className={styles.fieldLabel} htmlFor="guide-description-pt">
              {t("admin:adminResourceGuides.field.descriptionPt")}
            </label>
            <textarea
              id="guide-description-pt"
              className={styles.textarea}
              value={draft.descriptionPt}
              onChange={(event) =>
                change({ descriptionPt: event.target.value })
              }
            />

            <label className={styles.fieldLabel} htmlFor="guide-category">
              {t("admin:adminResourceGuides.field.category")}
            </label>
            <input
              id="guide-category"
              className={styles.textInput}
              value={draft.category}
              onChange={(event) => change({ category: event.target.value })}
              required
            />

            <label className={styles.fieldLabel} htmlFor="guide-route">
              {t("admin:adminResourceGuides.field.routePath")}
            </label>
            <input
              id="guide-route"
              className={styles.textInput}
              value={draft.routePath}
              onChange={(event) => change({ routePath: event.target.value })}
            />

            <label className={styles.fieldLabel} htmlFor="guide-meta">
              {t("admin:adminResourceGuides.field.meta")}
            </label>
            <input
              id="guide-meta"
              className={styles.textInput}
              value={draft.meta}
              onChange={(event) => change({ meta: event.target.value })}
            />
          </div>
        )}

        {activeTab === "prose" && (
          <AdminResourceGuideSections
            idPrefix="guide-en"
            sections={draft.sections}
            onChange={(sections) => change({ sections })}
          />
        )}

        {activeTab === "prosePt" && (
          <AdminResourceGuideSections
            idPrefix="guide-pt"
            sections={draft.sectionsPt}
            onChange={(sectionsPt) => change({ sectionsPt })}
          />
        )}
      </form>
    </AdminModal>
  );
}
