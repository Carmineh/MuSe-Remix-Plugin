const ExecuteTestingButton = ({ onExecute, disabled }) => {
  return (
    <div className="section">
      <button 
        className="execute-button" 
        onClick={onExecute}
        disabled={disabled}
      >
        Test
      </button>
    </div>
  );
};

export default ExecuteTestingButton;