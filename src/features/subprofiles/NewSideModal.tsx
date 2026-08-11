import { Button, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileKind } from "./api/subprofiles.api";
import { NewSideStepCraft } from "./NewSideStepCraft";
import { NewSideStepIdentity } from "./NewSideStepIdentity";
import { useNewSideForm } from "./useNewSideForm";
import styles from "./NewSideModal.module.css";

/**
 * Two-step create wizard: step 1 picks the craft (by-craft family picker,
 * blank, or copy an existing persona); step 2 names it and chooses whether
 * it's linked to the owner's profile or stands alone with its own handle. All
 * state, derivation, and the create/seed/navigate submission live in
 * `useNewSideForm` (every write goes through `useSubprofileMutations()`, so
 * demo and live behave identically) — this component is just the render shell.
 */
export function NewSideModal({
  onClose,
  initialKind = null,
}: {
  onClose: () => void;
  /** Pre-select a craft (Moment 4's persona-creation deep-link, `?kind=` on
   *  `MySubprofilesPage`) so the member lands on step 1 with it already
   *  chosen instead of the blank family picker. Caller validates the raw
   *  query param against `SubprofileKind` before passing it in. */
  initialKind?: SubprofileKind | null;
}) {
  const { t } = useTranslation();
  const form = useNewSideForm(initialKind, onClose);

  return (
    <Modal
      title={
        <Translation
          i18nKey={
            form.step === 1
              ? "subprofiles:newModal.stepCraftTitle"
              : "subprofiles:newModal.stepIdentityTitle"
          }
          components={{ em: <em /> }}
        />
      }
      sub={t(
        form.step === 1
          ? "subprofiles:newModal.sub"
          : "subprofiles:newModal.stepIdentitySub",
      )}
      onClose={onClose}
      footer={
        form.step === 1 ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              {t("subprofiles:newModal.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={() => form.setStep(2)}
              disabled={!form.step1Ready}
            >
              {t("subprofiles:newModal.continue")}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => form.setStep(1)}>
              {t("subprofiles:newModal.back")}
            </Button>
            <Button
              variant="primary"
              onClick={() => void form.submit()}
              disabled={!form.step2Ready || form.submitting}
            >
              {form.submitting
                ? t("subprofiles:newModal.creating")
                : t("subprofiles:newModal.create")}
            </Button>
          </>
        )
      }
    >
      <span className="visuallyHidden" role="status" aria-live="polite">
        {t("subprofiles:newModal.stepOf", { step: form.step, total: 2 })}
      </span>

      <div className={styles.stepBody}>
        {form.step === 1 ? (
          <NewSideStepCraft
            method={form.method}
            onChangeMethod={form.setMethod}
            kind={form.kind}
            onChangeKind={form.setKind}
            sources={form.sources}
            sourceId={form.sourceId}
            onChangeSourceId={form.setSourceId}
            copyMode={form.copyMode}
            onChangeCopyMode={form.setCopyMode}
            effectiveKind={form.effectiveKind}
            t={t}
          />
        ) : (
          <NewSideStepIdentity
            displayName={form.displayName}
            onChangeDisplayName={form.setDisplayName}
            displayNamePlaceholder={form.displayNamePlaceholder}
            linkVisibility={form.linkVisibility}
            onChangeLinkVisibility={form.setLinkVisibility}
            ownerSlug={form.ownerSlug}
            slug={form.slug}
            handle={form.handle}
            t={t}
          />
        )}
      </div>
    </Modal>
  );
}
