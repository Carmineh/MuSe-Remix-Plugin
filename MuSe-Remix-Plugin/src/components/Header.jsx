const Header = () => {
  return (
    <header className="plugin-header">
      <div className="header-content">
        <div>
          <img className="app-icon" src="logo.png" alt="MuSe Logo" />
          <span className="version-indicator" style={{ fontSize: '0.8em', color: '#666', marginLeft: '8px' }}>
            v2.1.0
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;