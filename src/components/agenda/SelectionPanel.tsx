import { Badge, Paper, SimpleGrid, Stack, Group, Text } from "@mantine/core";
import { useMemo } from "react";
import type { AgendaSession } from "../../types";
import SavedSessionCard from "./SavedSessionCard";
import { compareSessions, formatDayHeading, groupByDate } from "./utils";

interface SelectionPanelProps {
  sessions: AgendaSession[];
  onToggleSelected: (sessionId: string) => void;
}

export default function SelectionPanel({
  sessions,
  onToggleSelected,
}: SelectionPanelProps) {
  const selectedByDate = useMemo(
    () => groupByDate([...sessions].sort(compareSessions)),
    [sessions],
  );

  return (
    <Paper radius="sm" px="sm" py="md" className="selection-panel">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={800} size="lg">
            My selections
          </Text>
          <Text size="sm" c="dimmed">
            Your saved choices stay on this device. Use them as a quick focus
            view.
          </Text>
        </div>
        <Badge color="dark" radius={4} variant="filled">
          {sessions.length} saved
        </Badge>
      </Group>

      {sessions.length === 0 ? (
        <Paper radius="sm" px="md" py="lg" className="empty-state">
          <Text fw={700}>No talks selected yet</Text>
          <Text size="sm" c="dimmed">
            Tap the star on any session to build your own schedule.
          </Text>
        </Paper>
      ) : (
        <Stack gap="md" mt="md">
          {Object.entries(selectedByDate).map(([date, dateSessions]) => (
            <div key={date}>
              <Text fw={800} mb="xs" className="section-heading">
                {formatDayHeading(date)}
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
                {dateSessions.map((session) => (
                  <SavedSessionCard
                    key={session.id}
                    session={session}
                    onToggleSelected={onToggleSelected}
                  />
                ))}
              </SimpleGrid>
            </div>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
