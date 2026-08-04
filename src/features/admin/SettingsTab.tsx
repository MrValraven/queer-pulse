import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useUpdateCommunity } from "../communities/api/useCommunityMutations";
import type {
  AccessTier,
  UpdateCommunityDto,
} from "../communities/api/communities.api";
import type { EditableCommunityFields } from "../communities/api/communities.adapters";
import { defaultSettings } from "./adminMod.data";
import {
  ArchiveConfirmModal,
  TransferOwnershipModal,
} from "./ModPanelDangerModals";
import styles from "./ModPanel.module.css";

const modeToTier = (
  mode: "open" | "request" | "invite",
): AccessTier =>
  mode === "open" ? "public" : mode === "request" ? "request" : "invite";

export function SettingsTab({
  slug,
  editable,
  isOwner,
}: {
  slug: string;
  editable: EditableCommunityFields;
  isOwner: boolean;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const init = defaultSettings(editable);
  const [name, setName] = useState(init.name);
  const [description, setDescription] = useState(init.description);
  const [mode, setMode] = useState(init.membershipMode);
  const [rules, setRules] = useState(init.rules);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const updateCommunity = useUpdateCommunity();

  const MODE_KEYS = [
    ["open", "modPanel.settings.mode.open"],
    ["request", "modPanel.settings.mode.request"],
    ["invite", "modPanel.settings.mode.invite"],
  ] as const;

  const save = () => {
    if (updateCommunity.isPending) return;
    // Partial PATCH: only the fields this tab actually edits. `accessTier` is
    // sent ONLY when the membership mode changed, so a private-tier community
    // (which shows as "invite" in the 3-way selector) isn't silently flipped to
    // invite on an unrelated save. Purpose / whoFor / type / features /
    // rosterVisible are left untouched (edited from the full edit modal).
    const dto: UpdateCommunityDto = {
      name: name.trim(),
      tagline: description.trim(),
      rules: rules
        .split("\n")
        .map((rule) => rule.trim())
        .filter(Boolean),
    };
    if (mode !== init.membershipMode) {
      dto.accessTier = modeToTier(mode);
    }
    updateCommunity.mutate(
      { slug, dto },
      {
        onSuccess: () =>
          showToast(t("admin:modPanel.settings.savedToast"), "success"),
        onError: () =>
          showToast(t("admin:modPanel.settings.errorToast"), "error"),
      },
    );
  };

  return (
    <div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel} htmlFor="mod-name">
          {t("admin:modPanel.settings.nameLabel")}
        </label>
        <input
          id="mod-name"
          className={styles.settingsInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel} htmlFor="mod-desc">
          {t("admin:modPanel.settings.descLabel")}
        </label>
        <input
          id="mod-desc"
          className={styles.settingsInput}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("admin:modPanel.settings.descPlaceholder")}
        />
      </div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel}>
          {t("admin:modPanel.settings.modeLabel")}
        </label>
        <div className={styles.modeRow}>
          {MODE_KEYS.map(([val, labelKey]) => (
            <button
              key={val}
              type="button"
              className={[
                styles.modeChip,
                mode === val && styles.modeChipActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setMode(val)}
            >
              {t(`admin:${labelKey}`)}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.settingsField}>
        <label className={styles.settingsLabel} htmlFor="mod-rules">
          {t("admin:modPanel.settings.rulesLabel")}
        </label>
        <textarea
          id="mod-rules"
          className={styles.rulesArea}
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder={t("admin:modPanel.settings.rulesPlaceholder")}
        />
      </div>
      <div className={styles.saveRow}>
        <Button
          variant="primary"
          onClick={save}
          disabled={updateCommunity.isPending}
        >
          {t("admin:modPanel.settings.saveCta")}
        </Button>
      </div>

      {/* Archiving and transferring the whole community are owner-only on the
          server, so live mode shows the danger zone to the owner alone (a mod
          would just hit a 403). Demo keeps it always visible — it's the mock
          showcase, and the seeded moderator persona never actually owns a
          flagship. */}
      {(demoMode || isOwner) && (
        <>
          <div className={styles.secLbl}>
            {t("admin:modPanel.settings.dangerZone")}
          </div>
          <div className={styles.dangerZone}>
            <div className={styles.danger}>
              {t("admin:modPanel.settings.irreversible")}
            </div>
            <div className={styles.dangerRow}>
              <div className={styles.dangerInfo}>
                <div className={styles.dangerTitle}>
                  {t("admin:modPanel.settings.archive.title")}
                </div>
                <div className={styles.dangerDesc}>
                  {t("admin:modPanel.settings.archive.desc")}
                </div>
              </div>
              <Button variant="ghost" onClick={() => setArchiveOpen(true)}>
                {t("admin:modPanel.settings.archive.cta")}
              </Button>
            </div>
            <div className={styles.dangerRow}>
              <div className={styles.dangerInfo}>
                <div className={styles.dangerTitle}>
                  {t("admin:modPanel.settings.transfer.title")}
                </div>
                <div className={styles.dangerDesc}>
                  {t("admin:modPanel.settings.transfer.desc")}
                </div>
              </div>
              <Button variant="ghost" onClick={() => setTransferOpen(true)}>
                {t("admin:modPanel.settings.transfer.cta")}
              </Button>
            </div>
          </div>
        </>
      )}

      {archiveOpen && (
        <ArchiveConfirmModal slug={slug} onClose={() => setArchiveOpen(false)} />
      )}
      {transferOpen && (
        <TransferOwnershipModal
          slug={slug}
          onClose={() => setTransferOpen(false)}
        />
      )}
    </div>
  );
}
