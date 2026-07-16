import { useState } from "react";
import {
  Button,
  FormField,
  ModalSheet,
  Sending,
  SuccessPanel,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./TherapistProfilePage.module.css";

type Phase = "idle" | "sending" | "sent";

/** Simulated anonymised-vouch flow, opened from the dashed vouch card. */
export function AddVouchModal({
  therapistShort,
  onClose,
}: {
  therapistShort: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("idle");
  const [text, setText] = useState("");
  const [byline, setByline] = useState("");

  function submit() {
    if (phase !== "idle" || !text.trim()) return;
    setPhase("sending");
    window.setTimeout(() => setPhase("sent"), 1200);
  }

  if (phase === "sent") {
    return (
      <ModalSheet
        onClose={onClose}
        success
        ariaLabel={t("resources:therapistProfilePage.vouch.successAriaLabel")}
      >
        <SuccessPanel
          title={t("resources:therapistProfilePage.vouch.successTitle")}
          em={t("resources:therapistProfilePage.vouch.successEm")}
          onClose={onClose}
        >
          {t("resources:therapistProfilePage.vouch.successBody", {
            name: therapistShort,
          })}
        </SuccessPanel>
      </ModalSheet>
    );
  }

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("resources:therapistProfilePage.vouch.modalAriaLabel", {
        name: therapistShort,
      })}
    >
      <div className={styles.vmEyebrow}>
        {t("resources:therapistProfilePage.vouch.eyebrow")}
      </div>
      <h3 className={styles.vmTitle}>
        <Translation
          i18nKey="resources:therapistProfilePage.vouch.title"
          components={{ em: <em /> }}
          values={{ name: therapistShort }}
        />
      </h3>
      <p className={styles.vmSub}>
        {t("resources:therapistProfilePage.vouch.sub", {
          name: therapistShort,
        })}
      </p>
      <FormField
        label={t("resources:therapistProfilePage.vouch.form.textLabel")}
        required
      >
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t(
            "resources:therapistProfilePage.vouch.form.textPlaceholder",
          )}
        />
      </FormField>
      <FormField
        label={t("resources:therapistProfilePage.vouch.form.bylineLabel")}
        helper={t("resources:therapistProfilePage.vouch.form.bylineHelper")}
      >
        <input
          type="text"
          value={byline}
          onChange={(e) => setByline(e.target.value)}
          placeholder={t(
            "resources:therapistProfilePage.vouch.form.bylinePlaceholder",
          )}
        />
      </FormField>
      <div className={styles.vmFoot}>
        <Button variant="ghost" onClick={onClose}>
          {t("resources:suggestEdit.cancelCta")}
        </Button>
        <Button
          variant="primary"
          onClick={submit}
          disabled={phase === "sending" || !text.trim()}
        >
          {phase === "sending" ? (
            <Sending label={t("resources:suggestEdit.sendingLabel")} />
          ) : (
            t("resources:therapistProfilePage.vouch.submitCta")
          )}
        </Button>
      </div>
    </ModalSheet>
  );
}
