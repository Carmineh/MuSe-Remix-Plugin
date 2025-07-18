import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "dist",
		rollupOptions: {
			input: "index.html",
		},
	},
	server: {
		port: 3000,
		host: true, // Alternative to '0.0.0.0'
		strictPort: false,
		hmr: {
			clientPort: 443, // For ngrok HTTPS
		},
	},
	// Disable host check completely
	define: {
		global: "globalThis",
	},
});
