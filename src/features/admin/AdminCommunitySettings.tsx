import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModeratorsRow } from "./AdminCommunityModerators";
import { AdminChip, AdminToggle } from "./ui";
import { visLabelKey, type Community } from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

export function SettingsPane({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
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

      <ModeratorsRow community={community} />

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
