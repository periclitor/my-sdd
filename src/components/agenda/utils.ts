import dayjs from "dayjs";
import { trackMeta } from "../../data/tracks";
import type { AgendaSession, TrackId } from "../../types";

export type TrackEntry = [TrackId, (typeof trackMeta)[TrackId]];

export function formatDayLabel(date: string) {
  return dayjs(date).format("ddd D MMM");
}

export function formatDayHeading(date: string) {
  return dayjs(date).format("dddd D MMMM");
}

export function formatUpdatedAt(date: string) {
  return dayjs(date).format("D MMM YYYY HH:mm");
}

export function timeRange(session: AgendaSession) {
  return `${session.start} - ${session.end}`;
}

export function groupByDate<T extends { date: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    acc[item.date] ??= [];
    acc[item.date].push(item);
    return acc;
  }, {});
}

export function groupByTime<T extends { start: string; end: string }>(
  items: T[],
) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = `${item.start}-${item.end}`;
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function compareSessions(a: AgendaSession, b: AgendaSession) {
  return `${a.date}${a.start}${a.track}`.localeCompare(
    `${b.date}${b.start}${b.track}`,
  );
}
