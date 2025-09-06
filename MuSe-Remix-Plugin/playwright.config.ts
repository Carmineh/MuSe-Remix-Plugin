import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    workers: 1 ,
    timeout: 100_000,
    use: {
        headless: false,
        viewport: { width: 1280, height: 800 },
        ignoreHTTPSErrors: true,
    },
});