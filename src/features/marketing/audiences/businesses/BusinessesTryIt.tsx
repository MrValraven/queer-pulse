import { useMemo, useState } from "react";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ListingKind } from "../../listBusiness/listingMobile.data";
import { AudienceSection } from "../shared/AudienceSection";
import type { TryItOption } from "../shared/audiences.data";
import { ShowcaseFrame } from "../shared/ShowcaseFrame";
import { TryItSwitch } from "../shared/TryItSwitch";
import { BUSINESS_KIND_OPTIONS } from "./businessesLanding.data";
import { buildSampleBusiness } from "./businessesSample.data";
import { BusinessesLocationView } from "./BusinessesLocationView";
import { SampleBusinessCard } from "./SampleBusinessCard";
import styles from "./BusinessesTryIt.module.css";

/**
 * "Try it": the visitor picks where people find the sample business and the
 * real card and its location view answer, the same way a listing changes
 * when its owner switches kind in the wizard. The tablist sits outside the
 * inert frame.
 */
export function BusinessesTryIt() {
  const { t } = useTranslation();
  const [kind, setKind] = useState<ListingKind>("place");
  const today = useMemo(() => new Date(), []);
  const place = useMemo(
    () => buildSampleBusiness(t, kind, today),
    [t, kind, today],
  );
  const options: TryItOption<ListingKind>[] = BUSINESS_KIND_OPTIONS.map(
    ({ id, labelKey, Icon }) => ({ id, label: t(labelKey), Icon }),
  );
  const activeLabel = options.find((option) => option.id === kind)?.label;

  return (
    <AudienceSection
      sectionId="try-it"
      eyebrow={t("audiences:tryIt.eyebrow")}
      title={
        <Translation
          i18nKey="forBusinesses:tryIt.title"
          components={{ em: <em /> }}
        />
      }
      lede={t("forBusinesses:tryIt.lede")}
      tone="wash"
      className={styles.section}
    >
      <TryItSwitch<ListingKind>
        label={t("marketing:listBusiness.step0.whereFound.aria")}
        options={options}
        activeId={kind}
        onChange={setKind}
      >
        <ShowcaseFrame
          label={t("forBusinesses:tryIt.frame", { kind: activeLabel ?? "" })}
          device="browser"
        >
          <div className={styles.stage}>
            <SampleBusinessCard place={place} className={styles.card} />
            <BusinessesLocationView place={place} kind={kind} />
          </div>
        </ShowcaseFrame>
      </TryItSwitch>
    </AudienceSection>
  );
}
