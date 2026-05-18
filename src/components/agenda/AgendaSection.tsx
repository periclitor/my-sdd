import {
  Button,
  Collapse,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { useState } from "react";
import type { AgendaSession } from "../../types";
import SessionCard from "./SessionCard";
import { formatDayHeading } from "./utils";

interface AgendaSectionProps {
  day: string;
  slots: Array<{ key: string; sessions: AgendaSession[] }>;
  selectedIds: string[];
  onToggleSelected: (sessionId: string) => void;
  onResetFilters: () => void;
}

function AgendaSlot({
  slot,
  selectedIds,
  onToggleSelected,
}: {
  slot: { key: string; sessions: AgendaSession[] };
  selectedIds: string[];
  onToggleSelected: (sessionId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSharedBreak = slot.sessions.every((session) => session.type === "break");

  return (
    <Paper radius="sm" px="sm" py="md" className="slot-panel">
      <Group
        align="flex-start"
        gap="md"
        className="slot-layout"
        onClick={() => !isSharedBreak && setExpanded((current) => !current)}
        style={{ cursor: isSharedBreak ? "default" : "pointer" }}
      >
        <div className="slot-time">
          <Text fw={800} className="slot-time-range">
            {isSharedBreak
              ? `${slot.sessions[0].start} - ${slot.sessions[0].title}`
              : slot.sessions[0].start}
          </Text>
          <Text size="sm" c="dimmed">
            {isSharedBreak ? "All tracks" : `until ${slot.sessions[0].end}`}
          </Text>
        </div>
      </Group>

      {isSharedBreak ? null : (
        <Collapse expanded={expanded}>
          <SimpleGrid
            cols={{ base: 1, md: 2, xl: 3 }}
            spacing="md"
            className="slot-grid"
          >
            {slot.sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isSelected={selectedIds.includes(session.id)}
                onToggleSelected={onToggleSelected}
              />
            ))}
          </SimpleGrid>
        </Collapse>
      )}
    </Paper>
  );
}

export default function AgendaSection({
  day,
  slots,
  selectedIds,
  onToggleSelected,
  onResetFilters,
}: AgendaSectionProps) {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end">
        <div>
          <Text fw={800} size="xl" className="section-heading">
            Agenda for {formatDayHeading(day)}
          </Text>
          <Text size="sm" c="dimmed">
            Expand any card for details and swap your choices whenever you want.
          </Text>
        </div>
        <Button variant="subtle" color="dark" onClick={onResetFilters}>
          Reset filters
        </Button>
      </Group>

      <Stack gap="md">
        {slots.map((slot) => (
          <AgendaSlot
            key={slot.key}
            slot={slot}
            selectedIds={selectedIds}
            onToggleSelected={onToggleSelected}
          />
        ))}
      </Stack>
    </Stack>
  );
}
