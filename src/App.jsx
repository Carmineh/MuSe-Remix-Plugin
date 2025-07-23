import Header from './components/Header';
import ContractCombobox from './components/ContractCombobox';
import ExecuteButton from './components/ExecuteButton';
import ConsoleOutput from './components/ConsoleOutput';
import { useRemixClient } from './hooks/useRemixClient';
import './styles/App.css';

function App() {
  const {
    contracts,
    selectedContract,
    setSelectedContract,
    consoleMessages,
    executeMutations,
    isLoading
  } = useRemixClient();

  return (
    <>
      <Header />
      <div className="plugin-ui">
        <ContractCombobox
          contracts={contracts}
          selectedContract={selectedContract}
          onContractChange={setSelectedContract}
          isLoading={isLoading}
        />
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