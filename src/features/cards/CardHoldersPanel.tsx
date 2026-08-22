import { useMemo, useState } from "react";
import { Avatar, Button, SearchInput, SkeletonCard, Tag } from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCardHolders } from "./api/useCardHolders";
import { CardHolderStatusModal } from "./CardHolderStatusModal";
import type { IssuerCardDTO } from "./api/cards.api";
import styles from "./CardHoldersPanel.module.css";

type NextStatus = "active" | "suspended" | "revoked";
type Pending = { card: IssuerCardDTO; nextStatus: NextStatus };

function CardHolderRow({
  holder,
  onRequestStatus,
}: {
  holder: IssuerCardDTO;
  onRequestStatus: (pending: Pending) => void;
}) {
  const { t } = useTranslation();
  const isActive = holder.status === "active";
  // Expired cards get no status-change action here: reinstating one flips
  // `status` back to active but does not extend `expiresAt`, so the card
  // would keep reading as expired everywhere else. Rather than a
  // fake-success control, an expired card offers nothing to press until a
  // real renewal path exists (open question, out of Phase 1).
  const isExpired = holder.status === "expired";

  return (
    <li className={styles.row}>
      <Avatar
        src={holder.avatarUrl ?? undefined}
        initials={initialsFromName(holder.holderName, "?")}
        name={holder.holderName}
        size={40}
      />
      <div className={styles.identity}>
        <p className={styles.name}>{holder.holderName}</p>
        <p className={styles.serial}>{holder.serial}</p>
        {holder.revokedReason ? (
          <p className={styles.reason}>{holder.revokedReason}</p>
        ) : null}
      </div>
      <Tag className={styles.statusTag}>
        {t(`cards:status.tag.${holder.status}`)}
      </Tag>
      {isExpired ? null : (
        <div className={styles.actions}>
          {isActive ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRequestStatus({ card: holder, nextStatus: "suspended" })}
                aria-label={t("cards:holders.suspendAria", { name: holder.holderName })}
              >
                {t("cards:holders.suspend")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRequestStatus({ card: holder, nextStatus: "revoked" })}
                aria-label={t("cards:holders.revokeAria", { name: holder.holderName })}
              >
                {t("cards:holders.revoke")}
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRequestStatus({ card: holder, nextStatus: "active" })}
              aria-label={t("cards:holders.reinstateAria", { name: holder.holderName })}
            >
              {t("cards:holders.reinstate")}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

/** Every card this community has issued, with the owner and mod controls to
 *  suspend, revoke, and reinstate one. */
export function CardHoldersPanel({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { holders, isLoading } = useCardHolders(slug);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return holders;
    return holders.filter(
      (holder) =>
        holder.holderName.toLowerCase().includes(needle) ||
        holder.serial.toLowerCase().includes(needle),
    );
  }, [holders, query]);

  if (isLoading) {
    return (
      <section aria-label={t("cards:holders.title")} className={styles.panel}>
        <div className={styles.loading}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    );
  }

  return (
    <section aria-label={t("cards:holders.title")} className={styles.panel}>
      <h2 className={styles.title}>{t("cards:holders.title")}</h2>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={t("cards:holders.searchPlaceholder")}
        ariaLabel={t("cards:holders.searchLabel")}
        className={styles.search}
      />

      {filtered.length === 0 ? (
        <p className={styles.empty}>{t("shared:select.noResults")}</p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((holder) => (
            <CardHolderRow key={holder.id} holder={holder} onRequestStatus={setPending} />
          ))}
        </ul>
      )}

      {pending ? (
        <CardHolderStatusModal
          card={pending.card}
          slug={slug}
          nextStatus={pending.nextStatus}
          onClose={() => setPending(null)}
        />
      ) : null}
    </section>
  );
}
