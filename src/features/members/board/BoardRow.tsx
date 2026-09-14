import { useState } from "react";
import { KindChip } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import type { BoardMatchDTO } from "../api/boardInsights.api";
import type { BoardItem } from "../data/members";
import { boardLifespan } from "./boardLifespan";
import { BoardLifespanMeter } from "./BoardLifespanMeter";
import { BoardRowResponders } from "./BoardRowResponders";
import { BoardMatchPill } from "./BoardMatchPill";
import { BoardRowActions } from "./BoardRowActions";
import styles from "./BoardSection.module.css";

/** What a renewal overrides locally: a fresh expiry and the bumped renew
 *  count. Both matter for the derived state below — the expiry alone would
 *  leave a post at `BOARD_RENEW_LIMIT` showing a renew button it can no
 *  longer use, since nothing else in demo mode ever updates `renewCount`. */
interface RenewOverride {
  expiresAt: string;
  renewCount: number;
}

/**
 * One board post: the kind chip and lifespan meter on the left, and on the
 * right the title, when it was posted, who offered to help, any reciprocal
 * match, and the actions.
 *
 * The title is plain text. It used to link to the public offer board, which
 * renders a coming-soon state in live mode, so every title was a dead end; a
 * post carries no body to open in place either, and a visitor's respond action
 * is where detail gets exchanged.
 *
 * `nowMs` arrives from the section rather than being read here, so demo mode
 * can pin the clock. See `boardLifespan`.
 */
export function BoardRow({
  item,
  isSelf,
  memberSlug,
  memberFirst,
  nowMs,
  matches,
}: {
  item: BoardItem;
  isSelf: boolean;
  memberSlug: string;
  memberFirst: string;
  nowMs: number;
  matches: BoardMatchDTO[];
}) {
  const { t, language } = useTranslation();
  // Optimistic overrides, so a close or a renew shows immediately without
  // waiting on the profile query's refetch. Demo mode never refetches at all,
  // which makes these the only way it reflects either action. Both feed
  // `effective` below, which `boardLifespan` and `BoardRowActions` derive
  // everything from, so the meter, the expired styling, and which actions
  // show all recompute from the overridden values rather than the original
  // props.
  const [closedOverride, setClosedOverride] = useState<{
    closedNote?: string;
    closedAt?: string;
  } | null>(null);
  const [renewOverride, setRenewOverride] = useState<RenewOverride | null>(
    null,
  );

  const effective: BoardItem = {
    ...item,
    status: closedOverride ? "closed" : item.status,
    closedNote: closedOverride?.closedNote ?? item.closedNote,
    expiresAt: renewOverride?.expiresAt ?? item.expiresAt,
    renewCount: renewOverride?.renewCount ?? item.renewCount,
  };
  const isClosed = effective.status === "closed";
  const lifespan = boardLifespan(effective, nowMs);

  return (
    <article
      className={`${styles.row} ${lifespan.isExpired ? styles.rowExpired : ""}`}
    >
      <div className={styles.rowLead}>
        <KindChip kind={item.kind}>
          {item.kind === "looking"
            ? t("members:content.board.looking")
            : t("members:content.board.offering")}
        </KindChip>
        {isClosed ? null : <BoardLifespanMeter lifespan={lifespan} />}
      </div>

      <div className={styles.rowBody}>
        <h3 className={`${styles.title} ${isClosed ? styles.titleDone : ""}`}>
          {item.title}
        </h3>

        <div
          className={`${styles.meta} ${
            lifespan.isExpired ? styles.metaExpired : ""
          }`}
        >
          {item.createdAt && (
            <span>
              {t("members:content.board.postedOn", {
                date: formatDate(item.createdAt, language, {
                  day: "numeric",
                  month: "short",
                }),
              })}
            </span>
          )}
          {isClosed ? (
            <span>
              {effective.closedNote
                ? t("members:profile.board.foundItWithNote", {
                    note: effective.closedNote,
                  })
                : t("members:profile.board.foundIt")}
            </span>
          ) : lifespan.isExpired ? (
            <span>{t("members:content.board.expiredQuietly")}</span>
          ) : (
            <span>
              {t("members:content.board.postLength", {
                count: lifespan.windowDays,
              })}
            </span>
          )}
        </div>

        <BoardRowResponders
          responders={item.responders ?? []}
          responseCount={item.responseCount ?? 0}
        />

        {isSelf &&
          matches.map((match) => (
            <BoardMatchPill
              key={`${match.slug}-${match.postSlug}`}
              match={match}
            />
          ))}

        {!isClosed && (
          <BoardRowActions
            item={effective}
            isSelf={isSelf}
            memberSlug={memberSlug}
            memberFirst={memberFirst}
            lifespan={lifespan}
            onClosed={setClosedOverride}
            onRenewed={setRenewOverride}
          />
        )}
      </div>
    </article>
  );
}
