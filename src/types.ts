export type SessionType = 'talk' | 'break';

export type TrackId =
  | 'track-1'
  | 'track-2'
  | 'track-3'
  | 'track-4'
  | 'track-5'
  | 'track-6'
  | 'track-7'
  | 'keynote'
  | 'pre-workshop'
  | 'post-workshop'
  | 'shared';

export interface AgendaSession {
  id: string;
  date: string;
  start: string;
  end: string;
  track: TrackId;
  type: SessionType;
  title: string;
  speaker?: string;
  summary?: string;
  codeLevel?: number;
  advancedLevel?: number;
}
