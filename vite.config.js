import { loadEnv, defineConfig } from "vite";
import { ngrok } from "vite-plugin-ngrok";
const { NGROK_AUTH_TOKEN } = loadEnv("", process.cwd(), "NGROK");

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
		allowedHosts: true,
	},

	// Disable host check completely
	define: {
		global: "globalThis",
	},
	plugins: [
		ngrok({
			authtoken: NGROK_AUTH_TOKEN,
		}),
	],
});
