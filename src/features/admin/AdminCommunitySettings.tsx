import { useState } from "react";
import { FiX } from "react-icons/fi";
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
  const { showToast } = useToast();
  const [mods, setMods] = useState<Moderator[]>(community.mods);
  const [secondVouch, setSecondVouch] = useState(community.join.includes("2"));
  const [autoFreeze, setAutoFreeze] = useState(true);

  function removeMod(m: Moderator) {
    setMods((prev) => prev.filter((x) => x.name !== m.name));
    showToast(
      t("admin:communities.settings.modRemovedToast", { name: m.name }),
      "success",
      undefined,
      {
        label: t("admin:common.undo"),
        onClick: () =>
          setMods((prev) =>
            prev.some((x) => x.name === m.name) ? prev : [...prev, m],
          ),
      },
    );
  }

  return (
    <div className={styles.pane}>
      <div className={styles.setRow}>
        <div className={styles.setTop}>
          <div className={styles.setLabel}>
            {t("admin:communities.settings.whoCanJoin")}
          </div>
          <AdminChip tone="plum">{community.join}</AdminChip>
        </div>
      </div>

      <div className={styles.setRow}>
        <div className={styles.setLabel}>
          {t("admin:communities.settings.moderators")}
        </div>
        <div className={styles.modChips}>
          {mods.map((m) => (
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
              showToast(t("admin:communities.settings.addModToast"), "info")
            }
          >
            {t("admin:communities.settings.addModCta")}
          </button>
        </div>
      </div>

      <ToggleRow
        title={t("admin:communities.settings.secondVouch.title")}
        sub={t("admin:communities.settings.secondVouch.sub")}
        checked={secondVouch}
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
        sub={t("admin:communities.settings.autoFreeze.sub")}
        checked={autoFreeze}
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

      <div className={styles.setRow}>
        <div className={styles.setTop}>
          <div className={styles.setLabel}>
            {t("admin:communities.settings.visibility")}
          </div>
          <AdminChip tone={community.vis === "public" ? "jade" : "violet"}>
            {t(`admin:${visLabelKey(community.vis)}`)}
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
}: {
  title: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
        <div className={styles.toggleTitle}>{title}</div>
        <div className={styles.toggleSub}>{sub}</div>
      </div>
      <AdminToggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}
