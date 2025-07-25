import Header from './components/Header';
import ExecuteButton from './components/ExecuteButton';
import ConsoleOutput from './components/ConsoleOutput';
import { useRemixClient } from './hooks/useRemixClient';
import './styles/App.css';
import ContractDropdown from './components/ContractDropdown';
import MutatorDropdown from './components/MutatorDropdown';
import { useState } from 'react';
import { solidityOperators, genericOperators, securityOperators } from './utils/operators';

function App() {
  const {
    contracts,
    selectedContract,
    setSelectedContract,
    consoleMessages,
    executeMutations,
    isLoading,
  } = useRemixClient();

  // Generic mutation operators (minimal)
  const [selectedGeneric, setSelectedGeneric] = useState([]);

  // Solidity-specific mutation operators (standard)
  const [selectedSolidity, setSelectedSolidity] = useState([]);

  // Security-oriented mutation operators (Muse) 
  const [selectedSecurity, setSelectedSecurity] = useState([]);

  const selectedMutators = [
    ...selectedGeneric,
    ...selectedSolidity,
    ...selectedSecurity,
  ];

  return (
    <>
      <Header />
      <div className="plugin-ui">
        <ContractDropdown
          contracts={contracts}
          selectedContract={selectedContract}
          onContractChange={setSelectedContract}
          isLoading={isLoading}
        />
        <div className="mutator-dropdowns">
          <MutatorDropdown
            label="Generic mutation operators"
            options={genericOperators}
            selectedOptions={selectedGeneric}
            onChange={setSelectedGeneric}
            isLoading={isLoading}
          />
          <MutatorDropdown
            label="Solidity-specific mutation operators"
            options={solidityOperators}
            selectedOptions={selectedSolidity}
            onChange={setSelectedSolidity}
            isLoading={isLoading}
          />
          <MutatorDropdown
            label="Security-oriented mutation operators"
            options={securityOperators}
            selectedOptions={selectedSecurity}
            onChange={setSelectedSecurity}
            isLoading={isLoading}
          />
        </div>
        
        <ExecuteButton
          onExecute={() => executeMutations(selectedMutators)}
          disabled={isLoading || !selectedContract}
        />
        <ConsoleOutput messages={consoleMessages} />
      </div>
    </>
  );
}

export default App;