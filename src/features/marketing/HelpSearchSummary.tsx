import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";

/**
 * The help search's result sentence: the answer count rolls as the query
 * narrows or widens. The query rides a slot too, so what the reader typed
 * renders as plain text and is never read as catalog markup.
 */
export function HelpSearchSummary({
  count,
  query,
}: {
  count: number;
  query: string;
}) {
  const fmt = useFormat();
  return (
    <Translation
      i18nKey="marketing:help.search.summary"
      values={{ count, query }}
      slots={{
        count: <RollingNumber value={fmt.number(count)} numericValue={count} />,
        query,
      }}
    />
  );
}
