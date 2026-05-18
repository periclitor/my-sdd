import { Badge, Group, Text, ThemeIcon } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { trackMeta } from "../../data/tracks";
import type { AgendaSession } from "../../types";
import { timeRange } from "./utils";

export function SessionTrackBadge({ session }: { session: AgendaSession }) {
  const track = trackMeta[session.track];

  return (
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
  );
}

export function SessionMeta({
  session,
  emphasizeSpeaker = false,
}: {
  session: AgendaSession;
  emphasizeSpeaker?: boolean;
}) {
  return (
    <Group gap={6}>
      {session.speaker ? (
        <Text
          size="sm"
          fw={emphasizeSpeaker ? 600 : undefined}
          c={emphasizeSpeaker ? undefined : "dimmed"}
        >
          {session.speaker}
        </Text>
      ) : null}
      {session.room ? (
        <Text size="sm" c="dimmed">
          {session.room}
        </Text>
      ) : null}
    </Group>
  );
}

export function SessionRatings({ session }: { session: AgendaSession }) {
  return (
    <Group gap="xs">
      <Badge variant="dot" radius={4} color="dark">
        {timeRange(session)}
      </Badge>
      {session.codeLevel ? (
        <Badge
          size="sm"
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
          size="sm"
          radius={4}
          variant="light"
          color="gray"
          className="rating-badge"
        >
          Adv {session.advancedLevel}
        </Badge>
      ) : null}
    </Group>
  );
}

export function SavedIndicator() {
  return (
    <Group gap="xs">
      <ThemeIcon size="sm" radius={6} color="orange" variant="light">
        <IconCheck size={12} />
      </ThemeIcon>
      <Text size="sm" c="dimmed">
        Saved in your schedule on this device
      </Text>
    </Group>
  );
}
