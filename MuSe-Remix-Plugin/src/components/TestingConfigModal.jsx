import React, { useState, useEffect } from "react";

const frameworks = [
  { value: "brownie", label: "Brownie" },
  { value: "hardhat", label: "Hardhat" },
  { value: "forge", label: "Forge (Foundry)" },
  { value: "truffle", label: "Truffle" },
];

export default function TestingConfigModal({
  show,
  onClose = () => {},
  config = { testingFramework: "truffle", testingTimeOutInSec: 300 },
  onRun = () => {},
}) {
  const [testingFramework, setTestingFramework] = useState(config.testingFramework);
  const [testingTimeOutInSec, setTestingTimeOutInSec] = useState(config.testingTimeOutInSec);

  useEffect(() => {
    if (show) {
      setTestingFramework(config.testingFramework);
      setTestingTimeOutInSec(config.testingTimeOutInSec);
    }
  }, [show, config]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          borderRadius: "20px",
          boxShadow: "var(--shadow-card)",
          padding: "32px",
          minWidth: "340px",
          maxWidth: "90vw",
          fontSize: "20px",
          zIndex: 10000,
        }}
      >
        <h2
          style={{
            color: "var(--text-primary)",
            fontSize: "2rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          Testing Configuration
        </h2>
        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: "1rem",
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            Testing Framework:
          </label>
          <select
            value={testingFramework}
            onChange={e => setTestingFramework(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "var(--bg-input)",
              border: "2px solid var(--border-secondary)",
              borderRadius: "12px",
              fontSize: "1rem",
              color: "var(--text-primary)",
              outline: "none",
              cursor: "pointer",
              margin: 0,
              fontFamily: "inherit",
              minHeight: "24px",
              boxSizing: "border-box",
              appearance: "none",
              transition: "all 0.3s ease",
            }}
          >
            {frameworks.map(fw => (
              <option key={fw.value} value={fw.value}>
                {fw.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: "1rem",
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            Timeout (sec):
          </label>
          <input
            type="number"
            min={10}
            max={3600}
            value={testingTimeOutInSec}
            onChange={e => setTestingTimeOutInSec(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "2px solid var(--border-secondary)",
              borderRadius: "12px",
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              margin: 0,
              boxSizing: "border-box",
              transition: "all 0.3s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "12px",
          }}
        >
          <button
            style={{
              minWidth: "120px",
              maxWidth: "220px",
              padding: "12px 24px",
              fontSize: "1rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, var(--btn-gradient-start) 0%, var(--btn-gradient-end) 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "var(--shadow-button)",
              transition: "all 0.3s ease",
            }}
            onClick={() => onRun({ testingFramework, testingTimeOutInSec })}
          >
            RUN
          </button>
          <button
            style={{
              minWidth: "120px",
              maxWidth: "220px",
              padding: "12px 24px",
              fontSize: "1rem",
              fontWeight: 600,
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "2px solid var(--border-secondary)",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "none",
              transition: "all 0.3s ease",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}