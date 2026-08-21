import { FiCheck } from "react-icons/fi";
import { AvatarStack, ImageSlot } from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { breakpoint, mediaMax } from "../../../shared/theme/breakpoints";
import type { HousingRoomContent } from "./housingShowcase.data";
import styles from "./HousingShowcase.module.css";

interface HousingRoomPanelProps {
  room: HousingRoomContent;
}

/** "The room" tab content for one housing listing card. */
export function HousingRoomPanel({ room }: HousingRoomPanelProps) {
  // On mobile the photo bleeds flush to the card's own edges (see the
  // --mobile rules in HousingShowcase.module.css), so ImageSlot's default
  // rounded corners are squared off to sit snug in the card instead of
  // reading as a floating rounded rect.
  const isMobile = useMediaQuery(mediaMax(breakpoint.mobile));

  return (
    <>
      <div className={styles.roomPhoto}>
        <ImageSlot
          src={room.photoUrl}
          alt={room.photoPlaceholder}
          placeholder={room.photoPlaceholder}
          tint="plum"
          height={196}
          radius={isMobile ? 0 : undefined}
        />
        <div className={styles.roomChips}>
          {room.chips.map((chip) => (
            <span
              key={chip.label}
              className={[styles.chip, chip.accent && styles.chipAccent]
                .filter(Boolean)
                .join(" ")}
            >
              {chip.label}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.lpPad}>
        <div className={styles.roomTitle}>{room.title}</div>
        <div className={styles.roomMeta}>{room.meta}</div>
        <div className={styles.priceCtx}>
          <span className={styles.bar}>
            <span
              className={styles.barFill}
              style={{ width: `${room.priceBarFillPercent}%` }}
            />
          </span>
          <span>
            <b>{room.price.lead}</b> {room.price.rest}
          </span>
        </div>
        <div className={styles.hh}>
          <AvatarStack avatars={room.household.avatars} size={38} />
          <div>
            <div className={styles.hhName}>{room.household.name}</div>
            <div className={styles.hhSub}>{room.household.sub}</div>
          </div>
        </div>
        <div className={styles.sig}>
          {room.signals.map((signal) => (
            <div key={signal.lead} className={styles.sigRow}>
              <FiCheck className={styles.sigIcon} aria-hidden />
              <span>
                <b>{signal.lead}</b> {signal.rest}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
