import { createClient } from "@remixproject/plugin-iframe";

const client = createClient();

client.onload(async () => {
	console.log("PLUGIN LOADED");

	// SCRITTURA DI UN FILE NELL'IDE
	await client.fileManager.writeFile("/hello2.sol", "CIAOOO23");

	// LETTURA DI UN FILE NELL'IDE
	const data = await client.fileManager.readFile("/hello2.sol");
	console.log(data);

	console.log(await client.fileManager.getFolder("/contracts"));
});
