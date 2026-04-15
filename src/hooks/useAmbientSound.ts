import { useEffect, useRef } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useAmbientStore } from '../store/useAmbientStore';

/**
 * Manages looping ambient Sound objects via expo-av.
 * Sets audio mode to mix with other apps (Spotify keeps playing).
 */
export function useAmbientSound() {
  const tracks = useAmbientStore((s) => s.tracks);
  // Map of trackId → Sound object
  const soundRefs = useRef<Record<string, Audio.Sound>>({});
  const loadedRef = useRef<Record<string, boolean>>({});

  // Set audio mode once: mix with whatever else is playing
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      allowsRecordingIOS: false,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    tracks.forEach(async (track) => {
      const existing = soundRefs.current[track.id];

      if (track.active) {
        if (!existing) {
          // Load and play
          try {
            const { sound } = await Audio.Sound.createAsync(track.file, {
              isLooping: true,
              volume: track.volume,
              shouldPlay: true,
            });
            soundRefs.current[track.id] = sound;
            loadedRef.current[track.id] = true;
          } catch (e) {
            // File missing or decode error — silently skip
          }
        } else {
          // Already loaded — just ensure playing + sync volume
          await existing.setVolumeAsync(track.volume).catch(() => {});
          const status = await existing.getStatusAsync().catch(() => null);
          if (status && status.isLoaded && !status.isPlaying) {
            await existing.playAsync().catch(() => {});
          }
        }
      } else {
        if (existing) {
          // Stop and unload
          await existing.stopAsync().catch(() => {});
          await existing.unloadAsync().catch(() => {});
          delete soundRefs.current[track.id];
          delete loadedRef.current[track.id];
        }
      }
    });
  }, [tracks]);

  // Sync volume changes for active tracks
  useEffect(() => {
    tracks.forEach(async (track) => {
      const sound = soundRefs.current[track.id];
      if (sound && track.active) {
        await sound.setVolumeAsync(track.volume).catch(() => {});
      }
    });
  }, [tracks]);

  // Cleanup all on unmount
  useEffect(() => {
    return () => {
      Object.values(soundRefs.current).forEach(async (sound) => {
        await sound.stopAsync().catch(() => {});
        await sound.unloadAsync().catch(() => {});
      });
      soundRefs.current = {};
    };
  }, []);
}
