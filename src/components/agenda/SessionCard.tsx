import {
  ActionIcon,
  Card,
  Collapse,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { useState } from "react";
import { trackMeta } from "../../data/tracks";
import type { AgendaSession } from "../../types";
import {
  SavedIndicator,
  SessionMeta,
  SessionRatings,
  SessionTrackBadge,
} from "./SessionParts";

interface SessionCardProps {
  session: AgendaSession;
  isSelected: boolean;
  onToggleSelected: (sessionId: string) => void;
}

export default function SessionCard({
  session,
  isSelected,
  onToggleSelected,
}: SessionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const track = trackMeta[session.track];

  return (
    <Card
      radius="sm"
      px="md"
      py="lg"
      className="session-card"
      style={{
        borderColor: `${track.color}55`,
        borderWidth: isSelected ? "2px" : "1px",
        backgroundColor: isSelected ? `${track.color}11` : undefined,
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <SessionTrackBadge session={session} />
            <Text
              fw={800}
              mt="xs"
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
            color={isSelected ? "orange" : "gray"}
            variant={isSelected ? "filled" : "light"}
            radius="sm"
            onClick={() => onToggleSelected(session.id)}
            aria-label={
              isSelected ? "Remove from my picks" : "Add to my picks"
            }
          >
            {isSelected ? (
              <IconStarFilled size={18} />
            ) : (
              <IconStar size={18} />
            )}
          </ActionIcon>
        </Group>

        <SessionRatings session={session} />
        <SessionMeta session={session} emphasizeSpeaker />

        {session.summary ? (
          <Collapse expanded={expanded}>
            <Stack gap="sm" className="session-details">
              <Text size="sm">{session.summary}</Text>
              {isSelected ? <SavedIndicator /> : null}
            </Stack>
          </Collapse>
        ) : isSelected ? (
          <SavedIndicator />
        ) : null}
      </Stack>
    </Card>
  );
}
