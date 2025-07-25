import React from 'react';
import Select from 'react-select';

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
      placeholder={`Select ${label.toLowerCase()}...`}
      isSearchable
    />
  </div>
);

export default MutatorDropdown;