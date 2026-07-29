import { useState } from "react";
import type { IconType } from "react-icons";
import { LANGS } from "./createGathering.data";

/** All wizard form state + helpers, shared by the page and its step components. */
export function useGatheringForm() {
  const [type, setType] = useState("");
  const [typeIcon, setTypeIcon] = useState<IconType | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
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
    selectType,
    toggleAccess,
    toggleCheck,
  };
}

export type GatheringForm = ReturnType<typeof useGatheringForm>;
