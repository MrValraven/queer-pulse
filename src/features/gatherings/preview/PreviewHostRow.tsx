import { Avatar } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import type { GatheringForm } from "../useGatheringForm";
import { MAX_STACKED_HOST_AVATARS } from "./gatheringPreview.data";
import { hostNamesText, previewCost } from "./gatheringPreviewReading";
import {
  previewCohostPeople,
  useSignedInHost,
  type PreviewPerson,
} from "./usePreviewHosts";
import styles from "./GatheringPreviewPanel.module.css";

/** The stacked faces, "Hosted by" names and the price chip. */
function HostRowView({
  form,
  people,
}: {
  form: GatheringForm;
  people: readonly PreviewPerson[];
}) {
  const { t } = useTranslation();
  const cost = previewCost(form, t);
  const names = hostNamesText(people.map((person) => person.firstName));
  return (
    <div className={styles.hostRow}>
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

/** The signed-in host, then each co-host picked, read off the form. */
export function PreviewHostRow({ form }: { form: GatheringForm }) {
  const host = useSignedInHost();
  return (
    <HostRowView
      form={form}
      people={[host, ...previewCohostPeople(form.cohosts)]}
    />
  );
}
