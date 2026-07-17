import type { ImageSlotTint } from "../../shared/components/ui";

export interface Equipment {
  nameKey: string;
  specsKey: string;
  statusKey: string;
  available: boolean;
  tint: ImageSlotTint;
}

export const EQUIPMENT: Equipment[] = [
  {
    nameKey: "resources:sharedEquipment.item1.name",
    specsKey: "resources:sharedEquipment.item1.specs",
    statusKey: "resources:sharedEquipment.item1.status",
    available: true,
    tint: "coral",
  },
  {
    nameKey: "resources:sharedEquipment.item2.name",
    specsKey: "resources:sharedEquipment.item2.specs",
    statusKey: "resources:sharedEquipment.item2.status",
    available: true,
    tint: "jade",
  },
  {
    nameKey: "resources:sharedEquipment.item3.name",
    specsKey: "resources:sharedEquipment.item3.specs",
    statusKey: "resources:sharedEquipment.item3.status",
    available: false,
    tint: "plum",
  },
  {
    nameKey: "resources:sharedEquipment.item4.name",
    specsKey: "resources:sharedEquipment.item4.specs",
    statusKey: "resources:sharedEquipment.item4.status",
    available: true,
    tint: "plum",
  },
];

export const CARE_KEYS = [
  "resources:sharedEquipment.care1",
  "resources:sharedEquipment.care2",
  "resources:sharedEquipment.care3",
];
