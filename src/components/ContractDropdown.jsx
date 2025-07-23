const ContractDropdown = ({ contracts, selectedContract, onContractChange, isLoading }) => {
  const handleChange = (event) => {
    onContractChange(event.target.value);
  };

  return (
    <div className="section">
      <label htmlFor="contract-select" className="section-label">
        Select Contract
      </label>
      <select 
        id="contract-select" 
        className="dropdown"
        value={selectedContract}
        onChange={handleChange}
        disabled={isLoading}
      >
        {isLoading ? (
          <option value="">Loading contracts...</option>
        ) : contracts.length === 0 ? (
          <option value="" disabled>No contracts loaded</option>
        ) : (
          <>
            <option value="">Choose a contract...</option>
            {contracts.map((contract) => (
              <option key={contract} value={`contracts/${contract}`}>
                {contract}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
};

export default ContractDropdown;