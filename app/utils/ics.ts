export interface IcsOptions {
  title: string;
  description: string;
  start: Date; // local time
}

// Helper to format date as YYYYMMDDTHHMMSS (no Z, local time)
function formatDate(dt: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    dt.getFullYear().toString() +
    pad(dt.getMonth() + 1) +
    pad(dt.getDate()) +
    'T' +
    pad(dt.getHours()) +
    pad(dt.getMinutes()) +
    pad(dt.getSeconds())
  );
}

export function generateICS({ title, description, start }: IcsOptions): string {
  const uid = `${Date.now()}-dozee-nudge@example.com`;
  const dtstamp = formatDate(new Date());
  const dtstart = formatDate(start);

  // Escape commas, semicolons, and newlines in text fields per RFC 5545
  const escape = (txt: string) =>
    txt.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dozee Nudge//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `SUMMARY:${escape(title)}`,
    `DESCRIPTION:${escape(description)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT0M', // 0 minutes before
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape('Dozee Nudge Reminder')}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // Ensure CRLF line endings
  return lines.join('\r\n') + '\r\n';
}
