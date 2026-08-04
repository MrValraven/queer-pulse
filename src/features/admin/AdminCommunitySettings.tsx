import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip, AdminToggle } from "./ui";
import {
  shortName,
  visLabelKey,
  type Community,
  type Moderator,
} from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

export function SettingsPane({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const [moderators, setModerators] = useState<Moderator[]>(community.moderators);
  // Neither `join` nor `code` has a backend field yet (live mode — see
  // adminCommunities.adapters.ts), so both arrive as "". `hasJoinData` also
  // gates the second-vouch toggle below, which otherwise derives its initial
  // state from parsing that same fabricated-empty string and would silently
  // misreport "off" regardless of the community's real setting.
  const hasJoinData = community.join !== "";
  const [secondVouch, setSecondVouch] = useState(
    hasJoinData && community.join.includes("2"),
  );
  // Unlike `join`/`code`, `Community` has no `autoFreeze` field at all — not
  // even a mock one — so this setting has no backing data in any mode yet.
  // Same treatment as the second-vouch toggle above when its data is
  // missing: default to off, disable the control, and swap in the "not
  // tracked" subtext rather than silently claiming a state nobody knows.
  const hasAutoFreezeData = false;
  const [autoFreeze, setAutoFreeze] = useState(hasAutoFreezeData);

  function removeMod(m: Moderator) {
    // Live mode has no moderator-management endpoint yet (see
    // adminCommunities.adapters.ts). The roster the drawer shows is real API
    // data, so mutating it client-side + offering a fake Undo would claim a
    // removal that never reached the backend. Stay honest until it's wired.
    if (!demoMode) {
      showToast(t("admin:communities.settings.comingSoonToast"), "info");
      return;
    }
    setModerators((prev) => prev.filter((x) => x.name !== m.name));
    showToast(
      t("admin:communities.settings.modRemovedToast", { name: m.name }),
      "success",
      undefined,
      {
        label: t("admin:common.undo"),
        onClick: () =>
          setModerators((prev) =>
            prev.some((x) => x.name === m.name) ? prev : [...prev, m],
          ),
      },
    );
  }

  return (
    <div className={styles.pane}>
      {hasJoinData && (
        <div className={styles.setRow}>
          <div className={styles.setTop}>
            <div className={styles.setLabel}>
              {t("admin:communities.settings.whoCanJoin")}
            </div>
            <AdminChip tone="plum">{community.join}</AdminChip>
          </div>
        </div>
      )}

      <div className={styles.setRow}>
        <div className={styles.setLabel}>
          {t("admin:communities.settings.moderators")}
        </div>
        <div className={styles.modChips}>
          {moderators.map((m) => (
            <span key={m.name} className={styles.modChip}>
              {shortName(m.name)}
              <button
                type="button"
                className={styles.modChipX}
                aria-label={t("admin:communities.settings.removeModAriaLabel", {
                  name: m.name,
                })}
                onClick={() => removeMod(m)}
              >
                <FiX />
              </button>
            </span>
          ))}
          <button
            type="button"
            className={styles.addBtn}
            onClick={() =>
              showToast(
                t(
                  demoMode
                    ? "admin:communities.settings.addModToast"
                    : "admin:communities.settings.comingSoonToast",
                ),
                "info",
              )
            }
          >
            {t("admin:communities.settings.addModCta")}
          </button>
        </div>
      </div>

      <ToggleRow
        title={t("admin:communities.settings.secondVouch.title")}
        sub={
          hasJoinData
            ? t("admin:communities.settings.secondVouch.sub")
            : t("admin:communities.settings.secondVouch.unavailableSub")
        }
        checked={secondVouch}
        disabled={!hasJoinData}
        onChange={(v) => {
          setSecondVouch(v);
          showToast(
            t(
              v
                ? "admin:communities.settings.secondVouch.onToast"
                : "admin:communities.settings.secondVouch.offToast",
            ),
            "info",
          );
        }}
      />
      <ToggleRow
        title={t("admin:communities.settings.autoFreeze.title")}
        sub={
          hasAutoFreezeData
            ? t("admin:communities.settings.autoFreeze.sub")
            : t("admin:communities.settings.autoFreeze.unavailableSub")
        }
        checked={autoFreeze}
        disabled={!hasAutoFreezeData}
        onChange={(v) => {
          setAutoFreeze(v);
          showToast(
            t(
              v
                ? "admin:communities.settings.autoFreeze.onToast"
                : "admin:communities.settings.autoFreeze.offToast",
            ),
            "info",
          );
        }}
      />

      {community.code !== "" && (
        <div className={styles.setRow}>
          <div className={styles.setTop}>
            <div className={styles.setLabel}>
              {t("admin:communities.settings.codeOfCare")}
            </div>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() =>
                showToast(t("admin:communities.settings.codeToast"), "info")
              }
            >
              {t("admin:communities.settings.viewCta")}
            </button>
          </div>
          <div className={styles.setDetail}>{community.code}</div>
        </div>
      )}

      <div className={styles.setRow}>
        <div className={styles.setTop}>
          <div className={styles.setLabel}>
            {t("admin:communities.settings.visibility")}
          </div>
          <AdminChip tone={community.visibility === "public" ? "jade" : "violet"}>
            {t(`admin:${visLabelKey(community.visibility)}`)}
          </AdminChip>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  sub,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
        <div className={styles.toggleTitle}>{title}</div>
        <div className={styles.toggleSub}>{sub}</div>
      </div>
      <AdminToggle
        checked={checked}
        onChange={onChange}
        label={title}
        disabled={disabled}
      />
    </div>
  );
}
