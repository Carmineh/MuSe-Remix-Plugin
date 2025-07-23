import { createClient } from "@remixproject/plugin-iframe";

const console = document.getElementById("console");

// MuSe Plugin Initialization
const client = createClient();
client.onload(async () => {
	const path = "MuSe/";
	try {
		// Inizializzazione Plugin
		clearConsole(console);
		updateConsole("MuSe Plugin loaded successfully.");
		await loadContracts();
		// TODO: Caricamento Mutators

		// Inizializzazione del Workspace
		await client.fileManager.mkdir(path + "results");
		await client.fileManager.mkdir(path + "results/mutants");
		updateConsole("MuSe directory successfully created.");

		updateConsole("Plugin ready for use.");
	} catch (error) {
		updateConsole(`Initialization error: ${error.message}`);
	}
});

// Caricamento file contenuti nella cartella dei contratti e aggiunta al dropdown menu
async function loadContracts() {
	try {
		updateConsole("Loading contracts...");
		const contractSelect = document.getElementById("contract-select");

		contractSelect.innerHTML = '<option value="">Loading contracts...</option>';
		const contracts = await getContractsFromRemix();
		contractSelect.innerHTML = "";

		if (contracts.length === 0) {
			contractSelect.innerHTML = '<option value="" disabled>No contracts loaded</option>';
		} else {
			contractSelect.innerHTML = '<option value="">Choose a contract...</option>';
			contracts.forEach((contract) => {
				const option = document.createElement("option");
				option.value = "contracts/" + contract;
				option.text = contract;
				contractSelect.appendChild(option);
			});
			updateConsole(`Loaded ${contracts.length} contracts.`);
		}
	} catch (error) {
		updateConsole(`Error loading contracts: ${error.message}`);
		const contractSelect = document.getElementById("contract-select");
		contractSelect.innerHTML = '<option value="" disabled>Error loading contracts</option>';
	}
}

// Prendo tutti i contratti presenti nella cartella "Contracts" -> L'unica cartella valida per caricare i contratti
async function getContractsFromRemix() {
	const folder = "contracts";
	const contracts = [];

	const data = await client.fileManager.readdir(folder);

	for (const [name, metadata] of Object.entries(data)) {
		if (!metadata.isDirectory) {
			if (name.includes(".sol")) {
				// Prendo solo i contratti solidity validi e tolgo la parte del path della cartella
				contracts.push(name.replace("contracts/", ""));
			}
		}
	}

	return contracts;
}

// TODO: Funzione mutate che esegue MuSe
// TODO: Funzione che una volta premuto il tasto manda i contatti al server -> ../MuSe/contracts/
// TODO: Funzione che prende i mutants scelti e il manda al server

// Aggiornamento del contenuto della console
function updateConsole(message) {
	const console = document.getElementById("console");
	const timestamp = new Date().toLocaleTimeString();
	const formattedMessage = `[${timestamp}] ${message}`;

	if (console.value) {
		console.value += "\n" + formattedMessage;
	} else {
		console.value = formattedMessage;
	}
}

// Pulizia della console
function clearConsole() {
	console.value = "";
}
