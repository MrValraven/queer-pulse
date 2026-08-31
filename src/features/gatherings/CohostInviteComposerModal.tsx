import { useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  FormField,
  MemberIdentity,
  MemberSelectList,
  Modal,
  Select,
  type MemberSelectPerson,
  type SelectOption,
} from "../../shared/components/ui";
import {
  formatIsoDate,
  todayPlain,
} from "../../shared/components/ui/plainDate";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import {
  COHOST_INVITE_COMMITMENTS,
  COHOST_INVITE_ROLES,
} from "./cohostInviteOptions";
import { useSendCohostInvite } from "./api/useEventMutations";
import styles from "./CohostInviteComposerModal.module.css";

/** Mirrors `CreateCohostInviteDto`'s `@MaxLength(500)` on the note, so the
 *  counter runs out at the same point the backend would reject the send. */
const MESSAGE_MAX_LENGTH = 500;

/**
 * Two-step host-side flow for sending a real cohost invite: pick a real
 * connection, then set the role/commitment/optional note. Replaces the old
 * instant-add `AddCohostModal`. Submitting here only sends the invite; a
 * cohost joins the roster once they accept it (`CoHostInvitePage`).
 */
export function CohostInviteComposerModal({
  slug,
  /** Slugs already cohosting, hidden from the pool. */
  excludeSlugs,
  onSent,
  onClose,
}: {
  slug: string;
  excludeSlugs: string[];
  onSent: (name: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const staffMap = useStaffMap();
  const { views: connections } = useConnectionsList("all");
  const sendInvite = useSendCohostInvite(slug);

  const [picked, setPicked] = useState<MemberSelectPerson | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [commitment, setCommitment] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [replyByDate, setReplyByDate] = useState<string | null>(null);

  const people = useMemo<MemberSelectPerson[]>(
    () =>
      connections.map((c) => ({
        slug: c.slug,
        name: c.name,
        avatarUrl: c.photo,
        pronouns: c.pron,
        staffRole: staffMap[c.slug]?.tier ?? undefined,
        staffBadgedRoles: staffMap[c.slug]?.badgedStaffRoles,
      })),
    [connections, staffMap],
  );

  const roleOptions: SelectOption[] = COHOST_INVITE_ROLES.map((r) => ({
    value: r.id,
    label: t(r.labelKey),
  }));
  const commitmentOptions: SelectOption[] = COHOST_INVITE_COMMITMENTS.map(
    (c) => ({
      value: c.id,
      label: t(c.labelKey),
    }),
  );

  // What the picked role/commitment actually means, shown as the field's
  // helper. The invitee reads these same descriptions on their invite page,
  // so the host chooses against the wording the other person will see.
  const roleDescriptionKey = COHOST_INVITE_ROLES.find(
    (r) => r.id === role,
  )?.descriptionKey;
  const commitmentDescriptionKey = COHOST_INVITE_COMMITMENTS.find(
    (c) => c.id === commitment,
  )?.descriptionKey;

  const pick = (candidateSlug: string) => {
    const person = people.find((p) => p.slug === candidateSlug);
    if (person) setPicked(person);
  };

  const send = () => {
    if (!picked || !role || !commitment) return;
    sendInvite.mutate({
      inviteeSlug: picked.slug,
      role,
      commitment,
      message: message.trim() || undefined,
      replyByDate: replyByDate ?? undefined,
    });
    onSent(picked.name);
  };

  if (!picked) {
    return (
      <Modal
        eyebrow={t("gatherings:cohost.addModal.eyebrow")}
        title={
          <Translation
            i18nKey="gatherings:cohost.addModal.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("gatherings:cohost.addModal.sub")}
        onClose={onClose}
      >
        <MemberSelectList
          people={people}
          selected={new Set()}
          onToggle={pick}
          multiSelect={false}
          excludeSlugs={excludeSlugs}
          searchPlaceholder={t("gatherings:cohost.addModal.searchLabel")}
        />
      </Modal>
    );
  }

  return (
    <Modal
      eyebrow={t("gatherings:cohost.addModal.step2Eyebrow")}
      title={
        <Translation
          i18nKey="gatherings:cohost.addModal.step2Title"
          values={{ name: picked.name }}
          components={{ em: <em /> }}
        />
      }
      sub={t("gatherings:cohost.addModal.step2Sub")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="primary"
            onClick={send}
            disabled={!role || !commitment || sendInvite.isPending}
          >
            {t("gatherings:cohost.addModal.sendCta")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
        </>
      }
    >
      <div className={styles.pickedRow}>
        <MemberIdentity person={picked} secondary={picked.pronouns} size={38} />
        <Button variant="ghost" size="sm" onClick={() => setPicked(null)}>
          {t("gatherings:cohost.addModal.backCta")}
        </Button>
      </div>

      <div className={styles.pairRow}>
        <FormField
          label={t("gatherings:cohost.addModal.roleLabel")}
          required
          helper={roleDescriptionKey ? t(roleDescriptionKey) : undefined}
        >
          <Select
            options={roleOptions}
            value={role}
            onChange={setRole}
            placeholder={t("gatherings:cohost.addModal.rolePlaceholder")}
          />
        </FormField>
        <FormField
          label={t("gatherings:cohost.addModal.commitmentLabel")}
          required
          helper={
            commitmentDescriptionKey ? t(commitmentDescriptionKey) : undefined
          }
        >
          <Select
            options={commitmentOptions}
            value={commitment}
            onChange={setCommitment}
            placeholder={t("gatherings:cohost.addModal.commitmentPlaceholder")}
          />
        </FormField>
      </div>

      <FormField
        label={t("gatherings:cohost.addModal.messageLabel")}
        labelAside={`${message.length}/${MESSAGE_MAX_LENGTH}`}
        helper={t("gatherings:cohost.addModal.messageHelper")}
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("gatherings:cohost.addModal.messagePlaceholder")}
          maxLength={MESSAGE_MAX_LENGTH}
          rows={4}
        />
      </FormField>
      <FormField
        label={t("gatherings:cohost.addModal.replyByLabel")}
        helper={t("gatherings:cohost.addModal.replyByHelper")}
      >
        <DatePicker
          mode="date"
          value={replyByDate}
          onChange={setReplyByDate}
          label={t("gatherings:cohost.addModal.replyByLabel")}
          min={formatIsoDate(todayPlain())}
          clearable
        />
      </FormField>
    </Modal>
  );
}
