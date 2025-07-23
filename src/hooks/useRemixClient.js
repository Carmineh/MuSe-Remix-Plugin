import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@remixproject/plugin-iframe';

export const useRemixClient = () => {
  const [client, setClient] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState('');
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize console with timestamp
  const updateConsole = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;
    setConsoleMessages(prev => [...prev, formattedMessage]);
  }, []);

  const clearConsole = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  // Get contracts from Remix filesystem
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
      console.error('Error reading contracts:', error);
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
          const path = "MuSe/";
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

            // TODO: Load Mutators

            // Initialize workspace
            await clientInstance.fileManager.mkdir(path + "results");
            await clientInstance.fileManager.mkdir(path + "results/mutants");
            updateConsole("MuSe directory successfully created.");

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
  const executeMutations = useCallback(async () => {
    if (!selectedContract) {
      updateConsole("Please select a contract first.");
      return;
    }

    updateConsole(`Starting mutation process for ${selectedContract}...`);
    // TODO: Implement actual mutation execution
    updateConsole("Mutation execution is not yet implemented.");
  }, [selectedContract, updateConsole]);

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
    isLoading
  };
};