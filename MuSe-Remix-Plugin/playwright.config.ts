import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    workers: 1 ,             // forza esecuzione in sequenza
    timeout: 100_000,
    use: {
        headless: true,
        viewport: { width: 1280, height: 800 },
        ignoreHTTPSErrors: true,
    },
});