import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Baca file .env lokal
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Konfigurasi Pengujian Playwright E2E SIAKAD Polinema
 * Menerapkan best practices:
 * - 1 Worker (mencegah bentrok single active session SIAKAD)
 * - Retain-on-failure (menghemat storage hasil uji)
 * - Project Google Chrome untuk eksekusi lokal pengguna
 * - Project Chromium untuk eksekusi pipeline CI (GitHub Actions)
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60000, // 60 detik per test untuk mengantisipasi latensi jaringan SIAKAD
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: process.env.SIAKAD_URL || 'https://siakad.polinema.ac.id',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20000,
    navigationTimeout: 35000,
  },

  projects: [
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Menjalankan browser Google Chrome lokal pengguna
      },
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
