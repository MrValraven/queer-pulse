import { StatGrid, StatTile } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioEuroAmount } from "./StudioEuroAmount";

const FUND_BALANCE = 24180;
const FUND_PAID_THIS_QUARTER = 6240;
const FUND_PEOPLE_PAID_THIS_YEAR = 148;

/** The solidarity fund's three headline figures on the shared stat tiles,
 *  with every euro amount in the one Studio format. */
export function StudioFundBalance() {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <StatGrid columns={3}>
      <StatTile
        label={t("studio:fund.balance.label")}
        value={<StudioEuroAmount value={FUND_BALANCE} />}
        hint={t("studio:demo.fund.balanceNote")}
      />
      <StatTile
        label={t("studio:fund.balance.paidThisQuarterLabel")}
        value={<StudioEuroAmount value={FUND_PAID_THIS_QUARTER} />}
      />
      <StatTile
        label={t("studio:fund.balance.peoplePaidLabel", {
          count: FUND_PEOPLE_PAID_THIS_YEAR,
        })}
        value={fmt.number(FUND_PEOPLE_PAID_THIS_YEAR)}
      />
    </StatGrid>
  );
}
