import { useState } from "react";
import type { IconType } from "react-icons";
import { LANGS } from "./createGathering.data";

/** All wizard form state + helpers, shared by the page and its step components. */
export function useGatheringForm() {
  const [type, setType] = useState("");
  const [typeIcon, setTypeIcon] = useState<IconType | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDateValue] = useState("");
  const [time, setTimeValue] = useState("19:00");
  // Snapshot of "now" used by the future-start check below. Reading a live
  // `Date.now()` during render is non-idempotent (impure); instead we capture the
  // clock once and refresh it whenever the organiser edits the date or time — the
  // only fields that affect whether the start is still in the future — so the
  // validity the user sees always reflects the moment they changed the value.
  const [now, setNow] = useState(() => Date.now());
  const setDate = (value: string) => {
    setNow(Date.now());
    setDateValue(value);
  };
  const setTime = (value: string) => {
    setNow(Date.now());
    setTimeValue(value);
  };
  const [endTime, setEndTime] = useState("22:00");
  const [hood, setHood] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [directions, setDirections] = useState("");
  const [cap, setCap] = useState("14");
  const [lang, setLang] = useState(LANGS[0]!.value);
  const [access, setAccess] = useState<Set<string>>(new Set());
  const [accessNotes, setAccessNotes] = useState("");
  const [free, setFree] = useState(false);
  const [solPrice, setSolPrice] = useState("0");
  const [stdPrice, setStdPrice] = useState("10");
  const [supPrice, setSupPrice] = useState("18");
  // Per-tier available spots (were uncontrolled defaultValue-only inputs whose
  // values never reached form state — anything the organiser typed was dropped).
  const [solSpots, setSolSpots] = useState("3");
  const [stdSpots, setStdSpots] = useState("8");
  const [supSpots, setSupSpots] = useState("5");
  const [included, setIncluded] = useState("");
  const [bring, setBring] = useState("");
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);

  const selectType = (name: string, icon: IconType) => {
    setType(name);
    setTypeIcon(() => icon);
  };
  const toggleAccess = (name: string) =>
    setAccess((prev) => {
      const n = new Set(prev);
      if (n.has(name)) n.delete(name);
      else n.add(name);
      return n;
    });
  const toggleCheck = (i: number) =>
    setChecks((prev) => prev.map((v, j) => (j === i ? !v : v)));

  const allChecked = checks.every(Boolean);
  const checkedCount = checks.filter(Boolean).length;

  // A gathering must have a real start that's still in the future: the backend
  // rejects both a missing date and a past one, so the wizard gates step 2 on
  // this. Mirrors the adapter's `time || "19:00"` fallback so the check matches
  // exactly what gets submitted.
  const startAt = date ? new Date(`${date}T${time || "19:00"}`) : null;
  const dateValid =
    !!startAt && !Number.isNaN(startAt.getTime()) && startAt.getTime() > now;

  // Has the organiser entered anything worth warning them about losing? Only
  // fields they actually filled count — the pre-seeded defaults (time, capacity,
  // language, prices, spots) don't, so an untouched wizard never prompts on exit.
  const dirty =
    Boolean(type) ||
    title.trim().length > 0 ||
    description.trim().length > 0 ||
    date.length > 0 ||
    hood.length > 0 ||
    venue.trim().length > 0 ||
    address.trim().length > 0 ||
    directions.trim().length > 0 ||
    accessNotes.trim().length > 0 ||
    included.trim().length > 0 ||
    bring.trim().length > 0 ||
    access.size > 0 ||
    checks.some(Boolean);

  return {
    type,
    typeIcon,
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    time,
    setTime,
    endTime,
    setEndTime,
    hood,
    setHood,
    venue,
    setVenue,
    address,
    setAddress,
    directions,
    setDirections,
    cap,
    setCap,
    lang,
    setLang,
    access,
    accessNotes,
    setAccessNotes,
    free,
    setFree,
    solPrice,
    setSolPrice,
    stdPrice,
    setStdPrice,
    supPrice,
    setSupPrice,
    solSpots,
    setSolSpots,
    stdSpots,
    setStdSpots,
    supSpots,
    setSupSpots,
    included,
    setIncluded,
    bring,
    setBring,
    checks,
    allChecked,
    checkedCount,
    dateValid,
    dirty,
    selectType,
    toggleAccess,
    toggleCheck,
  };
}

export type GatheringForm = ReturnType<typeof useGatheringForm>;
