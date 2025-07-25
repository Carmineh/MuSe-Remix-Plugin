import { useEffect, useRef } from 'react';

const ConsoleOutput = ({ messages }) => {
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [messages]);

  const consoleContent = messages.join('\n');

  return (
    <div className="section">
      <label htmlFor="console" className="section-label">
        Console Output
      </label>
      <div className="console-wrapper">
        <textarea
          ref={textareaRef}
          id="console"
          className="console"
          rows="6"
          readOnly
          value={consoleContent}
          placeholder="Ready to execute operations..."
        />
      </div>
    </div>
  );
};

export default ConsoleOutput;