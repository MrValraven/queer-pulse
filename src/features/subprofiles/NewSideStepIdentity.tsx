import { FormField, RadioCardGroup } from "../../shared/components/ui";
import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";
import { handleFormatError } from "../../shared/handles";
import type { LinkVisibility } from "./api/subprofiles.api";
import {
  handleNamesOwner,
  linkedPersonaHandleCandidate,
} from "./personaHandle";
import styles from "./NewSideModal.module.css";

/** One line of live handle feedback below a `.choice` card: `good` (format
 *  clean, first-come-first-served at publish), `bad` (invalid, reserved,
 *  only the kind name, or names the owner; blocks submission), or `idle`
 *  (nothing to check: the linked address starts from a default the server
 *  derives and stores on save). */
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
 * Step 2: name the persona, then choose whether it shows it belongs to the
 * owner (linked) or stands alone (unlinked). Both live at `/p/<handle>`; a
 * linked one starts from the derived `<creatorSlug>-<personaSlug>`. Both are
 * `.choice` radio cards with a live address preview; the unlinked one runs
 * the handle through the same client-side format/reserved/names-owner check
 * as the editor's publish checklist, and refuses a handle that is only the
 * kind name (an empty display name would otherwise give `/p/therapist`).
 * Availability itself is only settled at
 * publish (first come, first served), so the state line says so and leaves
 * the confirmation to publish.
 */
export function NewSideStepIdentity({
  displayName,
  onChangeDisplayName,
  displayNamePlaceholder,
  linkVisibility,
  onChangeLinkVisibility,
  ownerSlug,
  creatorSlugForChecks,
  slug,
  handle,
  isHandleKindName,
  t,
}: {
  displayName: string;
  onChangeDisplayName: (value: string) => void;
  displayNamePlaceholder: string;
  linkVisibility: LinkVisibility;
  onChangeLinkVisibility: (value: LinkVisibility) => void;
  ownerSlug: string;
  /** `null` until a real creator slug resolves; the names-owner check below
   *  skips entirely then, same as `useNewSideForm`'s `step2Ready` (see its
   *  `creatorSlugForChecks` doc comment for why `ownerSlug`'s "you" fallback
   *  can't be used for this check). */
  creatorSlugForChecks: string | null;
  slug: string;
  handle: string;
  /** From `useNewSideForm`: the handle is only the persona's kind name, which
   *  keeps standalone Create disabled until a name is given above. */
  isHandleKindName: boolean;
  t: TranslationApi["t"];
}) {
  const handleError = handleFormatError(handle);
  const doesHandleNameOwner =
    creatorSlugForChecks !== null &&
    handleNamesOwner(handle, creatorSlugForChecks);

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
                  <b className={styles.choiceTitle}>
                    {t("subprofiles:link.linked")}
                  </b>
                  <p className={styles.choiceDesc}>
                    {t("subprofiles:link.help.linked")}
                  </p>
                  <code className={styles.choiceCode}>
                    /p/
                    {slug ? linkedPersonaHandleCandidate(ownerSlug, slug) : "…"}
                  </code>
                  <HandleState tone="idle">
                    {t("subprofiles:newModal.linkedAddressNoteCreate", {
                      creator: ownerSlug,
                    })}
                  </HandleState>
                </>
              ),
            },
            {
              id: "unlinked",
              render: (
                <>
                  <b className={styles.choiceTitle}>
                    {t("subprofiles:link.standalone")}
                  </b>
                  <p className={styles.choiceDesc}>
                    {t("subprofiles:link.help.unlinked")}
                  </p>
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
                  ) : isHandleKindName ? (
                    <HandleState tone="bad">
                      {t("subprofiles:newModal.handleStateIsKind")}
                    </HandleState>
                  ) : doesHandleNameOwner ? (
                    <HandleState tone="bad">
                      {t("subprofiles:checklist.reqHandleFailNamesOwner")}
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
