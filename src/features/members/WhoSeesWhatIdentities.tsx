import { Toggle, Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileEdit } from "../../app/providers/useProfile";
import { routes } from "../../app/routeMap";
import { useDiscoverableIdentities } from "../settings/api/useDiscoverableIdentities";
import { publishableIdentities } from "../settings/interests.data";
import styles from "./WhoSeesWhatSheet.module.css";

/**
 * Per-identity discoverability, surfaced a second time here (the primary home
 * is Settings → Interests' `DiscoverableIdentitiesSection`) so the whole
 * "who sees what" picture lives in one sheet. Reads/writes the exact same
 * server state via the shared `useDiscoverableIdentities` hook — there is no
 * separate copy of "which identities are published" to keep in sync.
 */
export function WhoSeesWhatIdentities() {
  const { t } = useTranslation();
  const { draft, savedVersion } = useProfileEdit();
  const { showToast } = useToast();
  const draftPublishable = publishableIdentities(draft.identities);
  const { available, published, loading, error, setPublished } =
    useDiscoverableIdentities(draftPublishable, savedVersion);

  const rows = draftPublishable.filter((identity) => available.includes(identity));

  const handleToggle = async (identity: string, next: boolean) => {
    const ok = await setPublished(identity, next);
    if (ok && !next) {
      showToast(t("settings:discoverable.toast.removed"), "info");
    }
  };

  if (draft.identities.length === 0) {
    return (
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {t("members:profile.whoSeesWhat.identities.heading")}
        </h3>
        <p className={styles.emptyLine}>
          {t("members:profile.whoSeesWhat.identities.empty")}{" "}
          <Button variant="ghost" size="sm" to={`${routes.settings}?pane=interests`}>
            {t("members:profile.whoSeesWhat.identities.emptyLink")}
          </Button>
        </p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("members:profile.whoSeesWhat.identities.heading")}
      </h3>
      <p className={styles.sectionSub}>
        {t("members:profile.whoSeesWhat.identities.sub")}
      </p>

      {error && (
        <p className={styles.errorLine} role="alert">
          {t("settings:discoverable.error")}
        </p>
      )}

      {!loading && rows.length > 0 && (
        <div className={styles.rowList}>
          {rows.map((identity) => (
            <div className={styles.row} key={identity}>
              <div>
                <div className={styles.rowTitle}>{identity}</div>
                <div className={styles.rowDesc}>
                  {published.includes(identity)
                    ? t("settings:discoverable.rowOn")
                    : t("settings:discoverable.rowOff")}
                </div>
              </div>
              <Toggle
                checked={published.includes(identity)}
                onChange={(next) => void handleToggle(identity, next)}
                label={t("settings:discoverable.toggleLabel", { label: identity })}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && rows.length === 0 && (
        <p className={styles.emptyLine}>
          {t("members:profile.whoSeesWhat.identities.empty")}{" "}
          <Button variant="ghost" size="sm" to={`${routes.settings}?pane=interests`}>
            {t("members:profile.whoSeesWhat.identities.emptyLink")}
          </Button>
        </p>
      )}
    </section>
  );
}
