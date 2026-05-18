import {
  Button,
  Chip,
  Collapse,
  Group,
  Paper,
  Stack,
  Switch,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconFilter } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { TrackEntry } from "./utils";
import { formatDayLabel } from "./utils";

interface FilterPanelProps {
  agendaDays: string[];
  day: string;
  onDayChange: (day: string) => void;
  showOnlySelected: boolean;
  onShowOnlySelectedChange: (checked: boolean) => void;
  trackEntries: TrackEntry[];
  trackFilter: string[];
  onTrackFilterChange: (value: string[]) => void;
}

function FilterChipGroup({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Group gap="xs" mb="xs">
        <ThemeIcon size="sm" radius={6} variant="light" color="orange">
          {icon}
        </ThemeIcon>
        <Text fw={600} size="sm">
          {label}
        </Text>
      </Group>
      {children}
    </div>
  );
}

export default function FilterPanel({
  agendaDays,
  day,
  onDayChange,
  showOnlySelected,
  onShowOnlySelectedChange,
  trackEntries,
  trackFilter,
  onTrackFilterChange,
}: FilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <Paper radius="sm" px="sm" py="md" className="toolbar-panel">
      <Stack gap="md">
        <Group justify="space-between" align="center" className="toolbar-row">
          <div>
            <Text fw={700}>Choose a day</Text>
            <Text size="sm" c="dimmed">
              Swap quickly between the full agenda and your personal plan.
            </Text>
          </div>
          <Group gap="sm" className="toolbar-actions">
            <Button
              variant="subtle"
              color="dark"
              radius="sm"
              onClick={() => setShowFilters((current) => !current)}
              rightSection={
                showFilters ? (
                  <IconChevronUp size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )
              }
            >
              {showFilters ? "Hide day chooser" : "Show day chooser"}
            </Button>
            <Switch
              checked={showOnlySelected}
              onChange={(event) =>
                onShowOnlySelectedChange(event.currentTarget.checked)
              }
              label="Only my picks"
              color="orange"
            />
          </Group>
        </Group>

        <Collapse expanded={showFilters}>
          <Stack gap="md">
            <FilterChipGroup icon={<IconChevronDown size={14} />} label="Day">
              <Chip.Group
                value={day}
                onChange={(value) => onDayChange(value as string)}
              >
                <Group gap="xs">
                  {agendaDays.map((agendaDay) => (
                    <Chip
                      key={agendaDay}
                      value={agendaDay}
                      color="dark"
                      radius="sm"
                    >
                      {formatDayLabel(agendaDay)}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </FilterChipGroup>

            <FilterChipGroup icon={<IconFilter size={14} />} label="Track filter">
              <Chip.Group
                multiple
                value={trackFilter}
                onChange={onTrackFilterChange}
              >
                <Group gap="xs">
                  {trackEntries
                    .filter(([track]) => track !== "shared")
                    .map(([track, meta]) => (
                      <Chip key={track} value={track} color="dark" radius="sm">
                        {meta.label}
                      </Chip>
                    ))}
                </Group>
              </Chip.Group>
            </FilterChipGroup>
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
}
