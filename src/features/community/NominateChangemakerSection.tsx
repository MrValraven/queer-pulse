import { useState } from "react";
import { Button, Reveal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCreateChangemakerNomination } from "./api/useCreateChangemakerNomination";
import styles from "./ChangemakersPage.module.css";

/**
 * The Change Makers page's "Nominate them" form. The directory itself
 * (`CHANGEMAKERS`) is curated editorial content, but a nomination is real
 * member data — it calls `POST /changemakers/nominations` in live mode (see
 * `useCreateChangemakerNomination`); demo mode keeps the prototype's
 * simulated success toast.
 */
export function NominateChangemakerSection() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [nominee, setNominee] = useState("");
  const nominationMutation = useCreateChangemakerNomination();

  return (
    <section className={styles.nominate}>
      <div className="wrap">
        <Reveal as="div" className={styles.nomEye}>
          {t("community:changemakers.nominate.eyebrow")}
        </Reveal>
        <Reveal as="h2" delay={60}>
          <Translation
            i18nKey="community:changemakers.nominate.heading"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" delay={120}>
          {t("community:changemakers.nominate.lead")}
        </Reveal>
        <form
          className={styles.nomForm}
          onSubmit={(e) => {
            e.preventDefault();
            const nomineeName = nominee.trim();
            if (!nomineeName) return;
            nominationMutation.mutate(
              { nomineeName },
              {
                onSuccess: () => {
                  showToast(
                    t("community:changemakers.nominate.successToast", {
                      name: nomineeName,
                    }),
                    "success",
                  );
                  setNominee("");
                },
                onError: () =>
                  showToast(
                    t("community:changemakers.nominate.errorToast"),
                    "error",
                  ),
              },
            );
          }}
        >
          <input
            className={styles.nomInput}
            type="text"
            autoComplete="off"
            enterKeyHint="send"
            aria-label={t("community:changemakers.nominate.namePlaceholder")}
            placeholder={t("community:changemakers.nominate.namePlaceholder")}
            value={nominee}
            onChange={(e) => setNominee(e.target.value)}
          />
          <Button type="submit" disabled={nominationMutation.isPending}>
            {nominationMutation.isPending
              ? t("community:changemakers.nominate.submitPending")
              : t("community:changemakers.nominate.submitCta")}
          </Button>
        </form>
      </div>
    </section>
  );
}
