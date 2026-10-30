import { useId, useState } from "react";
import {
  Collapse,
  Tabs,
  tabPanelProps,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useListingTeamMutations } from "../api/useListingTeamMutations";
import { ListingTeamMemberInvitePanel } from "./ListingTeamMemberInvitePanel";
import { ListingTeamPersonaSearch } from "./ListingTeamPersonaSearch";
import { ListingTeamRoleLabelField } from "./ListingTeamRoleLabelField";
import styles from "./ListingTeamInvitePicker.module.css";

const KEY = "marketing:listBusiness.team";
const ROLE_FIELD_ID = "listing-team-invite-role";

type InviteTabId = "personas" | "members";

interface ListingTeamInvitePickerProps {
  listingRef: string;
  isListingOpen: boolean;
}

/**
 * The invite half of the Team section: one role field, then a switch between
 * searching personas and picking one of your connections. The role typed here
 * goes with whichever invite is sent.
 */
export function ListingTeamInvitePicker({
  listingRef,
  isListingOpen,
}: ListingTeamInvitePickerProps) {
  const { t } = useTranslation();
  const tabsId = useId();
  const [activeTab, setActiveTab] = useState<InviteTabId>("personas");
  const [roleLabel, setRoleLabel] = useState("");
  const [roleLabelEditCount, setRoleLabelEditCount] = useState(0);
  const { invite, inviteMember } = useListingTeamMutations(listingRef);
  const isInviting = invite.isPending || inviteMember.isPending;

  return (
    <div className={styles.picker}>
      <h3 className={styles.heading}>{t(`${KEY}.inviteHeading`)}</h3>
      <ListingTeamRoleLabelField
        id={ROLE_FIELD_ID}
        value={roleLabel}
        onChange={(nextRoleLabel) => {
          setRoleLabelEditCount((count) => count + 1);
          setRoleLabel(nextRoleLabel);
        }}
        isDisabled={isInviting}
      />
      <Tabs
        idPrefix={tabsId}
        label={t(`${KEY}.invite.tabsLabel`)}
        tabs={[
          { id: "personas", label: t(`${KEY}.invite.tab.personas`) },
          { id: "members", label: t(`${KEY}.invite.tab.members`) },
        ]}
        active={activeTab}
        onChange={(nextTab) => setActiveTab(nextTab as InviteTabId)}
      />
      <Collapse isOpen={activeTab === "personas"}>
        <div className={styles.tabPanel} {...tabPanelProps(tabsId, "personas")}>
          <ListingTeamPersonaSearch
            listingRef={listingRef}
            isListingOpen={isListingOpen}
            roleLabel={roleLabel}
            roleLabelEditCount={roleLabelEditCount}
            invite={invite}
            onInvited={() => setRoleLabel("")}
          />
        </div>
      </Collapse>
      <Collapse isOpen={activeTab === "members"}>
        <div className={styles.tabPanel} {...tabPanelProps(tabsId, "members")}>
          <ListingTeamMemberInvitePanel
            listingRef={listingRef}
            isListingOpen={isListingOpen}
            roleLabel={roleLabel}
            roleLabelEditCount={roleLabelEditCount}
            inviteMember={inviteMember}
            onInvited={() => setRoleLabel("")}
          />
        </div>
      </Collapse>
    </div>
  );
}
