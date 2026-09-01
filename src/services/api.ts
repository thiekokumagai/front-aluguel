import { initMockStorage } from '../mocks/storage';

// Initialize mock data when services are loaded
initMockStorage();

export const SIMULATED_LATENCY_MS = 180;

export async function delay(ms: number = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
