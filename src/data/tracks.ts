import type { TrackId } from '../types';

export const trackMeta: Record<
  TrackId,
  { label: string; shortLabel: string; color: string }
> = {
  'track-1': { label: 'Track 1', shortLabel: 'T1', color: '#f97352' },
  'track-2': { label: 'Track 2', shortLabel: 'T2', color: '#2f7f79' },
  'track-3': { label: 'Track 3', shortLabel: 'T3', color: '#f2b948' },
  'track-4': { label: 'Track 4', shortLabel: 'T4', color: '#3e5c76' },
  'track-5': { label: 'Track 5', shortLabel: 'T5', color: '#8f4f8a' },
  'track-6': { label: 'Track 6', shortLabel: 'T6', color: '#62748e' },
  'track-7': { label: 'Track 7', shortLabel: 'T7', color: '#b85c38' },
  keynote: { label: 'Keynote Presentation', shortLabel: 'Keynote', color: '#c2410c' },
  'pre-workshop': { label: 'Pre-Conference Workshop', shortLabel: 'Pre', color: '#0f766e' },
  'post-workshop': { label: 'Post-Conference Workshop', shortLabel: 'Post', color: '#7c3aed' },
  shared: { label: 'Shared', shortLabel: 'Info', color: '#6b7280' },
};
