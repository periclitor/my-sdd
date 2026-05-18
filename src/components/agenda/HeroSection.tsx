import {
  Badge,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import type { AgendaData } from "../../types";
import { formatUpdatedAt } from "./utils";

const themeModeOptions = [
  { label: "Auto", value: "auto" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export default function HeroSection({
  agendaData,
}: {
  agendaData: AgendaData;
}) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Paper radius="sm" className="hero-panel">
      <div className="hero-backdrop" />
      <Stack gap="lg" className="hero-content">
        <Group
          justify="space-between"
          align="flex-start"
          className="hero-topline"
        >
          <Badge size="lg" radius={4} variant="light" color="orange">
            SDD agenda planner
          </Badge>
          <div className="theme-switcher theme-switcher-hero">
            <SegmentedControl
              size="sm"
              radius="sm"
              value={colorScheme}
              onChange={(value) =>
                setColorScheme(value as "auto" | "light" | "dark")
              }
              data={themeModeOptions}
            />
          </div>
        </Group>

        <div>
          <Title order={1} className="hero-title">
            See the whole conference day without losing your own plan.
          </Title>
          <Text className="hero-copy">
            Browse the real SDD 2026 schedule across numbered tracks, keynote,
            and workshop days, then keep your shortlist in local storage on this
            device.
          </Text>
          <Text size="sm" c="dimmed" mt="sm">
            {`Using the bundled agenda snapshot from ${formatUpdatedAt(agendaData.extractedAt)}. Source: ${agendaData.sourceUrl}.`}
          </Text>
        </div>

        {/* <Group gap="sm">
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
          <Badge variant="dot" color="dark">
            Theme
          </Badge>
        </Group> */}
      </Stack>
    </Paper>
  );
}
