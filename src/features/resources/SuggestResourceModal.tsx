import { useId, useState } from "react";
import { Button, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { submitResourceSuggestion } from "./api/resources.api";
import { ResourceModal, PlumSuccess } from "./ResourceModal";
import styles from "./ResourceModal.module.css";

interface SuggestResourceModalProps {
  onClose: () => void;
  /** Category pre-filled from the page the CTA was opened from — matches the
   *  backend `ResourceListingCategory` enum ("legal_aid" |
   *  "sexual_health_testing"). Never shown as a picker: the reader is always
   *  suggesting a resource for the page they're already on. */
  category: string;
}

/**
 * "Suggest a resource" form — CNT-14's submission pathway. POSTs to
 * `POST /resources/suggestions` (live) or simulates success (demo), landing
 * the suggestion `Pending` in the admin review queue
 * (`AdminResourceSuggestionsController`). This never fabricates a listing:
 * the reader is told their suggestion is in review, not that it's live.
 */
export function SuggestResourceModal({
  onClose,
  category,
}: SuggestResourceModalProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const fieldId = useId();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [phase, setPhase] = useState<"form" | "loading" | "done">("form");

  const valid = name.trim().length > 1 && description.trim().length > 8;

  const submit = async () => {
    if (!valid || phase === "loading") return;
    setPhase("loading");
    if (demoMode) {
      setTimeout(() => setPhase("done"), 1100);
      return;
    }
    try {
      await submitResourceSuggestion({
        category,
        name: name.trim(),
        description: description.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
      });
      setPhase("done");
    } catch {
      setPhase("form");
      showToast(t("resources:suggest.errorToast"), "error");
    }
  };

  return (
    <ResourceModal
      title={phase === "done" ? "" : t("resources:suggest.modalTitle")}
      onClose={onClose}
    >
      {phase === "done" ? (
        <PlumSuccess
          title={
            <Translation
              i18nKey="resources:suggest.success.title"
              components={{ em: <em /> }}
            />
          }
          sub={
            // Two sentences in one paragraph, because `PlumSuccess` renders
            // `sub` inside a `<p>` and a nested `<p>` is invalid markup.
            //
            // The second sentence is the honest half of PRD-45: the outcome
            // now really does reach the member, on the submissions page and
            // in the bell. It promises no reply and no email, because
            // QueerPulse sends no email and nobody writes back personally.
            <>
              {t("resources:suggest.success.sub")}{" "}
              {t("resources:suggest.success.tracked")}
            </>
          }
          onClose={onClose}
        />
      ) : (
        <>
          <div className={styles.body}>
            <p className={styles.sub}>{t("resources:suggest.intro")}</p>

            <label className={styles.label} htmlFor={`${fieldId}-name`}>
              {t("resources:suggest.form.nameLabel")}
            </label>
            <input
              id={`${fieldId}-name`}
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("resources:suggest.form.namePlaceholder")}
            />

            <label className={styles.label} htmlFor={`${fieldId}-description`}>
              {t("resources:suggest.form.descriptionLabel")}
            </label>
            <textarea
              id={`${fieldId}-description`}
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("resources:suggest.form.descriptionPlaceholder")}
            />

            <label className={styles.label} htmlFor={`${fieldId}-phone`}>
              {t("resources:suggest.form.phoneLabel")}
            </label>
            <input
              id={`${fieldId}-phone`}
              className={styles.input}
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("resources:suggest.form.phonePlaceholder")}
            />

            <label className={styles.label} htmlFor={`${fieldId}-email`}>
              {t("resources:suggest.form.emailLabel")}
            </label>
            <input
              id={`${fieldId}-email`}
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("resources:suggest.form.emailPlaceholder")}
            />

            <label className={styles.label} htmlFor={`${fieldId}-website`}>
              {t("resources:suggest.form.websiteLabel")}
            </label>
            <input
              id={`${fieldId}-website`}
              className={styles.input}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder={t("resources:suggest.form.websitePlaceholder")}
            />
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("resources:suggest.cancelCta")}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void submit()}
              disabled={!valid || phase === "loading"}
            >
              {phase === "loading" ? (
                <Sending label={t("resources:suggest.sendingLabel")} />
              ) : (
                t("resources:suggest.submitCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ResourceModal>
  );
}
