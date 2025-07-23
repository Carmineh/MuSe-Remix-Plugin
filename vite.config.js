import { defineConfig } from "vite";

export default defineConfig({
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
