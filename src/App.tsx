import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Collapse,
  Chip,
  Container,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconCoffee,
  IconFilter,
  IconStar,
  IconStarFilled,
} from '@tabler/icons-react';
import { useLocalStorage } from '@mantine/hooks';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import fallbackAgenda from './data/agenda.json';
import { trackMeta } from './data/tracks';
import { agendaSourceUrl } from './lib/agenda-parser';
import type { AgendaData, AgendaSession, TrackId } from './types';

const selectionStorageKey = 'sdd-planner:selected-sessions';
const fallbackAgendaData = fallbackAgenda as AgendaData;

function formatDayLabel(date: string) {
  return dayjs(date).format('ddd D MMM');
}

function formatDayHeading(date: string) {
  return dayjs(date).format('dddd D MMMM');
}

function formatUpdatedAt(date: string) {
  return dayjs(date).format('D MMM YYYY HH:mm');
}

function timeRange(session: AgendaSession) {
  return `${session.start} - ${session.end}`;
}

function groupByDate<T extends { date: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    acc[item.date] ??= [];
    acc[item.date].push(item);
    return acc;
  }, {});
}

function groupByTime<T extends { start: string; end: string }>(items: T[]) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = `${item.start}-${item.end}`;
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {});
}

function compareSessions(a: AgendaSession, b: AgendaSession) {
  return `${a.date}${a.start}${a.track}`.localeCompare(`${b.date}${b.start}${b.track}`);
}

