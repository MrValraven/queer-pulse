/* Calendar helpers for the confirmation step. */

export function googleCalendarUrl(): string {
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
    encodeURIComponent("Queer Supper Club #13") +
    "&dates=20260628T193000/20260628T220000&location=" +
    encodeURIComponent("Mouraria, Lisbon")
  );
}

export function downloadIcs(ref: string | null): void {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "DTSTART:20260628T193000",
    "DTEND:20260628T220000",
    "SUMMARY:Queer Supper Club #13",
    "LOCATION:Mouraria, Lisbon",
    "DESCRIPTION:QueerPulse gathering. Hosted by Tomás Beto. Ref " +
      (ref ?? ""),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "supper-club-13.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
