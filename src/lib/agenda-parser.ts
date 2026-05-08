import type { AgendaData, AgendaSession, TrackId } from '../types';

export const agendaSourceUrl = 'https://sddconf.com/agenda';

const dayMap: Record<string, string> = {
  'Monday 11 May 2026': '2026-05-11',
  'Tuesday 12 May 2026': '2026-05-12',
  'Wednesday 13 May 2026': '2026-05-13',
  'Thursday 14 May 2026': '2026-05-14',
  'Friday 15 May 2026': '2026-05-15',
};

function findMatchingDivEnd(source: string, startIndex: number) {
  const tokenRe = /<div\b|<\/div>/g;
  tokenRe.lastIndex = startIndex;

  let depth = 0;
  let started = false;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(source))) {
    if (match[0] === '<div') {
      depth += 1;
      started = true;
    } else {
      depth -= 1;

      if (started && depth === 0) {
        return tokenRe.lastIndex;
      }
    }
  }

  return -1;
}

function decode(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function trackIdFromTheme(theme: string | null): TrackId {
  if (!theme) {
    return 'shared';
  }

  const trackMatch = theme.match(/^Track (\d)$/);

  if (trackMatch) {
    return `track-${trackMatch[1]}` as TrackId;
  }

  if (theme === 'Keynote Presentation') {
    return 'keynote';
  }

  if (theme === 'Pre-Conference Workshop') {
    return 'pre-workshop';
  }

  if (theme === 'Post-Conference Workshop') {
    return 'post-workshop';
  }

  throw new Error(`Unknown agenda theme: ${theme}`);
}

function parseSessionBox(box: string, date: string): AgendaSession | null {
  const timeMatch = box.match(/<p>\s*(\d{2}:\d{2})–(\d{2}:\d{2})\s*<\/p>/);
  const titleMatch = box.match(/<h2>\s*(?:<a[^>]*>)?([\s\S]*?)(?:<\/a>)?\s*<\/h2>/);

  if (!timeMatch || !titleMatch) {
    return null;
  }

  const theme = box.match(/<p class="theme">([^<]+)<\/p>/)?.[1]?.trim() ?? null;
  const speaker = box.match(/class="speaker-name"\s*>\s*([^<]+)\s*</)?.[1]?.trim();
  const codeLevel = box.match(
    /<div class="level-badge code-level">\s*Coding Level\s*<span>(\d)<\/span>\s*<\/div>/,
  )?.[1];
  const advancedLevel = box.match(
    /<div class="level-badge adv-level">\s*Advanced Level\s*<span>(\d)<\/span>\s*<\/div>/,
  )?.[1];
  const descBlock = box.match(
    /<div\s+id="desc[^"]*"\s+class="description"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*$/,
  )?.[1];
  const summary = descBlock
    ? decode(descBlock).replace(/^Coding Level\s+\d+\s+Advanced Level\s+\d+\s+/, '')
    : undefined;
  const title = decode(titleMatch[1]);

  return {
    id: `${date}-${timeMatch[1]}-${slug(title)}`,
    date,
    start: timeMatch[1],
    end: timeMatch[2],
    track: trackIdFromTheme(theme),
    type: theme ? 'talk' : 'break',
    title,
    ...(speaker ? { speaker: decode(speaker) } : {}),
    ...(summary ? { summary } : {}),
    ...(codeLevel ? { codeLevel: Number(codeLevel) } : {}),
    ...(advancedLevel ? { advancedLevel: Number(advancedLevel) } : {}),
  };
}

export function parseAgendaHtml(html: string, sourceUrl = agendaSourceUrl): AgendaData {
  const headingRe = /<h3(?:\s+class="(?:stuck)?")?\s*><span>([^<]+)<\/span><\/h3>/g;
  const headings = [...html.matchAll(headingRe)].map((match) => ({
    label: match[1],
    index: match.index ?? 0,
  }));

  const sessions: AgendaSession[] = [];

  for (let i = 0; i < headings.length; i += 1) {
    const { label, index } = headings[i];
    const date = dayMap[label];

    if (!date) {
      continue;
    }

    const sectionEnd = i + 1 < headings.length ? headings[i + 1].index : html.length;
    const section = html.slice(index, sectionEnd);
    const boxRe = /<div id="([^"]+)" class="box">/g;
    let boxMatch: RegExpExecArray | null;

    while ((boxMatch = boxRe.exec(section))) {
      const start = boxMatch.index;
      const end = findMatchingDivEnd(section, start);
      const box = section.slice(start, end);
      const session = parseSessionBox(box, date);

      if (session) {
        sessions.push(session);
      }
    }
  }

  if (sessions.length === 0) {
    throw new Error('No agenda sessions were parsed from the provided HTML.');
  }

  return {
    sourceUrl,
    extractedAt: new Date().toISOString(),
    sessions,
  };
}

export function isAgendaData(value: unknown): value is AgendaData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybe = value as Partial<AgendaData>;

  return (
    typeof maybe.sourceUrl === 'string' &&
    typeof maybe.extractedAt === 'string' &&
    Array.isArray(maybe.sessions)
  );
}
