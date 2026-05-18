import { Container, Stack } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { trackMeta } from "../data/tracks";
import type { AgendaData } from "../types";
import AgendaSection from "./agenda/AgendaSection";
import FilterPanel from "./agenda/FilterPanel";
import HeroSection from "./agenda/HeroSection";
import SelectionPanel from "./agenda/SelectionPanel";
import { compareSessions, groupByTime, type TrackEntry } from "./agenda/utils";

const selectionStorageKey = "sdd-planner:selected-sessions";

export default function AgendaPlanner({ agendaData }: { agendaData: AgendaData }) {
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>({
    key: selectionStorageKey,
    defaultValue: [],
  });
  const agendaSessions = agendaData.sessions;
  const trackEntries = useMemo(
    () => Object.entries(trackMeta) as TrackEntry[],
    [],
  );
  const [day, setDay] = useState<string>(agendaSessions[0]?.date ?? "");
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [trackFilter, setTrackFilter] = useState<string[]>([]);

  const agendaDays = useMemo(
    () => Array.from(new Set(agendaSessions.map((session) => session.date))),
    [agendaSessions],
  );

  useEffect(() => {
    if (agendaDays.length > 0 && !agendaDays.includes(day)) {
      setDay(agendaDays[0]);
    }
  }, [agendaDays, day]);

  useEffect(() => {
    const currentDate = dayjs().format("YYYY-MM-DD");
    if (agendaDays.includes(currentDate)) {
      setDay(currentDate);
    }
  }, [agendaDays]);

  const selectedSessions = useMemo(
    () =>
      agendaSessions
        .filter((session) => selectedIds.includes(session.id))
        .sort(compareSessions),
    [agendaSessions, selectedIds],
  );

  const visibleSessions = useMemo(
    () =>
      agendaSessions.filter((session) => {
        if (session.date !== day) {
          return false;
        }

        if (showOnlySelected && !selectedIds.includes(session.id)) {
          return false;
        }

        if (trackFilter.length > 0 && !trackFilter.includes(session.track)) {
          return false;
        }

        return true;
      }),
    [agendaSessions, day, selectedIds, showOnlySelected, trackFilter],
  );

  const slots = useMemo(() => {
    const grouped = groupByTime(visibleSessions);

    return Object.entries(grouped)
      .map(([key, sessions]) => ({
        key,
        sessions: sessions.sort(compareSessions),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [visibleSessions]);

  const toggleSelected = (sessionId: string) => {
    setSelectedIds((current) =>
      current.includes(sessionId)
        ? current.filter((id) => id !== sessionId)
        : [...current, sessionId],
    );
  };

  const resetFilters = () => {
    setShowOnlySelected(false);
    setTrackFilter([]);
  };

  return (
    <div className="app-shell">
      <Container size="lg" px="xs" className="page-shell">
        <Stack gap="xl">
          <HeroSection agendaData={agendaData} />
          <FilterPanel
            agendaDays={agendaDays}
            day={day}
            onDayChange={setDay}
            showOnlySelected={showOnlySelected}
            onShowOnlySelectedChange={setShowOnlySelected}
            trackEntries={trackEntries}
            trackFilter={trackFilter}
            onTrackFilterChange={setTrackFilter}
          />
          <SelectionPanel
            sessions={selectedSessions}
            onToggleSelected={toggleSelected}
          />
          <AgendaSection
            day={day}
            slots={slots}
            selectedIds={selectedIds}
            onToggleSelected={toggleSelected}
            onResetFilters={resetFilters}
          />
        </Stack>
      </Container>
    </div>
  );
}
