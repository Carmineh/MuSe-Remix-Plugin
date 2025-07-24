import Header from './components/Header';
import ExecuteButton from './components/ExecuteButton';
import ConsoleOutput from './components/ConsoleOutput';
import { useRemixClient } from './hooks/useRemixClient';
import './styles/App.css';
import ContractDropdown from './components/ContractDropdown';
import MutatorDropdown from './components/MutatorDropdown';
import { useState } from 'react';

function App() {
  const {
    contracts,
    selectedContract,
    setSelectedContract,
    // genericOperators,   // Generic mutation operators (minimal) 
    // solidityOperators,  // Solidity-specific mutation operators (standard)
    // securityOperators,  // Security-oriented mutation operators (Muse)
    consoleMessages,
    executeMutations,
    isLoading
  } = useRemixClient();

    // Example options for dropdowns
  const dropdownOptions1 = [
    { value: 'item1', label: 'Item 1' },
    { value: 'item2', label: 'Item 2' }
  ];
  const dropdownOptions2 = [
    { value: 'foo', label: 'Foo' },
    { value: 'bar', label: 'Bar' }
  ];
  const dropdownOptions3 = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' }
  ];

  // State for dropdowns
  const [selected1, setSelected1] = useState([]);
  const [selected2, setSelected2] = useState([]);
  const [selected3, setSelected3] = useState([]);

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
              label="First Dropdown"
              options={dropdownOptions1}
              selectedOptions={selected1}
              onChange={setSelected1}
              isLoading={isLoading}
            />
            <MutatorDropdown
              label="Second Dropdown"
              options={dropdownOptions2}
              selectedOptions={selected2}
              onChange={setSelected2}
              isLoading={isLoading}
            />
            <MutatorDropdown
              label="Third Dropdown"
              options={dropdownOptions3}
              selectedOptions={selected3}
              onChange={setSelected3}
              isLoading={isLoading}
        />
        </div>
        
        <ExecuteButton
          onExecute={executeMutations}
          disabled={isLoading || !selectedContract}
        />
        <ConsoleOutput messages={consoleMessages} />
      </div>
    </>
  );
}

export default App;