import { Link } from "react-router-dom";
import { thread as threadPath } from "../../app/routeMap";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Thread } from "../forum/forum.data";
import {
  ELIGIBILITY_LABEL_KEYS,
  SCOPE_LABEL_KEYS,
} from "../forum/funding/funding.data";
import {
  amountRangeLabel,
  callDeadlineCopy,
} from "../forum/funding/fundingFormat";
import css from "./StudioCalls.module.css";

/** One open Funding call in Studio's own style: funder, title (to the forum
 *  thread), amount, deadline countdown, who can apply and where. Every state
 *  is the server's; the deadline line reads "Closed" once its instant passes
 *  on this clock (callDeadlineCopy's one display-only rule). */
export function StudioFundingCallCard({
  thread,
  nowMs,
}: {
  thread: Thread;
  nowMs: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const funding = thread.funding;
  if (!funding) return null;
  const notStated = t("studio:callsLive.card.notStated");
  const deadline = callDeadlineCopy(fmt, funding, nowMs);
  const facts = [
    {
      labelKey: "studio:callsLive.card.amount",
      value:
        amountRangeLabel(t, fmt, funding.amountMin, funding.amountMax) ??
        notStated,
    },
    {
      labelKey: "studio:callsLive.card.deadline",
      value: deadline ? t(deadline.key, deadline.values) : notStated,
      tone: deadline?.tone,
    },
    {
      labelKey: "studio:callsLive.card.eligibility",
      value:
        funding.eligibility.length > 0
          ? funding.eligibility
              .map((value) => t(ELIGIBILITY_LABEL_KEYS[value]))
              .join(", ")
          : notStated,
    },
    {
      labelKey: "studio:callsLive.card.scope",
      value: funding.scope ? t(SCOPE_LABEL_KEYS[funding.scope]) : notStated,
    },
  ];
  return (
    <article className={css.card}>
      <div className={css.funder}>{funding.funderName ?? funding.linkHost}</div>
      <h2 className={css.cardTitle}>
        <Link
          to={threadPath(thread.slug ?? thread.id)}
          className={css.cardLink}
        >
          {thread.title}
        </Link>
      </h2>
      <dl className={css.facts}>
        {facts.map((fact) => (
          <div key={fact.labelKey} className={css.fact}>
            <dt>{t(fact.labelKey)}</dt>
            <dd data-tone={fact.tone}>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
