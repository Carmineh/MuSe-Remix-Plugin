import React from 'react';
import Select from 'react-select';

// Custom rendering: label in menu, value in selection
const formatOptionLabel = (option, { context }) => {
  return context === 'menu' ? option.label : option.value;
};

const MutatorDropdown = ({ label, options, selectedOptions, onChange, isLoading }) => (
  <div className="section">
    <label className="section-label" style={{ marginBottom: 6 }}>{label}</label>
    <Select
      isMulti
      options={options}
      value={selectedOptions}
      onChange={onChange}
      isLoading={isLoading}
      classNamePrefix="dropdown"
      placeholder="Select operators..."
      isSearchable
      formatOptionLabel={formatOptionLabel}
    />
  </div>
);

export default MutatorDropdown;
