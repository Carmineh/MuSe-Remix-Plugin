import { useState } from 'react';
import { Combobox } from '@headlessui/react';

const ContractCombobox = ({ contracts, selectedContract, onContractChange, isLoading }) => {
  const [query, setQuery] = useState('');

  // Filter contracts based on search query
  const filteredContracts = query === ''
    ? contracts
    : contracts.filter((contract) =>
        contract.toLowerCase().includes(query.toLowerCase())
      );

  // Handle selection
  const handleChange = (value) => {
    onContractChange(value);
    setQuery(''); // Reset query after selection
  };

  // Get display value for the input
  const getDisplayValue = (value) => {
    if (!value) return '';
    // Extract contract name from path (e.g., "contracts/MyContract.sol" -> "MyContract.sol")
    return value.replace('contracts/', '');
  };

  return (
    <div className="section">
      <label className="section-label">
        Select Contract
      </label>
      <Combobox value={selectedContract} onChange={handleChange} disabled={isLoading}>
        <div className="dropdown-container">
          <Combobox.Input
            className={`dropdown-input ${selectedContract ? 'selected' : ''}`}
            displayValue={getDisplayValue}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isLoading ? "Loading contracts..." : "Search contracts..."}
            autoComplete="off"
          />
          <Combobox.Options className="dropdown-menu">
            {isLoading ? (
              <div className="dropdown-item" style={{ color: '#888', cursor: 'default' }}>
                Loading contracts...
              </div>
            ) : filteredContracts.length === 0 && query !== '' ? (
              <div className="dropdown-item" style={{ color: '#888', cursor: 'default' }}>
                No contracts found for "{query}"
              </div>
            ) : contracts.length === 0 ? (
              <div className="dropdown-item" style={{ color: '#888', cursor: 'default' }}>
                No contracts loaded
              </div>
            ) : (
              <>
                {/* Show placeholder option when no contract is selected */}
                {!selectedContract && query === '' && (
                  <Combobox.Option
                    value=""
                    className="dropdown-item"
                    style={{ color: '#888', cursor: 'default' }}
                    disabled
                  >
                    Choose a contract...
                  </Combobox.Option>
                )}
                {filteredContracts.map((contract) => (
                  <Combobox.Option
                    key={contract}
                    value={`contracts/${contract}`}
                    className={({ active, selected }) =>
                      `dropdown-item ${active || selected ? 'selected' : ''}`
                    }
                  >
                    {contract}
                  </Combobox.Option>
                ))}
              </>
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
};

export default ContractCombobox;