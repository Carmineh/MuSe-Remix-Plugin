const ExecuteMutationButton = ({ onExecute, disabled }) => {
  return (
    <div className="section">
      <button 
        className="execute-button" 
        onClick={onExecute}
        disabled={disabled}
      >
        Mutate
      </button>
    </div>
  );
};

export default ExecuteMutationButton;