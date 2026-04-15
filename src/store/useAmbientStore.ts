import { create } from 'zustand';

export interface AmbientTrack {
  id: string;
  label: string;
  emoji: string;
  file: number; // require() result
  volume: number; // 0–1
  active: boolean;
}

interface AmbientState {
  tracks: AmbientTrack[];
  toggleTrack: (id: string) => void;
  setVolume: (id: string, volume: number) => void;
  stopAll: () => void;
}

const DEFAULT_TRACKS: AmbientTrack[] = [
  { id: 'rain',      label: 'RAIN',      emoji: '🌧️', file: require('../../assets/sounds/rain.mp3'),      volume: 0.6, active: false },
  { id: 'fireplace', label: 'FIREPLACE', emoji: '🔥', file: require('../../assets/sounds/fireplace.mp3'), volume: 0.5, active: false },
  { id: 'forest',    label: 'FOREST',   emoji: '🌲', file: require('../../assets/sounds/forest.mp3'),    volume: 0.6, active: false },
  { id: 'crickets',  label: 'CRICKETS', emoji: '🦗', file: require('../../assets/sounds/crickets.mp3'),  volume: 0.4, active: false },
  { id: 'cafe',      label: 'CAFÉ',     emoji: '☕', file: require('../../assets/sounds/cafe.mp3'),      volume: 0.5, active: false },
];

export const useAmbientStore = create<AmbientState>()((set) => ({
  tracks: DEFAULT_TRACKS,

  toggleTrack: (id) =>
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
    })),

  setVolume: (id, volume) =>
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === id ? { ...t, volume } : t)),
    })),

  stopAll: () =>
    set((s) => ({
      tracks: s.tracks.map((t) => ({ ...t, active: false })),
    })),
}));
