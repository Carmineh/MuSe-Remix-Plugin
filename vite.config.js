import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "dist",
		rollupOptions: {
			input: "index.html",
		},
	},
	server: {
		port: 5173,
		host: "0.0.0.0", // Allow external connections
		strictPort: false,
		allowedHosts: ["localhost", ".ngrok.io", ".ngrok-free.app", ".ngrok.app"],
		hmr: {
			clientPort: 443, // For ngrok HTTPS tunnels
		},
	},
	// Define global for compatibility
	define: {
		global: "globalThis",
	},
});
