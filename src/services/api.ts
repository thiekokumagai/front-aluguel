import { initMockStorage } from '../mocks/storage';

// Initialize mock data when services are loaded
initMockStorage();

export const API_BASE_URL = import.meta.env.VITE_ADMIN_API || 'http://localhost:3000/api';

export const SIMULATED_LATENCY_MS = 180;

export async function delay(ms: number = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
