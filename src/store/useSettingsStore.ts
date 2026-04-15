import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './storage';

interface SettingsState {
  notificationsEnabled: boolean;
  usageMonitoringEnabled: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;

  toggleNotifications: () => void;
  toggleUsageMonitoring: () => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      usageMonitoringEnabled: false,
      soundEnabled: true,
      hapticEnabled: true,

      toggleNotifications: () => set((s) => ({ notificationsEnabled: !s.notificationsEnabled })),
      toggleUsageMonitoring: () => set((s) => ({ usageMonitoringEnabled: !s.usageMonitoringEnabled })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleHaptic: () => set((s) => ({ hapticEnabled: !s.hapticEnabled })),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
