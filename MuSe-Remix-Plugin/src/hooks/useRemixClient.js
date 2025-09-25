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
			const contractsList = await getContractsFromRemix(client);
			setContracts(contractsList);
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
				if (data.output === 0)
					updateConsole(
						"No mutants generated. Please check if the selected mutators are compatible with the contract."
					);
				else updateConsole(`File saved successfully: ${data.message || "OK"}`);
			} catch (error) {
				updateConsole(`Error during mutation execution: ${error.message}`);
			}
		},
		[selectedContract, updateConsole, client]
	);

	async function getTestFiles() {
		try {
			const files = await client.fileManager.readdir("tests");
			const testFiles = [];

			for (const [name, metadata] of Object.entries(files)) {
				if (!metadata.isDirectory) {
					const content = await client.fileManager.readFile(`${name}`);
					testFiles.push({ name: name.replace("tests/", ""), content });
				}
			}

			return testFiles;
		} catch (error) {
			console.error("Error reading test files:", error);
			return [];
		}
	}

	const executeTesting = useCallback(
		async (testingConfig, testFiles) => {
			updateConsole(
				`Starting testing process with framework ${testingConfig.testingFramework} and timeout ${testingConfig.testingTimeOutInSec} sec...`
			);

			const contractName = selectedContract.split("/").pop().replace(".sol", "");
			const formattedTestFiles = testFiles.filter(
				(file) =>
					file.name.toLowerCase().includes(contractName.toLowerCase()) &&
					file.name.toLowerCase().includes(testingConfig.testingFramework.toLowerCase())
			);
			console.log(formattedTestFiles);
			if (formattedTestFiles.length === 0) updateConsole("No test files found for the selected contract and framework");

			try {
				const response = await fetch(`${API_URL}/api/test`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ testingConfig, testFiles: formattedTestFiles }),
				});
				const result = await response.json();
				if (response.ok) {
					updateConsole(`Testing complete: ${result.output}`);
					if (!client) return;
					await client.fileManager.writeFile("/MuSe/results/report.html", result.report);
					updateConsole("Report saved to /MuSe/results/report.html");
				} else {
					updateConsole(`Testing error: ${result.error}`);
				}
			} catch (err) {
				updateConsole(`Error during testing: ${err.message}`);
			}
		},
		[client, updateConsole]
	);

	async function importDirectoryToRemix(remixPluginClient) {
		try {
			const response = await fetch(`${API_URL}/api/files-to-import`);

			const files = await response.json();

			//const client = createClient();
			await remixPluginClient.fileManager.remove("/MuSe/results/mutants");
			for (const file of files) {
				//await remixPluginClient.fileManager.remove(file.path);
				await remixPluginClient.fileManager.writeFile(file.path, file.content);
			}
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		const handleFileAdded = (file) => {
			loadContracts();
			return;
		};

		const handleFileRemoved = (file) => {
			loadContracts();
			return;
		};

		const handleFileRenamed = (file) => {
			loadContracts();
			return;
		};

		if (client) {
			// Aggiungi i listener
			client.on("fileManager", "fileAdded", handleFileAdded);
			client.on("fileManager", "fileRemoved", handleFileRemoved);
			client.on("fileManager", "fileRenamed", handleFileRenamed);
		}
	}, [client]);

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
		executeTesting,
		getTestFiles,
		isLoading,
	};
};
