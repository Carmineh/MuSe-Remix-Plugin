import Header from './components/Header';
import ExecuteMutationButton from './components/ExecuteMutationButton';
import ConsoleOutput from './components/ConsoleOutput';
import { useRemixClient } from './hooks/useRemixClient';
import './styles/App.css';
import ContractDropdown from './components/ContractDropdown';
import MutatorDropdown from './components/MutatorDropdown';
import { SystemThemeWatcher } from './components/ThemeToggle';
import { useState } from 'react';
import { solidityOperators, genericOperators, securityOperators } from './utils/operators';
import ExecuteTestingButton from './components/ExecuteTestingButton';
import TestingConfigModal from './components/TestingConfigModal';

function MutationApp() {
  const {
    contracts,
    selectedContract,
    setSelectedContract,
    consoleMessages,
    executeMutations,
    executeTesting,
    isLoading,
  } = useRemixClient();

  // Operator selections
  const [selectedGeneric, setSelectedGeneric] = useState([]);
  const [selectedSolidity, setSelectedSolidity] = useState([]);
  const [selectedSecurity, setSelectedSecurity] = useState([]);

  const selectedMutators = [
    ...selectedGeneric,
    ...selectedSolidity,
    ...selectedSecurity,
  ];

  // Testing configuration state
  const [showTestingConfig, setShowTestingConfig] = useState(false);
  const [testingConfig, setTestingConfig] = useState({
    testingFramework: "truffle",
    testingTimeOutInSec: 300,
  });

  return (
    <>
      <SystemThemeWatcher showIndicator={true} />
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
        <div className="actions">
          <ExecuteMutationButton
            onExecute={() => executeMutations(selectedMutators)}
            disabled={isLoading || !selectedContract}
          />
          <ExecuteTestingButton
            onExecute={() => {
            setShowTestingConfig(true);
            console.log("setShowTestingConfig(true) chiamato");
          }}
          disabled={isLoading || !selectedContract}
        />
        </div>
        <TestingConfigModal
          show={showTestingConfig}
          config={testingConfig}
          onRun={async (cfg) => {
            setTestingConfig(cfg);
            setShowTestingConfig(false);
            await executeTesting(cfg);
          }}
          onClose={() => setShowTestingConfig(false)}
        />

        <ConsoleOutput messages={consoleMessages} />
      </div>
    </>
  );
}

export default MutationApp;