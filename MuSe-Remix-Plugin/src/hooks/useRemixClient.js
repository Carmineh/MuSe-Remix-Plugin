import { useState, useEffect, useCallback } from "react";
import { createClient } from "@remixproject/plugin-iframe";

export const useRemixClient = () => {
	const [client, setClient] = useState(null);
	const [contracts, setContracts] = useState([]);
	const [selectedContract, setSelectedContract] = useState("");
	const [consoleMessages, setConsoleMessages] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const API_URL = "http://localhost:3001";

	const updateConsole = useCallback((message) => {
		const timestamp = new Date().toLocaleTimeString();
		const formattedMessage = `[${timestamp}] ${message}`;
		setConsoleMessages((prev) => [...prev, formattedMessage]);
	}, []);

	const clearConsole = useCallback(() => {
		setConsoleMessages([]);
	}, []);

	// Get contracts from Remix fileManager
	const getContractsFromRemix = useCallback(async (clientInstance) => {
		const folder = "contracts";
		const contracts = [];

		try {
			const data = await clientInstance.fileManager.readdir(folder);

			for (const [name, metadata] of Object.entries(data)) {
				if (!metadata.isDirectory) {
					if (name.includes(".sol")) {
						// Get only valid solidity contracts and remove the folder path part
						contracts.push(name.replace("contracts/", ""));
					}
				}
			}
		} catch (error) {
			console.error("Error reading contracts:", error);
		}

		return contracts;
	}, []);

	// Load contracts from Remix
	const loadContracts = useCallback(async () => {
		if (!client) return;

		try {
			updateConsole("Loading contracts...");
			const contractsList = await getContractsFromRemix(client);
			setContracts(contractsList);

			if (contractsList.length === 0) {
				updateConsole("No contracts found in contracts folder.");
			} else {
				updateConsole(`Loaded ${contractsList.length} contracts.`);
			}
		} catch (error) {
			updateConsole(`Error loading contracts: ${error.message}`);
		}
	}, [client, getContractsFromRemix, updateConsole]);

	// Initialize Remix plugin
	useEffect(() => {
		const initializePlugin = async () => {
			try {
				const clientInstance = createClient();
				setClient(clientInstance);

				clientInstance.onload(async () => {
					try {
						// Plugin initialization
						clearConsole();
						updateConsole("MuSe Plugin loaded successfully.");

						// Load contracts
						const contractsList = await getContractsFromRemix(clientInstance);
						setContracts(contractsList);

						if (contractsList.length === 0) {
							updateConsole("No contracts found in contracts folder.");
						} else {
							updateConsole(`Loaded ${contractsList.length} contracts.`);
						}

						updateConsole("Plugin ready for use.");
						setIsLoading(false);
					} catch (error) {
						updateConsole(`Initialization error: ${error.message}`);
						setIsLoading(false);
					}
				});
			} catch (error) {
				updateConsole(`Failed to initialize plugin: ${error.message}`);
				setIsLoading(false);
			}
		};

		initializePlugin();
	}, [clearConsole, updateConsole, getContractsFromRemix]);

	// Execute mutations function (TODO: implement actual mutation logic)
	const executeMutations = useCallback(
		async (selectedMutators) => {
			if (!selectedContract) {
				updateConsole("Please select a contract first.");
				return;
			}

			if (selectedMutators.length === 0) {
				updateConsole("Please select at least one mutation operator.");
				return;
			}
			updateConsole(`Starting mutation process for ${selectedContract}...`);

			try {
				// Leggo il contratto come stringa
				const contract = await client.fileManager.readFile(selectedContract);

				// Mando al server per salvare il file
				const contractResponse = await fetch(`${API_URL}/api/save`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						filename: `${selectedContract.split("/").pop()}`,
						content: contract,
					}),
				});

				// Eseguo le mutazioni
				const mutatorResponse = await fetch(`${API_URL}/api/mutate`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						mutators: selectedMutators,
					}),
				});
				importDirectoryToRemix(client);

				const data = await mutatorResponse.json();
				updateConsole(`File saved successfully: ${data.message || "OK"}`);
			} catch (error) {
				updateConsole(`Error during mutation execution: ${error.message}`);
			}
		},
		[selectedContract, updateConsole, client]
	);

	async function importDirectoryToRemix(remixPluginClient) {
		try {
			const response = await fetch(`${API_URL}/api/files-to-import`);
			const files = await response.json();

			for (const file of files) {
				await remixPluginClient.fileManager.setFile(file.path, file.content);
			}
		} catch (error) {
			console.error(error);
		}
	}

	return {
		client,
		contracts,
		selectedContract,
		setSelectedContract,
		consoleMessages,
		updateConsole,
		clearConsole,
		loadContracts,
		executeMutations,
		isLoading,
	};
};
