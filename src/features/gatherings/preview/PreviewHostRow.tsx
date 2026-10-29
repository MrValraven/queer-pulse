import { Avatar } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import { useEventHostScope } from "../eventHostScope";
import type { GatheringForm } from "../useGatheringForm";
import { MAX_STACKED_HOST_AVATARS } from "./gatheringPreview.data";
import { hostNamesText, previewCost } from "./gatheringPreviewReading";
import {
  previewCohostPeople,
  useSignedInHost,
  type PreviewPerson,
} from "./usePreviewHosts";
import styles from "./GatheringPreviewPanel.module.css";

/**
 * The host name an event QueerPulse hosts shows. The public event page writes
 * the same brand name with no face beside it: `GatheringSidebar` falls back to
 * "Hosted by {gathering.host || "QueerPulse"}" when the event has no member
 * host, and the house events in `data.ts` carry `host: "QueerPulse"`.
 */
const HOUSE_HOST_NAME = "QueerPulse";

/** The stacked faces, "Hosted by" names and the price chip. */
function HostRowView({
  form,
  people,
  names,
}: {
  form: GatheringForm;
  /** Empty for a house event, which has no face to stack. */
  people: readonly PreviewPerson[];
  names: string;
}) {
  const { t } = useTranslation();
  const cost = previewCost(form, t);
  return (
    <div className={styles.hostRow}>
      {people.length > 0 && (
        <span className={styles.avatarStack} aria-hidden>
          {people.slice(0, MAX_STACKED_HOST_AVATARS).map((person) => (
            <Avatar
              key={person.key}
              className={styles.stackedAvatar}
              initials={person.initials}
              tint={person.tint}
              src={person.avatarUrl}
              size={28}
            />
          ))}
        </span>
      )}
      <span className={styles.hostNames}>
        <Translation
          i18nKey="gatherings:create.v2.preview.hostedBy"
          values={{ names }}
          components={{ b: <b /> }}
        />
      </span>
      <span className={cx(styles.price, cost.isFree && styles.priceFree)}>
        {cost.label}
      </span>
    </div>
  );
}

/** The signed-in host, then each co-host picked, read off the form. An event
 *  QueerPulse hosts names QueerPulse alone, the way its public page does. */
export function PreviewHostRow({ form }: { form: GatheringForm }) {
  const { isHouseEvent } = useEventHostScope();
  const host = useSignedInHost();
  if (isHouseEvent) {
    return <HostRowView form={form} people={[]} names={HOUSE_HOST_NAME} />;
  }
  const people = [host, ...previewCohostPeople(form.cohosts)];
  return (
    <HostRowView
      form={form}
      people={people}
      names={hostNamesText(people.map((person) => person.firstName))}
    />
  );
}
