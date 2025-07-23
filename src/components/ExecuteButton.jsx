const ExecuteButton = ({ onExecute, disabled }) => {
  return (
    <div className="section">
      <button 
        className="execute-button" 
        onClick={onExecute}
        disabled={disabled}
      >
        Execute Mutations
      </button>
    </div>
  );
};

export default ExecuteButton;