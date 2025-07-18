import { createClient } from "@remixproject/plugin-iframe";

const client = createClient();

function updateConsole(message) {
	const console = document.getElementById("console");
	const timestamp = new Date().toLocaleTimeString();
	const formattedMessage = `[${timestamp}] ${message}`;

	if (console.value) {
		console.value += "\n" + formattedMessage;
	} else {
		console.value = formattedMessage;
	}
	console.scrollTop = console.scrollHeight;
}

client.onload(async () => {
	try {
		// Clear loading placeholder
		document.getElementById("console").placeholder = "";

		// Display initial message
		updateConsole("MuSe Plugin loaded successfully.");

		// Example string manipulation
		let pluginString = "Hello from MuSe Plugin!";
		updateConsole(`Initial string: "${pluginString}"`);

		// Change the string
		pluginString = pluginString.replace("Hello", "Welcome");
		updateConsole(`Modified string: "${pluginString}"`);

		// Display plugin info
		updateConsole("Plugin ready for use.");
		updateConsole("This is a modern, minimalist plugin interface.");

		// Optional: You can still interact with Remix IDE if needed
		updateConsole("Checking Remix IDE connection...");
		const folder = await client.fileManager.getFolder("/contracts");
		updateConsole(`Found ${Object.keys(folder).length} items in contracts folder.`);
	} catch (error) {
		updateConsole(`Error: ${error.message}`);
	}
});

// Add some interactivity - clear console on double-click
document.addEventListener("DOMContentLoaded", () => {
	const consoleElement = document.getElementById("console");

	consoleElement.addEventListener("dblclick", () => {
		consoleElement.value = "";
		updateConsole("Console cleared.");
	});
});
