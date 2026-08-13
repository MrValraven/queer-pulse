import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModeratorsRow } from "./AdminCommunityModerators";
import { AdminChip, AdminToggle } from "./ui";
import { visLabelKey, type Community } from "./adminCommunities.data";
import { useUpdateAdminCommunity } from "./api/useUpdateAdminCommunity";
import styles from "./AdminCommunitiesPage.module.css";

export function SettingsPane({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updateCommunity = useUpdateAdminCommunity();

  // The two policy toggles below read real persisted columns
  // (`requiresSecondVouch` / `autoFreezeOnReports`) and write them through the
  // admin PATCH. Persistence is real; enforcement (gating a join on a second
  // vouch; auto-freezing on a report pile-up) is a deliberate follow-up. Only
  // the "who can join" summary still depends on the backend-less `join` string,
  // so it stays gated on having that data.
  const hasJoinData = community.join !== "";

  const saveToggle = (
    patch: { requiresSecondVouch: boolean } | { autoFreezeOnReports: boolean },
    value: boolean,
    onToastKey: string,
    offToastKey: string,
  ) => {
    updateCommunity.mutate(
      { slug: community.slug, patch },
      {
        onSuccess: () =>
          showToast(t(value ? onToastKey : offToastKey), "success"),
        onError: () =>
          showToast(t("admin:communities.settings.saveErrorToast"), "error"),
      },
    );
  };

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
        sub={t("admin:communities.settings.secondVouch.sub")}
        checked={community.requiresSecondVouch}
        disabled={updateCommunity.isPending}
        onChange={(value) =>
          saveToggle(
            { requiresSecondVouch: value },
            value,
            "admin:communities.settings.secondVouch.onToast",
            "admin:communities.settings.secondVouch.offToast",
          )
        }
      />
      <ToggleRow
        title={t("admin:communities.settings.autoFreeze.title")}
        sub={t("admin:communities.settings.autoFreeze.sub")}
        checked={community.autoFreezeOnReports}
        disabled={updateCommunity.isPending}
        onChange={(value) =>
          saveToggle(
            { autoFreezeOnReports: value },
            value,
            "admin:communities.settings.autoFreeze.onToast",
            "admin:communities.settings.autoFreeze.offToast",
          )
        }
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

      {community.frozen && (
        <div className={styles.setRow}>
          <div className={styles.setTop}>
            <div className={styles.setLabel}>
              {t("admin:communities.settings.status")}
            </div>
            <AdminChip tone="coral">
              {t("admin:communities.settings.frozenChip")}
            </AdminChip>
          </div>
        </div>
      )}
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
