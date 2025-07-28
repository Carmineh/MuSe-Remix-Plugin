import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "dist",
		rollupOptions: {
			input: "index.html",
		},
	},
	server: {
		https: {
			key: fs.readFileSync(path.resolve(__dirname, "certs/localhost-key.pem")),
			cert: fs.readFileSync(path.resolve(__dirname, "certs/localhost.pem")),
		},
		port: 5173,
		host: true,
	},
	// Define global for compatibility
	define: {
		global: "globalThis",
	},
});
