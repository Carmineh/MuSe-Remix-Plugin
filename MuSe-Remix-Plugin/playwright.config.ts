import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    workers: 1 ,             // forza esecuzione in sequenza
    timeout: 120_000,
    use: {
        headless: false,
        viewport: { width: 1280, height: 800 },
        ignoreHTTPSErrors: true,
    },
});