import { FiSlash } from "react-icons/fi";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromParts } from "../../shared/lib/initials";
import { useEventBans, useLiftEventBan } from "./api/useEventBans";
import styles from "./ManageGatheringPage.module.css";

/**
 * Who is barred from this gathering, and the way to lift it (LOC-08).
 *
 * Organisers only, on both sides of the wire. The `reason` on each row is the
 * organisers' own note about their own evening: it was never sent to the
 * person it names and never will be.
 *
 * Lifting a bar does not re-add anyone. The host reopens the door; the member
 * decides whether to walk back through it.
 */
export function ManageBarredList({
  slug,
  demoMode,
}: {
  slug: string;
  demoMode: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { data: bans } = useEventBans(slug, !demoMode);
  const liftBan = useLiftEventBan(slug);

  // Demo has no real door to guard, and a fabricated barred list is the last
  // thing this surface should show.
  if (demoMode) return null;

  const rows = bans ?? [];

  return (
    <>
      <div className={styles.attSectionLabel} style={{ marginTop: 20 }}>
        {t("gatherings:manage.bans.listHeading", { count: rows.length })}
      </div>
      {rows.length === 0 ? (
        <EmptyState
          compact
          icon={<FiSlash />}
          title={t("gatherings:manage.bans.emptyTitle")}
          description={t("gatherings:manage.bans.emptyDescription")}
        />
      ) : (
        <div className={styles.attList}>
          {rows.map((ban) => {
            const name = `${ban.firstName} ${ban.lastName}`.trim();
            return (
              <div className={styles.attRow} key={ban.slug}>
                <Avatar
                  initials={initialsFromParts(ban.firstName, ban.lastName)}
                  tint="plum"
                  size={40}
                  src={ban.avatarUrl ?? undefined}
                  alt={name}
                />
                <div className={styles.attInfo}>
                  <div className={styles.attName}>{name}</div>
                  <div className={styles.attMeta}>
                    {t("gatherings:manage.bans.barredOn", {
                      date: fmt.date(new Date(ban.createdAt), {
                        day: "numeric",
                        month: "short",
                      }),
                    })}
                  </div>
                  {ban.reason && (
                    <div className={styles.attMeta}>{ban.reason}</div>
                  )}
                </div>
                <div className={styles.attActions}>
                  <Button
                    variant="ghost"
                    className={styles.attActionBtn}
                    disabled={liftBan.isPending}
                    aria-label={t("gatherings:manage.bans.liftAria", { name })}
                    onClick={() =>
                      liftBan.mutate(ban.slug, {
                        onSuccess: () =>
                          showToast(
                            t("gatherings:manage.bans.liftedToast", { name }),
                            "success",
                          ),
                        onError: () =>
                          showToast(
                            t("gatherings:manage.bans.errorToast"),
                            "error",
                          ),
                      })
                    }
                  >
                    {t("gatherings:manage.bans.liftCta")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
