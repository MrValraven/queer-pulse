import { useState } from "react";
import { FiCode, FiCopy, FiEye, FiLayers } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import type { Language } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminModal } from "../ui";
import { useEmailDesignVariant } from "./emailDesignVariant";
import type { EmailLocaleContent } from "./emailTemplate.types";
import { sampleValuesFor } from "./emailTemplatePurposes";
import { switchToBlocks, switchToHtml } from "./emailTemplateDraft";
import { copyPlainText, copyRichEmail } from "./copyEmail";
import { EmailHtmlEditor } from "./editor/EmailHtmlEditor";
import { renderEmail } from "./renderEmail";
import styles from "./AdminEmailTemplates.module.css";

type OpenDialog = "viewHtml" | "editAsHtml" | "backToBlocks" | null;

interface EmailTemplateModeActionsProps {
  content: EmailLocaleContent;
  locale: Language;
  onUpdate: (
    update: (content: EmailLocaleContent) => EmailLocaleContent,
  ) => void;
}

export function EmailTemplateModeActions({
  content,
  locale,
  onUpdate,
}: EmailTemplateModeActionsProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const isBlocks = content.mode === "blocks";
  // Exported HTML keeps the default asset origin, the public site, so its
  // images still load once the email leaves this page.
  const { variant } = useEmailDesignVariant();
  const renderOptions = { design: variant };
  // Tokens stay literal ({} values) so the HTML still carries its placeholders.
  const generatedHtml = () =>
    renderEmail(content, {}, locale, renderOptions).html;

  async function copySample() {
    const outcome = await copyRichEmail(
      renderEmail(content, sampleValuesFor(locale), locale, renderOptions),
    );
    showToast(
      t(
        outcome === "failed"
          ? "admin:emailTemplates.copy.failedToast"
          : "admin:emailTemplates.copy.sampleCopiedToast",
      ),
      outcome === "failed" ? "error" : "success",
    );
  }

  async function copyGeneratedHtml() {
    const isCopied = await copyPlainText(generatedHtml());
    showToast(
      t(
        isCopied
          ? "admin:emailTemplates.copy.htmlCopiedToast"
          : "admin:emailTemplates.copy.failedToast",
      ),
      isCopied ? "success" : "error",
    );
  }

  function confirm() {
    if (openDialog === "editAsHtml")
      onUpdate((current) =>
        switchToHtml(
          current,
          renderEmail(current, {}, locale, renderOptions).html,
        ),
      );
    if (openDialog === "backToBlocks") onUpdate(switchToBlocks);
    setOpenDialog(null);
  }

  return (
    <div className={styles.modeActions}>
      {isBlocks && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpenDialog("viewHtml")}
        >
          <FiEye aria-hidden /> {t("admin:emailTemplates.mode.viewHtml")}
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpenDialog(isBlocks ? "editAsHtml" : "backToBlocks")}
      >
        {isBlocks ? <FiCode aria-hidden /> : <FiLayers aria-hidden />}{" "}
        {t(
          isBlocks
            ? "admin:emailTemplates.mode.editAsHtml"
            : "admin:emailTemplates.mode.backToBlocks",
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label={t("admin:emailTemplates.mode.copySample")}
        title={t("admin:emailTemplates.mode.copySample")}
        onClick={() => void copySample()}
      >
        <FiCopy aria-hidden /> {t("admin:emailTemplates.mode.copySampleShort")}
      </Button>

      {openDialog === "viewHtml" && (
        <AdminModal
          wide
          title={t("admin:emailTemplates.mode.viewHtmlTitle")}
          onClose={() => setOpenDialog(null)}
          footer={
            <Button variant="primary" onClick={() => void copyGeneratedHtml()}>
              {t("admin:emailTemplates.mode.copyHtml")}
            </Button>
          }
        >
          <EmailHtmlEditor
            id={`email-generated-${locale}`}
            label={t("admin:emailTemplates.mode.htmlField")}
            value={generatedHtml()}
            isReadOnly
          />
        </AdminModal>
      )}

      {(openDialog === "editAsHtml" || openDialog === "backToBlocks") && (
        <AdminModal
          title={t(`admin:emailTemplates.mode.${openDialog}Title`)}
          onClose={() => setOpenDialog(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpenDialog(null)}>
                {t("admin:common.cancel")}
              </Button>
              <Button
                variant={openDialog === "backToBlocks" ? "danger" : "primary"}
                onClick={confirm}
              >
                {t(
                  openDialog === "backToBlocks"
                    ? "admin:emailTemplates.mode.backToBlocksConfirm"
                    : "admin:emailTemplates.mode.editAsHtml",
                )}
              </Button>
            </>
          }
        >
          <p className={styles.dialogBody}>
            {t(`admin:emailTemplates.mode.${openDialog}Body`)}
          </p>
        </AdminModal>
      )}
    </div>
  );
}