export default function App() {
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>({
    key: selectionStorageKey,
    defaultValue: [],
  });
  const agendaData: AgendaData = fallbackAgendaData;
  const agendaSessions = agendaData.sessions;
  const trackEntries = useMemo(
    () => Object.entries(trackMeta) as Array<[TrackId, (typeof trackMeta)[TrackId]]>,
    [],
  );

  const [day, setDay] = useState<string>(agendaSessions[0]?.date ?? '');
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [trackFilter, setTrackFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSessionIds, setExpandedSessionIds] = useState<string[]>([]);

  const agendaDays = useMemo(
    () => Array.from(new Set(agendaSessions.map((session) => session.date))),
    [agendaSessions],
  );

  useEffect(() => {
    if (agendaDays.length > 0 && !agendaDays.includes(day)) {
      setDay(agendaDays[0]);
    }
  }, [agendaDays, day]);

  const selectedSessions = useMemo(
    () =>
      agendaSessions
        .filter((session) => selectedIds.includes(session.id))
        .sort(compareSessions),
    [agendaSessions, selectedIds],
  );

  const visibleSessions = useMemo(() => {
    return agendaSessions.filter((session) => {
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
    });
  }, [agendaSessions, day, selectedIds, showOnlySelected, trackFilter]);

  const slots = useMemo(() => {
    const grouped = groupByTime(visibleSessions);
    return Object.entries(grouped)
      .map(([key, sessions]) => ({ key, sessions: sessions.sort(compareSessions) }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [visibleSessions]);

  const selectedByDate = useMemo(() => groupByDate(selectedSessions), [selectedSessions]);

  const toggleSelected = (sessionId: string) => {
    setSelectedIds((current) =>
      current.includes(sessionId)
        ? current.filter((id) => id !== sessionId)
        : [...current, sessionId],
    );
  };

  const toggleExpanded = (sessionId: string) => {
    setExpandedSessionIds((current) =>
      current.includes(sessionId)
        ? current.filter((id) => id !== sessionId)
        : [...current, sessionId],
    );
  };

  return (
    <div className="app-shell">
      <Container size="lg" className="page-shell">
        <Stack gap="xl">
          <Paper radius="sm" className="hero-panel">
            <div className="hero-backdrop" />
            <Stack gap="lg" className="hero-content">
              <Group justify="space-between" align="flex-start" className="hero-topline">
                <Badge size="lg" radius={4} variant="light" color="orange">
                  SDD agenda planner
                </Badge>
                <Group gap="xs">
                  <ThemeIcon radius={6} size="lg" variant="light" color="orange">
                    <IconCalendarEvent size={18} />
                  </ThemeIcon>
                  <Text className="hero-meta">Mobile first, saved on this device</Text>
                </Group>
              </Group>

              <div>
                <Title order={1} className="hero-title">
                  See the whole conference day without losing your own plan.
                </Title>
                <Text className="hero-copy">
                  Browse the real SDD 2026 schedule across numbered tracks, keynote, and
                  workshop days, then keep your shortlist in local storage on this device.
                </Text>
                <Text size="sm" c="dimmed" mt="sm">
                  {`Using the bundled agenda snapshot from ${formatUpdatedAt(agendaData.extractedAt)}. Source: ${agendaSourceUrl}.`}
                </Text>
              </div>

              <Group gap="sm">
                <Badge variant="dot" color="orange">
                  Date
                </Badge>
                <Badge variant="dot" color="teal">
                  Time
                </Badge>
                <Badge variant="dot" color="gray">
                  Track
                </Badge>
                <Badge variant="dot" color="blue">
                  Speaker
                </Badge>
              </Group>
            </Stack>
          </Paper>

          <Paper radius="sm" p="md" className="toolbar-panel">
            <Stack gap="md">
              <Group justify="space-between" align="center" className="toolbar-row">
                <div>
                  <Text fw={700}>Choose a day</Text>
                  <Text size="sm" c="dimmed">
                    Swap quickly between the full agenda and your personal plan.
                  </Text>
                </div>
                <Group gap="sm">
                  <Button
                    variant="subtle"
                    color="dark"
                    radius="sm"
                    onClick={() => setShowFilters((current) => !current)}
                    rightSection={
                      showFilters ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />
                    }
                  >
                    {showFilters ? 'Hide day chooser' : 'Show day chooser'}
                  </Button>
                  <Switch
                    checked={showOnlySelected}
                    onChange={(event) => setShowOnlySelected(event.currentTarget.checked)}
                    label="Only my picks"
                    color="orange"
                  />
                </Group>
              </Group>

              <Collapse expanded={showFilters}>
                <Stack gap="md">
                  <SegmentedControl
                    fullWidth
                    radius="sm"
                    color="dark"
                    value={day}
                    onChange={setDay}
                    data={agendaDays.map((date) => ({
                      label: formatDayLabel(date),
                      value: date,
                    }))}
                  />

                  <div>
                    <Group gap="xs" mb="xs">
                      <ThemeIcon size="sm" radius={6} variant="light" color="orange">
                        <IconFilter size={14} />
                      </ThemeIcon>
                      <Text fw={600} size="sm">
                        Track filter
                      </Text>
                    </Group>
                    <Chip.Group multiple value={trackFilter} onChange={setTrackFilter}>
                      <Group gap="xs">
                        {trackEntries
                          .filter(([track]) => track !== 'shared')
                          .map(([track, meta]) => (
                            <Chip key={track} value={track} color="dark" radius="sm">
                              {meta.label}
                            </Chip>
                          ))}
                      </Group>
                    </Chip.Group>
                  </div>
                </Stack>
              </Collapse>
            </Stack>
          </Paper>

          <Paper radius="sm" p="md" className="selection-panel">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={800} size="lg">
                  My selections
                </Text>
                <Text size="sm" c="dimmed">
                  Your saved choices stay on this device. Use them as a quick focus view.
                </Text>
              </div>
              <Badge color="dark" radius={4} variant="filled">
                {selectedSessions.length} saved
              </Badge>
            </Group>

            {selectedSessions.length === 0 ? (
              <Paper radius="sm" p="lg" className="empty-state">
                <Text fw={700}>No talks selected yet</Text>
                <Text size="sm" c="dimmed">
                  Tap the star on any session to build your own schedule.
                </Text>
              </Paper>
            ) : (
              <Stack gap="md" mt="md">
                {Object.entries(selectedByDate).map(([date, sessions]) => (
                  <div key={date}>
                    <Text fw={800} mb="xs" className="section-heading">
                      {formatDayHeading(date)}
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
                      {sessions.map((session) => (
                        <Card key={session.id} radius="sm" padding="md" className="pick-card">
                          <Stack gap="xs">
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                              <div>
                                <Badge
                                  variant="light"
                                  color="dark"
                                  radius={4}
                                  style={{
                                    backgroundColor: `${trackMeta[session.track].color}22`,
                                    color: trackMeta[session.track].color,
                                  }}
                                >
                                  {trackMeta[session.track].label}
                                </Badge>
                                <Text fw={800} mt={8}>
                                  {session.title}
                                </Text>
                              </div>
                              <ActionIcon
                                variant="subtle"
                                color="orange"
                                onClick={() => toggleSelected(session.id)}
                                aria-label="Remove selection"
                              >
                                <IconStarFilled size={18} />
                              </ActionIcon>
                            </Group>
                            <Text size="sm" fw={600}>
                              {timeRange(session)}
                            </Text>
                            <Group gap={6}>
                              {session.speaker ? (
                                <Text size="sm" c="dimmed">
                                  {session.speaker}
                                </Text>
                              ) : null}
                              {session.codeLevel ? (
                                <Badge size="xs" radius={4} variant="light" color="gray">
                                  Code {session.codeLevel}
                                </Badge>
                              ) : null}
                              {session.advancedLevel ? (
                                <Badge size="xs" radius={4} variant="light" color="gray">
                                  Adv {session.advancedLevel}
                                </Badge>
                              ) : null}
                            </Group>
                          </Stack>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </div>
                ))}
              </Stack>
            )}
          </Paper>

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
              <Button
                variant="subtle"
                color="dark"
                onClick={() => {
                  setShowOnlySelected(false);
                  setTrackFilter([]);
                }}
              >
                Reset filters
              </Button>
            </Group>

            <Stack gap="md">
              {slots.map((slot) => {
                const isSharedBreak = slot.sessions.every((session) => session.type === 'break');

                return (
                  <Paper key={slot.key} radius="sm" p="md" className="slot-panel">
                    <Group align="flex-start" gap="md" className="slot-layout">
                      <div className="slot-time">
                        <Text fw={800} className="slot-time-range">
                          {slot.sessions[0].start}
                        </Text>
                        <Text size="sm" c="dimmed">
                          until {slot.sessions[0].end}
                        </Text>
                      </div>

                      {isSharedBreak ? (
                        <Paper radius="sm" p="lg" className="break-card">
                          <Group gap="sm" align="center">
                            <ThemeIcon size="xl" radius={6} color="orange" variant="light">
                              <IconCoffee size={22} />
                            </ThemeIcon>
                            <div>
                              <Text fw={800}>{slot.sessions[0].title}</Text>
                            </div>
                          </Group>
                        </Paper>
                      ) : (
                        <SimpleGrid
                          cols={{ base: 1, md: 2, xl: 3 }}
                          spacing="md"
                          className="slot-grid"
                        >
                          {slot.sessions.map((session) => {
                            const track = trackMeta[session.track];
                            const isSelected = selectedIds.includes(session.id);
                            const isExpanded = expandedSessionIds.includes(session.id);

                            return (
                              <Card
                                key={session.id}
                                radius="sm"
                                padding="lg"
                                className="session-card"
                                style={{
                                  borderColor: `${track.color}55`,
                                  boxShadow: isSelected
                                    ? `0 18px 38px -24px ${track.color}`
                                    : undefined,
                                }}
                              >
                                <Stack gap="sm">
                                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                                    <div>
                                      <Badge
                                        radius={4}
                                        variant="light"
                                        style={{
                                          backgroundColor: `${track.color}22`,
                                          color: track.color,
                                        }}
                                      >
                                        {track.label}
                                      </Badge>
                                      <Text
                                        fw={800}
                                        mt="xs"
                                        className="session-title session-title-toggle"
                                        onClick={() => {
                                          if (session.summary) {
                                            toggleExpanded(session.id);
                                          }
                                        }}
                                      >
                                        {session.title}
                                      </Text>
                                    </div>
                                    <ActionIcon
                                      color={isSelected ? 'orange' : 'gray'}
                                      variant={isSelected ? 'filled' : 'light'}
                                      radius="sm"
                                      onClick={() => toggleSelected(session.id)}
                                      aria-label={
                                        isSelected ? 'Remove from my picks' : 'Add to my picks'
                                      }
                                    >
                                      {isSelected ? (
                                        <IconStarFilled size={18} />
                                      ) : (
                                        <IconStar size={18} />
                                      )}
                                    </ActionIcon>
                                  </Group>

                                  <Group gap="xs">
                                    <Badge variant="dot" radius={4} color="dark">
                                      {timeRange(session)}
                                    </Badge>
                                  </Group>

                                  <Group gap={6}>
                                    {session.speaker ? (
                                      <Text fw={600} size="sm">
                                        {session.speaker}
                                      </Text>
                                    ) : null}
                                    {session.codeLevel ? (
                                      <Badge
                                        size="xs"
                                        radius={4}
                                        variant="light"
                                        color="gray"
                                        className="rating-badge"
                                      >
                                        Code {session.codeLevel}
                                      </Badge>
                                    ) : null}
                                    {session.advancedLevel ? (
                                      <Badge
                                        size="xs"
                                        radius={4}
                                        variant="light"
                                        color="gray"
                                        className="rating-badge"
                                      >
                                        Adv {session.advancedLevel}
                                      </Badge>
                                    ) : null}
                                  </Group>

                                  {session.summary ? (
                                    <Collapse expanded={isExpanded}>
                                      <Stack gap="sm" className="session-details">
                                        <Text size="sm">{session.summary}</Text>
                                        {isSelected ? (
                                          <Group gap="xs">
                                            <ThemeIcon
                                              size="sm"
                                              radius={6}
                                              color="orange"
                                              variant="light"
                                            >
                                              <IconCheck size={12} />
                                            </ThemeIcon>
                                            <Text size="sm" c="dimmed">
                                              Saved in your schedule on this device
                                            </Text>
                                          </Group>
                                        ) : null}
                                      </Stack>
                                    </Collapse>
                                  ) : isSelected ? (
                                    <Group gap="xs">
                                      <ThemeIcon size="sm" radius={6} color="orange" variant="light">
                                        <IconCheck size={12} />
                                      </ThemeIcon>
                                      <Text size="sm" c="dimmed">
                                        Saved in your schedule on this device
                                      </Text>
                                    </Group>
                                  ) : null}
                                </Stack>
                              </Card>
                            );
                          })}
                        </SimpleGrid>
                      )}
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
