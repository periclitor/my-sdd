import {
  ActionIcon,
  Badge,
  Card,
  Collapse,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { useState } from "react";
import type { AgendaSession } from "../../types";
import { SavedIndicator, SessionMeta, SessionTrackBadge } from "./SessionParts";
import { timeRange } from "./utils";

interface SavedSessionCardProps {
  session: AgendaSession;
  onToggleSelected: (sessionId: string) => void;
}

export default function SavedSessionCard({
  session,
  onToggleSelected,
}: SavedSessionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card radius="sm" px="sm" py="md" className="pick-card">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <SessionTrackBadge session={session} />
            <Text
              fw={800}
              mt={8}
              className="session-title session-title-toggle"
              onClick={() => {
                if (session.summary) {
                  setExpanded((current) => !current);
                }
              }}
            >
              {session.title}
            </Text>
          </div>
          <ActionIcon
            variant="subtle"
            color="orange"
            onClick={() => onToggleSelected(session.id)}
            aria-label="Remove selection"
          >
            <IconStarFilled size={18} />
          </ActionIcon>
        </Group>

        <Group gap={6}>
          <Text size="sm" fw={600}>
            {timeRange(session)}
          </Text>
          {session.codeLevel ? (
            <Badge size="sm" radius={4} variant="light" color="gray">
              Code {session.codeLevel}
            </Badge>
          ) : null}
          {session.advancedLevel ? (
            <Badge size="sm" radius={4} variant="light" color="gray">
              Adv {session.advancedLevel}
            </Badge>
          ) : null}
        </Group>

        <SessionMeta session={session} />

        {session.summary ? (
          <Collapse expanded={expanded}>
            <Stack gap="sm" className="session-details">
              <Text size="sm">{session.summary}</Text>
              <SavedIndicator />
            </Stack>
          </Collapse>
        ) : (
          <SavedIndicator />
        )}
      </Stack>
    </Card>
  );
}
