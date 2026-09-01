import type { Settings } from '../types';
import { mockStorage } from '../mocks/storage';
import { delay } from './api';

export const settingsService = {
  async getSettings(): Promise<Settings> {
    await delay();
    return mockStorage.getSettings();
  },

  async updateSettings(newSettings: Partial<Settings>): Promise<Settings> {
    await delay();
    const current = mockStorage.getSettings();
    const updated = {
      ...current,
      ...newSettings,
      profile: { ...current.profile, ...newSettings.profile },
      company: { ...current.company, ...newSettings.company },
      charges: { ...current.charges, ...newSettings.charges },
      reminders: { ...current.reminders, ...newSettings.reminders },
      whatsApp: { ...current.whatsApp, ...newSettings.whatsApp },
      cacto: { ...current.cacto, ...newSettings.cacto },
    };
    mockStorage.saveSettings(updated);
    return updated;
  },
};
