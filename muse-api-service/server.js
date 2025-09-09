import { app } from "./app.js";


const PORT = 3001;

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server HTTP running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
	console.log("Received SIGINT. Shutting down...");
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("Received SIGTERM. Shutting down...");
	process.exit(0);
});
