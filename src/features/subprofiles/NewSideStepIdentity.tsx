import { FormField, RadioCardGroup } from "../../shared/components/ui";
import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";
import { handleFormatError } from "../../shared/handles";
import type { LinkVisibility } from "./api/subprofiles.api";
import styles from "./NewSideModal.module.css";

/** One line of live handle feedback below a `.choice` card: `good` (format
 *  clean, first-come-first-served at publish), `bad` (invalid/reserved —
 *  blocks submission), or `idle` (no handle to check — the linked address
 *  isn't globally unique, so there's nothing to claim). */
function HandleState({
  tone,
  children,
}: {
  tone: "good" | "bad" | "idle";
  children: string;
}) {
  const toneClass =
    tone === "good"
      ? styles.handlestateGood
      : tone === "bad"
        ? styles.handlestateBad
        : styles.handlestateIdle;
  return (
    <p className={[styles.handlestate, toneClass].join(" ")}>{children}</p>
  );
}

/**
 * Step 2: name the persona, then choose whether it lives under the owner's
 * profile (linked) or stands alone with a public handle (unlinked). Both are
 * `.choice` radio cards with a live address preview; the unlinked one runs
 * the handle through the same client-side format/reserved check as the
 * editor's publish checklist — availability itself is only settled at
 * publish (first come, first served), so the state line says so rather than
 * pretending to confirm it here.
 */
export function NewSideStepIdentity({
  displayName,
  onChangeDisplayName,
  displayNamePlaceholder,
  linkVisibility,
  onChangeLinkVisibility,
  ownerSlug,
  slug,
  handle,
  t,
}: {
  displayName: string;
  onChangeDisplayName: (value: string) => void;
  displayNamePlaceholder: string;
  linkVisibility: LinkVisibility;
  onChangeLinkVisibility: (value: LinkVisibility) => void;
  ownerSlug: string;
  slug: string;
  handle: string;
  t: TranslationApi["t"];
}) {
  const handleError = handleFormatError(handle);

  return (
    <>
      <FormField
        label={t("subprofiles:newModal.displayNameLabel")}
        helper={t("subprofiles:newModal.displayNameHelper")}
      >
        <input
          value={displayName}
          placeholder={displayNamePlaceholder}
          onChange={(event) => onChangeDisplayName(event.target.value)}
        />
      </FormField>

      <div>
        <span id="new-side-link-label" className={styles.stepLabel}>
          {t("subprofiles:newModal.linkChoiceLabel")}
        </span>
        <RadioCardGroup<LinkVisibility>
          value={linkVisibility}
          onChange={onChangeLinkVisibility}
          ariaLabel={t("subprofiles:newModal.linkChoiceLabel")}
          className={styles.choices}
          optionClassName={styles.choice}
          options={[
            {
              id: "linked",
              render: (
                <>
                  <b className={styles.choiceTitle}>{t("subprofiles:link.linked")}</b>
                  <p className={styles.choiceDesc}>{t("subprofiles:link.help.linked")}</p>
                  <code className={styles.choiceCode}>
                    /members/{ownerSlug}/{slug || "…"}
                  </code>
                  <HandleState tone="idle">
                    {t("subprofiles:newModal.linkedAddressNote")}
                  </HandleState>
                </>
              ),
            },
            {
              id: "unlinked",
              render: (
                <>
                  <b className={styles.choiceTitle}>{t("subprofiles:link.standalone")}</b>
                  <p className={styles.choiceDesc}>{t("subprofiles:link.help.unlinked")}</p>
                  <code className={styles.choiceCode}>/p/{handle || "…"}</code>
                  <p className={styles.choiceDesc}>
                    {t("subprofiles:newModal.standaloneNote")}
                  </p>
                  {handleError === "invalid" ? (
                    <HandleState tone="bad">
                      {t("subprofiles:checklist.reqHandleFailInvalid")}
                    </HandleState>
                  ) : handleError === "reserved" ? (
                    <HandleState tone="bad">
                      {t("subprofiles:checklist.reqHandleFailReserved")}
                    </HandleState>
                  ) : (
                    <HandleState tone="good">
                      {t("subprofiles:newModal.handleStateClaim")}
                    </HandleState>
                  )}
                </>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
