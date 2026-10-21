import { Button, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileKind } from "./api/subprofiles.api";
import { NewSideStepCraft } from "./NewSideStepCraft";
import { NewSideStepIdentity } from "./NewSideStepIdentity";
import { useNewSideForm } from "./useNewSideForm";
import styles from "./NewSideModal.module.css";

/**
 * Two-step create wizard: step 1 picks the craft (a searchable by-craft
 * family picker, or copy an existing persona); step 2 names it and chooses
 * whether it's linked to the owner's profile or stands alone with its own
 * handle. All state, derivation, and the create/seed/navigate submission live
 * in `useNewSideForm` (every write goes through `useSubprofileMutations()`, so
 * demo and live behave identically); this component is just the render shell.
 * Both steps use the `wide` dialog so the craft grid gets three columns and
 * the dialog keeps one size between steps.
 */
export function NewSideModal({
  onClose,
  initialKind = null,
  allowedKinds,
  craftStepSub,
}: {
  onClose: () => void;
  /** Pre-select a craft (Moment 4's persona-creation deep-link, `?kind=` on
   *  `MySubprofilesPage`) so the member lands on step 1 with it already
   *  chosen in the family picker. Caller validates the raw
   *  query param against `SubprofileKind` before passing it in. */
  initialKind?: SubprofileKind | null;
  /** Limit the wizard to these crafts (Studio's upload page passes the
   *  Studio artist kinds): the picker shows only them, and "Copy one" lists
   *  only personas of these kinds, or leaves the method out when none
   *  qualifies. Omitted, every craft is offered. */
  allowedKinds?: readonly SubprofileKind[];
  /** Step 1's subtitle in place of the general one, so a caller that
   *  narrows the crafts can say why. */
  craftStepSub?: string;
}) {
  const { t } = useTranslation();
  const form = useNewSideForm(initialKind, onClose, allowedKinds);

  return (
    <Modal
      wide
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
      sub={
        form.step === 1
          ? (craftStepSub ?? t("subprofiles:newModal.sub"))
          : t("subprofiles:newModal.stepIdentitySub")
      }
      className={form.step === 1 ? styles.craftStepModal : undefined}
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
            allowedKinds={allowedKinds}
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
            creatorSlugForChecks={form.creatorSlugForChecks}
            slug={form.slug}
            handle={form.handle}
            isHandleKindName={form.isHandleKindName}
            t={t}
          />
        )}
      </div>
    </Modal>
  );
}
