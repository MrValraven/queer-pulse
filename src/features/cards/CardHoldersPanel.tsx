import { useMemo, useState } from "react";
import { Avatar, SearchInput, SkeletonCard, Tag } from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCardHolders } from "./api/useCardHolders";
import { CardHolderActions, type PendingCardStatus } from "./CardHolderActions";
import { CardHolderCardModal } from "./CardHolderCardModal";
import { CardHolderStatusModal } from "./CardHolderStatusModal";
import type { CardProgramDTO, IssuerCardDTO } from "./api/cards.api";
import styles from "./CardHoldersPanel.module.css";

function CardHolderRow({
  holder,
  onOpen,
  onRequestStatus,
}: {
  holder: IssuerCardDTO;
  onOpen: (cardId: string) => void;
  onRequestStatus: (pending: PendingCardStatus) => void;
}) {
  const { t } = useTranslation();

  return (
    <li className={styles.row}>
      {/* A stretched overlay button rather than a clickable row: the row holds
          real action buttons, and ARIA forbids interactive content inside a
          role="button". This sits underneath them (see the z-indexes in the
          CSS), so pressing Pause or Revoke never also opens the card. */}
      <button
        type="button"
        className={styles.rowOpen}
        onClick={() => onOpen(holder.id)}
        aria-label={t("cards:holders.viewCardAria", {
          name: holder.holderName,
        })}
      />
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
      <CardHolderActions
        holder={holder}
        onRequestStatus={onRequestStatus}
        className={styles.actions}
      />
    </li>
  );
}

/** Every card this community has issued, with the owner and mod controls to
 *  suspend, revoke, and reinstate one — and, on any row, the card itself.
 *
 *  The programme comes in as a prop rather than being re-fetched here: the
 *  section above already holds it, and the card a member is looking at is the
 *  programme's design applied to their own row. */
export function CardHoldersPanel({
  slug,
  communityName,
  program,
}: {
  slug: string;
  communityName: string;
  program: CardProgramDTO;
}) {
  const { t } = useTranslation();
  const { holders, isLoading } = useCardHolders(slug);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<PendingCardStatus | null>(null);
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return holders;
    return holders.filter(
      (holder) =>
        holder.holderName.toLowerCase().includes(needle) ||
        holder.serial.toLowerCase().includes(needle),
    );
  }, [holders, query]);

  // Held by id, not by value: pausing a card from inside the open card
  // refetches the roster, and looking the row up again each render means the
  // card on screen shows its new status instead of the stale one it opened
  // with. A card that vanishes from the roster closes itself the same way.
  const openCard = openCardId
    ? (holders.find((holder) => holder.id === openCardId) ?? null)
    : null;

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
            <CardHolderRow
              key={holder.id}
              holder={holder}
              onOpen={setOpenCardId}
              onRequestStatus={setPending}
            />
          ))}
        </ul>
      )}

      {openCard ? (
        <CardHolderCardModal
          holder={openCard}
          program={program}
          communityName={communityName}
          communitySlug={slug}
          onRequestStatus={setPending}
          onClose={() => setOpenCardId(null)}
        />
      ) : null}

      {/* Rendered here rather than inside the card modal so one confirmation
          serves both entry points, and so acting from an open card leaves that
          card open behind the confirmation to return to. */}
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
