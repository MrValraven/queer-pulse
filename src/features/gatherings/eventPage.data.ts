import type { IconType } from "react-icons";
import {
  FiCalendar,
  FiCoffee,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1562050344-f7ad946cee35?q=80&w=1000&auto=format&fit=crop";

export const TIERS = [
  { name: "Free", desc: "No barriers to attending", price: "€0" },
  { name: "Standard", desc: "Covers the cost of your dinner", price: "€8" },
  { name: "Supporter", desc: "Subsidises someone else's place", price: "€15" },
];

export const DETAILS: {
  icon: IconType;
  label: string;
  value: string;
  sub: string;
}[] = [
  {
    icon: FiCalendar,
    label: "Date & time",
    value: "Saturday, 14 June 2026",
    sub: "7:00pm–10:30pm (doors open 6:45pm)",
  },
  {
    icon: FiMapPin,
    label: "Location",
    value: "Casa do Alentejo",
    sub: "Rua das Portas de Santo Antão 58, Intendente · 5 min from Intendente metro",
  },
  {
    icon: FiCoffee,
    label: "Food & drink",
    value: "Shared dinner included",
    sub: "Note dietary requirements when you RSVP. Vegetarian and vegan options always available.",
  },
  {
    icon: FiMessageCircle,
    label: "Language",
    value: "PT / EN · bilingual throughout",
    sub: "No one will be left out of a conversation.",
  },
];
