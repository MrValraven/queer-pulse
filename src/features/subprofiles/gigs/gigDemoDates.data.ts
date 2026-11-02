import type {
  SubprofileItemDTO,
  SubprofileSection,
} from "../api/subprofiles.api";

/**
 * Local `yyyy-mm-dd` for the day `offsetDays` away from today (negative =
 * past). Built from LOCAL date parts at call time, so a demo gig stays
 * "tomorrow" or "last month" however long the app has been open. Never slices
 * `toISOString()`, which is UTC and shifts the day near midnight.
 */
export function gigDemoDay(offsetDays: number): string {
  const day = new Date();
  day.setHours(12, 0, 0, 0);
  day.setDate(day.getDate() + offsetDays);
  const year = String(day.getFullYear());
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(day.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

const GIG_SECTION: SubprofileSection = "gigs";

/**
 * Extra NIGHTFORM gigs that cover every state the gigs editor renders: poster,
 * sold out, cancelled, guest set without a venue, a past night, an undated
 * night, free text and month precision dates, and a ticket link with no
 * scheme. Dates are relative to today so the Upcoming and Past groups never
 * lapse. Exactly one of these is the spotlight.
 */
export function nightformEditorDemoGigs(): SubprofileItemDTO[] {
  return [
    {
      section: GIG_SECTION,
      description: null,
      meta: null,
      tags: [],
      collaborators: [],
      id: "itm-gigs-terraco-sunset",
      createdAt: "2026-10-02T10:20:00.000Z",
      title: "Sunset Terrace Opening",
      subtitle: "Lisbon",
      url: "https://example.com/nightform/terrace-sunset",
      imageUrl:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
      date: gigDemoDay(9),
      isFeatured: false,
      venue: "Terraço do Carmo",
      doors: "18:30",
      ticketUrl: "https://example.com/nightform/terrace-tickets",
      gigState: null,
    },
    {
      section: GIG_SECTION,
      description: null,
      meta: null,
      tags: [],
      collaborators: [],
      id: "itm-gigs-pink-hour",
      createdAt: "2026-10-04T16:05:00.000Z",
      title: "Pink Hour",
      subtitle: "Lisbon",
      url: null,
      imageUrl: null,
      date: gigDemoDay(21),
      isFeatured: false,
      venue: "Musicbox, Cais do Sodré",
      doors: "23:00",
      ticketUrl: "https://example.com/nightform/pink-hour-tickets",
      gigState: "sold_out",
    },
    {
      section: GIG_SECTION,
      description: null,
      meta: null,
      tags: [],
      collaborators: [],
      id: "itm-gigs-ribeira-rooftop",
      createdAt: "2026-10-06T09:45:00.000Z",
      title: "Ribeira Rooftop Afterparty",
      subtitle: "Porto",
      url: null,
      imageUrl: null,
      date: gigDemoDay(16),
      isFeatured: false,
      venue: "Terraço da Ribeira",
      doors: "21:00",
      ticketUrl: null,
      gigState: "cancelled",
    },
    {
      section: GIG_SECTION,
      description: null,
      meta: null,
      tags: [],
      collaborators: [],
      id: "itm-gigs-lavanda-guest",
      createdAt: "2026-10-08T21:30:00.000Z",
      title: "Guest set for Lavanda Collective",
      subtitle: "Porto",
      url: null,
      imageUrl: null,
      date: gigDemoDay(35),
      isFeatured: false,
      venue: null,
      doors: null,
      ticketUrl: null,
      gigState: "guest",
    },
    {
      section: GIG_SECTION,
      description: null,
      meta: null,
      tags: [],
      collaborators: [],
      id: "itm-gigs-basement-sessions",
      createdAt: "2026-10-10T12:00:00.000Z",
      title: "Basement Sessions",
      subtitle: "Lisbon",
      url: null,
      imageUrl: null,
      date: gigDemoDay(50),
      isFeatured: false,
      venue: "Basement Club",
      doors: "23:00",
      // Deliberately no scheme: the editor warns that it needs https://.
      ticketUrl: "tickets.example",
      gigState: null,
    },
    {
      section: GIG_SECTION,
      description: null,
      meta: null,
      tags: [],
      collaborators: [],
      id: "itm-gigs-bairro-alto-closing",
      createdAt: "2026-09-01T11:10:00.000Z",
      title: "Closing Night at Bairro Alto Social",
      subtitle: "Lisbon",
      url: null,
      imageUrl: null,
      date: gigDemoDay(-45),
      isFeatured: false,
      venue: "Bairro Alto Social",
      doors: "22:30",
      ticketUrl: "https://example.com/nightform/bairro-alto-tickets",
      gigState: null,
    },
    {
      section: GIG_SECTION,
      description: null,
      meta: null,
      tags: [],
      collaborators: [],
      id: "itm-gigs-autumn-garden",
      createdAt: "2026-10-12T08:15:00.000Z",
      title: "Autumn Garden Session",
      subtitle: "Porto",
      url: null,
      imageUrl: null,
      date: "",
      isFeatured: false,
      venue: null,
      doors: null,
      ticketUrl: null,
      gigState: null,
    },
    {
      section: GIG_SECTION,
      description: null,
      meta: null,
      tags: [],
      collaborators: [],
      id: "itm-gigs-first-friday-residency",
      createdAt: "2026-10-14T19:40:00.000Z",
      title: "First Friday Residency",
      subtitle: "Lisbon",
      url: null,
      imageUrl: null,
      date: "Date to be confirmed",
      isFeatured: false,
      venue: "Damas",
      doors: "22:00",
      ticketUrl: null,
      gigState: null,
    },
  ];
}
