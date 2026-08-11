import type { IconType } from "react-icons";
import { FiHeart, FiShield, FiUsers } from "react-icons/fi";
import type { NetworkGroupKey } from "./api/profileNetwork.types";

/**
 * Per-group chrome for the profile network chips + list modal: icon + i18n
 * keys. Resolve `titleKey`/`labelKey`/`labelNoTimeKey` with `t()` — the words
 * are platform chrome, not fetched content. `labelKey` carries a `{time}` token
 * (filled with a `formatRelative` string); `labelNoTimeKey` is the same phrase
 * for a person whose action timestamp is unknown.
 */
export interface NetworkGroupMeta {
  titleKey: string;
  icon: IconType;
  labelKey: string;
  labelNoTimeKey: string;
}

export const NETWORK_GROUP_META: Record<NetworkGroupKey, NetworkGroupMeta> = {
  connected: {
    titleKey: "members:network.group.connected",
    icon: FiUsers,
    labelKey: "members:network.row.connected",
    labelNoTimeKey: "members:network.row.connectedNoTime",
  },
  vouchedGiven: {
    titleKey: "members:network.group.vouchedGiven",
    icon: FiHeart,
    labelKey: "members:network.row.vouchedGiven",
    labelNoTimeKey: "members:network.row.vouchedGivenNoTime",
  },
  vouchedReceived: {
    titleKey: "members:network.group.vouchedReceived",
    icon: FiShield,
    labelKey: "members:network.row.vouchedReceived",
    labelNoTimeKey: "members:network.row.vouchedReceivedNoTime",
  },
};
