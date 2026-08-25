import { useId } from "react";
import { ChipSelect, Toggle } from "../../shared/components/ui";
import { useProfileEdit } from "../../app/providers/useProfile";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDiscoverableIdentities } from "./api/useDiscoverableIdentities";
import { IDENTITIES, publishableIdentities } from "./interests.data";
import styles from "./InterestsPane.module.css";

/**
 * The PRIVATE identity chips — Settings → Interests. Writes `draft.identities`,
 * which the profile save persists to `profiles.identities`. Nothing here is
 * shown on the profile or searchable; publishing is a separate, explicit
 * decision made in `DiscoverableIdentitiesSection` directly below.
 */
export function PrivateIdentitiesSection({
  onChange,
}: {
  onChange: () => void;
}) {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfileEdit();
  const uid = useId();
  const hasIdentities = draft.identities.length > 0;

  return (
    <div className={styles.prefSection}>
      <div className={styles.psHead}>
        {/* The heading text is span-wrapped so the chip group can point at it
            without also swallowing the "Skip" button's label. */}
        <span id={`${uid}-identities`}>
          {t("settings:interests.identities.heading")}
        </span>
        {/* Skip clears the selection for real. It used to toggle a CSS class and
            a label while every ticked identity stayed in the draft and was
            saved anyway, so the opt-out was recorded nowhere. Disabled when
            there is nothing to clear. */}
        <button
          type="button"
          className={styles.psSkip}
          disabled={!hasIdentities}
          onClick={() => {
            updateDraft({ identities: [] });
            onChange();
          }}
        >
          {t("settings:interests.identities.skip")}
        </button>
      </div>
      <div className={styles.psHelper}>
        {t("settings:interests.identities.helper")}
      </div>
      {/* IDENTITIES.options are the literal stored value of draft.identities —
          see the NOTE in interests.data.ts. Left untranslated on purpose. */}
      <ChipSelect
        tick={false}
        labelledBy={`${uid}-identities`}
        options={IDENTITIES.options}
        selected={new Set(draft.identities)}
        onToggle={(label) => {
          const next = draft.identities.includes(label)
            ? draft.identities.filter((x) => x !== label)
            : [...draft.identities, label];
          updateDraft({ identities: next });
          onChange();
        }}
      />
    </div>
  );
}

/** One published-identity switch. Title is the identity itself; the description
 *  states the current consequence in plain terms, both directions. */
function IdentityToggleRow({
  identity,
  published,
  disabled,
  onChange,
}: {
  identity: string;
  published: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.discoverRow}>
      <div>
        <div className={styles.discoverTitle}>{identity}</div>
        <div className={styles.discoverDesc}>
          {published
            ? t("settings:discoverable.rowOn")
            : t("settings:discoverable.rowOff")}
        </div>
      </div>
      <div inert={disabled || undefined}>
        <Toggle
          tone="coral"
          checked={published}
          onChange={onChange}
          label={t("settings:discoverable.toggleLabel", { label: identity })}
        />
      </div>
    </div>
  );
}

/**
 * Per-identity, opt-in discoverability. Sits immediately below the private
 * chips on purpose: the list of switches IS that list, so the relationship
 * between "what I've told QueerPulse" and "what other members can search on"
 * is visible in one glance rather than inferred across two panes.
 *
 * Every switch is off until the member turns it on, and each one is separate —
 * being happy to be found as a lesbian says nothing about being happy to be
 * found as disabled.
 */
export function DiscoverableIdentitiesSection() {
  const { t } = useTranslation();
  const { draft, savedVersion } = useProfileEdit();
  const { showToast } = useToast();
  // Rows are drawn from the member's own saved-and-publishable identities.
  const draftPublishable = publishableIdentities(draft.identities);
  // `savedVersion` re-reads the server's sets after each profile save, so an
  // identity ticked above gets its switch as soon as it is stored — the pane
  // used to keep saying "once you save" until a full page reload.
  const { available, published, loading, saving, error, setPublished } =
    useDiscoverableIdentities(draftPublishable, savedVersion);

  const rows = draftPublishable.filter((identity) =>
    available.includes(identity),
  );
  // Chips ticked above but not yet committed have no switch yet — you cannot
  // publish an identity the server has not stored. Say so rather than silently
  // omitting them.
  const hasUnsaved = draftPublishable.length > rows.length;

  const handle = async (identity: string, next: boolean) => {
    const ok = await setPublished(identity, next);
    // Confirm RETRACTION only. A success toast on turning one ON would be the
    // product congratulating someone for disclosing; turning one OFF is the
    // direction that deserves an immediate, unambiguous receipt.
    if (ok && !next) {
      showToast(t("settings:discoverable.toast.removed"), "info");
    }
  };

  return (
    <div className={styles.prefSection}>
      <div className={styles.psHead}>{t("settings:discoverable.heading")}</div>
      <div className={styles.psHelper}>{t("settings:discoverable.helper")}</div>
      <div className={styles.psHelper}>
        {t("settings:discoverable.retract")}
      </div>

      {error && (
        <div className={styles.discoverError} role="alert">
          {t("settings:discoverable.error")}
        </div>
      )}

      {loading ? null : rows.length === 0 ? (
        <div className={styles.discoverEmpty}>
          {t("settings:discoverable.empty")}
        </div>
      ) : (
        <div className={styles.discoverList}>
          {rows.map((identity) => (
            <IdentityToggleRow
              key={identity}
              identity={identity}
              published={published.includes(identity)}
              disabled={saving}
              onChange={(next) => void handle(identity, next)}
            />
          ))}
        </div>
      )}

      {hasUnsaved && (
        <div className={styles.discoverNote}>
          {t("settings:discoverable.unsaved")}
        </div>
      )}
    </div>
  );
}
